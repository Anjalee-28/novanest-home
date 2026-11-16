import os
from google import genai
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from . import models

load_dotenv()

def ask_novanest_ai(user_message: str, db: Session) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY is missing in .env file!"

    try:
        client = genai.Client(api_key=api_key)
        products = db.query(models.Product).all()
        
        if not products:
            product_catalog = "No products available yet."
        else:
            product_catalog = "\n".join([
                f"- {p.name} ({p.category}): ${p.price}, Stock: {p.stock}"
                for p in products
            ])

        prompt = f"You are NovaNest Home's helpful AI shopping assistant. Catalog:\n{product_catalog}\n\nCustomer: {user_message}\nAssistant:"

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        return f"AI Error: {str(e)}"
