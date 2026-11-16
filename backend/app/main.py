from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, ai_agent

from .database import engine, get_db


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NovaNest Home API")

# Frontend එක සම්බන්ධ කරන්න CORS අවසරය දීම
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to NovaNest Home API"}

# --- PRODUCTS API ---
@app.post("/products/", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/", response_model=List[schemas.ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

# --- ORDERS API ---
@app.post("/orders/", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < order.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    total_price = product.price * order.quantity
    product.stock -= order.quantity # ස්ටොක් එකෙන් අඩු කිරීම
    
    db_order = models.Order(**order.model_dump(), total_price=total_price)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@app.get("/orders/", response_model=List[schemas.OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).all()

# --- INQUIRIES API ---
@app.post("/inquiries/", response_model=schemas.InquiryResponse)
def create_inquiry(inquiry: schemas.InquiryCreate, db: Session = Depends(get_db)):
    db_inquiry = models.Inquiry(**inquiry.model_dump())
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    return db_inquiry

@app.get("/inquiries/", response_model=List[schemas.InquiryResponse])
def get_inquiries(db: Session = Depends(get_db)):
    return db.query(models.Inquiry).all()

@app.post("/chat/", response_model=schemas.ChatResponse)
def chat_with_assistant(chat: schemas.ChatRequest, db: Session = Depends(get_db)):
    reply = ai_agent.ask_novanest_ai(chat.message, db)
    return {"reply": reply}
