from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, ai_agent

from .database import engine, get_db


models.Base.metadata.create_all(bind=engine)

# Auto-seed initial products if database is empty
def seed_initial_products():
    db = next(get_db())
    if db.query(models.Product).count() == 0:
        sample_products = [
            models.Product(name="Minimalist Ceramic Vase", description="Handcrafted matte white ceramic vase perfect for dried pampas grass.", category="Vases", price=45.0, stock=15, image_url="https://pexels.com"),
            models.Product(name="Woven Boho Throw Pillow", description="Soft organic cotton and linen textured cushion cover with insert.", category="Cushions", price=32.0, stock=20, image_url="https://pexels.com"),
            models.Product(name="Nordic Warm Table Lamp", description="Modern wooden base bedside lamp with warm ambient shade.", category="Lighting", price=78.5, stock=8, image_url="https://pexels.com"),
            models.Product(name="Botanical Framed Wall Art", description="Minimalist neutral-toned botanical print in solid oak frame.", category="Wall Art", price=64.0, stock=10, image_url="https://pexels.com"),
            models.Product(name="Soy Wax Scented Candle Set", description="Hand-poured natural soy candles with sandalwood and vanilla.", category="Home Fragrance", price=28.0, stock=25, image_url="https://pexels.com"),
            models.Product(name="Rattan Woven Storage Basket", description="Eco-friendly handwoven seagrass basket for living room.", category="Storage", price=52.0, stock=0, image_url="https://pexels.com"),
        ]
        db.add_all(sample_products)
        db.commit()

seed_initial_products()

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
