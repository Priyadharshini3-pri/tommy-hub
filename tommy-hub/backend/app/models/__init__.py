from sqlalchemy import (
    Column, Integer, String, DECIMAL, TIMESTAMP, ForeignKey, Enum, func
)
from sqlalchemy.orm import relationship
from ..database import Base

CATEGORY_ENUM = Enum(
    "Shirt", "Pant", "Footwear", "Trouser", "Track", "T-Shirt", "Accessories",
    name="category_enum",
)


class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("cashier", "admin", name="role_enum"), default="cashier")
    created_at = Column(TIMESTAMP, server_default=func.now())


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    phone = Column(String(10), unique=True, nullable=False, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    bills = relationship("Bill", back_populates="customer")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(CATEGORY_ENUM, nullable=False, index=True)
    product_name = Column(String(100), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    stock_qty = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())


class BillCounter(Base):
    __tablename__ = "bill_counters"
    year = Column(Integer, primary_key=True)
    last_seq = Column(Integer, nullable=False, default=0)


class Bill(Base):
    __tablename__ = "bills"
    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(20), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=True)
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    discount_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    grand_total = Column(DECIMAL(10, 2), nullable=False)
    payment_mode = Column(Enum("Cash", "UPI", "Card", name="payment_enum"), nullable=False)
    status = Column(Enum("draft", "finalized", "void", name="status_enum"), default="finalized")
    created_by = Column(Integer, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    customer = relationship("Customer", back_populates="bills")
    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan")


class BillItem(Base):
    __tablename__ = "bill_items"
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(100), nullable=False)
    category = Column(String(30), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    discount_percentage = Column(DECIMAL(5, 2), nullable=False, default=0)
    discount_amount = Column(DECIMAL(10, 2), nullable=False, default=0)
    final_amount = Column(DECIMAL(10, 2), nullable=False)

    bill = relationship("Bill", back_populates="items")
