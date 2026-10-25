from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from ..database import get_db
from ..models import Bill, BillItem, BillCounter, Customer
from ..schemas import BillCreate, BillOut, SMSResponse
from ..services.sms import get_sms_provider, build_bill_sms

router = APIRouter(prefix="/api/bills", tags=["bills"])


def _round2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _generate_bill_number(db: Session) -> str:
    year = datetime.utcnow().year
    counter = (
        db.query(BillCounter)
        .filter(BillCounter.year == year)
        .with_for_update()
        .first()
    )
    if counter is None:
        counter = BillCounter(year=year, last_seq=0)
        db.add(counter)
        db.flush()
    counter.last_seq += 1
    db.flush()
    return f"TH-{year}-{counter.last_seq:04d}"


@router.post("", response_model=BillOut, status_code=201)
def create_bill(payload: BillCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if payload.idempotency_key:
        existing = (
            db.query(Bill)
            .options(joinedload(Bill.items))
            .filter(Bill.bill_number == payload.idempotency_key)
            .first()
        )
        if existing:
            return existing

    subtotal = Decimal("0")
    total_discount = Decimal("0")
    bill_items = []

    for item in payload.items:
        line_subtotal = item.price * item.quantity
        line_discount = _round2(line_subtotal * (item.discount_percentage / Decimal("100")))
        line_final = _round2(line_subtotal - line_discount)

        subtotal += line_subtotal
        total_discount += line_discount

        bill_items.append(BillItem(
            product_name=item.product_name,
            category=item.category,
            quantity=item.quantity,
            price=item.price,
            discount_percentage=item.discount_percentage,
            discount_amount=line_discount,
            final_amount=line_final,
        ))

    subtotal = _round2(subtotal)
    total_discount = _round2(total_discount)
    grand_total = _round2(subtotal - total_discount)

    bill_number = _generate_bill_number(db)

    bill = Bill(
        bill_number=bill_number,
        customer_id=customer.id,
        subtotal=subtotal,
        discount_amount=total_discount,
        grand_total=grand_total,
        payment_mode=payload.payment_mode,
        status="finalized",
        created_by=None,
        items=bill_items,
    )
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill


@router.get("/{bill_number}", response_model=BillOut)
def get_bill(bill_number: str, db: Session = Depends(get_db)):
    bill = (
        db.query(Bill)
        .options(joinedload(Bill.items))
        .filter(Bill.bill_number == bill_number)
        .first()
    )
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill


@router.post("/{bill_number}/sms", response_model=SMSResponse)
def send_bill_sms(bill_number: str, db: Session = Depends(get_db)):
    bill = (
        db.query(Bill)
        .options(joinedload(Bill.customer))
        .filter(Bill.bill_number == bill_number)
        .first()
    )
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    message = build_bill_sms(bill.customer.name, bill.bill_number, str(bill.grand_total))
    provider = get_sms_provider()
    sent = provider.send(bill.customer.phone, message)

    if not sent:
        return SMSResponse(sent=False, message="SMS could not be sent. You can retry from the invoice screen.")
    return SMSResponse(sent=True, message="Bill sent via SMS.")