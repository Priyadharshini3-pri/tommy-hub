from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Customer, Bill
from ..schemas import CustomerCreate, CustomerOut

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("/lookup", response_model=CustomerOut)
def lookup_customer(phone: str = Query(..., min_length=10, max_length=10), db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if not customer:
        raise HTTPException(status_code=404, detail="No customer found for this number")
    visit_count = db.query(func.count(Bill.id)).filter(Bill.customer_id == customer.id).scalar()
    out = CustomerOut.model_validate(customer)
    out.previous_visits = visit_count or 0
    return out


@router.post("", response_model=CustomerOut, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter(Customer.phone == payload.phone).first()
    if existing:
        return CustomerOut.model_validate(existing)
    customer = Customer(name=payload.name, phone=payload.phone)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerOut.model_validate(customer)