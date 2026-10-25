import re
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Literal
from pydantic import BaseModel, field_validator, ConfigDict

PHONE_RE = re.compile(r"^[6-9]\d{9}$")


# ---------- Auth ----------
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Customer ----------
class CustomerCreate(BaseModel):
    name: str
    phone: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not (2 <= len(v) <= 50):
            raise ValueError("Name must be between 2 and 50 characters")
        return v

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, v: str) -> str:
        if not PHONE_RE.match(v):
            raise ValueError("Phone must be a valid 10-digit Indian mobile number")
        return v


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str
    created_at: datetime
    previous_visits: int = 0


# ---------- Product ----------
class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    category: str
    product_name: str
    price: Decimal
    stock_qty: int


# ---------- Bill item ----------
class BillItemIn(BaseModel):
    product_name: str
    category: str
    quantity: int
    price: Decimal
    discount_percentage: Decimal = Decimal("0")

    @field_validator("quantity")
    @classmethod
    def positive_qty(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

    @field_validator("price")
    @classmethod
    def positive_price(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Price must be greater than 0")
        return v

    @field_validator("discount_percentage")
    @classmethod
    def valid_discount(cls, v: Decimal) -> Decimal:
        if v < 0 or v > 100:
            raise ValueError("Discount percentage must be between 0 and 100")
        return v


class BillItemOut(BillItemIn):
    id: int
    discount_amount: Decimal
    final_amount: Decimal
    model_config = ConfigDict(from_attributes=True)


# ---------- Bill ----------
class BillCreate(BaseModel):
    customer_id: int
    payment_mode: Literal["Cash", "UPI", "Card"]
    items: List[BillItemIn]
    idempotency_key: Optional[str] = None

    @field_validator("items")
    @classmethod
    def at_least_one_item(cls, v):
        if not v:
            raise ValueError("A bill must contain at least one item")
        return v


class BillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    bill_number: str
    customer_id: int
    subtotal: Decimal
    discount_amount: Decimal
    grand_total: Decimal
    payment_mode: str
    status: str
    created_at: datetime
    items: List[BillItemOut]


class SMSResponse(BaseModel):
    sent: bool
    message: str
