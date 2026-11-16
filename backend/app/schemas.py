from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    price: float
    stock: int
    image_url: Optional[str] = None

class ProductResponse(ProductCreate):
    id: int
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_address: str
    product_id: int
    quantity: int

class OrderResponse(OrderCreate):
    id: int
    total_price: float
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class InquiryCreate(BaseModel):
    customer_name: str
    customer_email: str
    message: str

class InquiryResponse(InquiryCreate):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
