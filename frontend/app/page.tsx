"use client";
import React, { useState, useEffect } from "react";
import { ShoppingBag, MessageCircle, X, Send, Sparkles, CheckCircle, HelpCircle, Shield } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
}

export default function NovaNestStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({ customer_name: "", customer_email: "", customer_address: "", quantity: 1 });
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ customer_name: "", customer_email: "", message: "" });
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hi! Welcome to NovaNest Home. Ask me about our décor items, check stock availability, or get recommendations!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  const API_URL = "https://novanest-home.vercel.app";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products/`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const res = await fetch(`${API_URL}/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderForm,
          product_id: selectedProduct.id,
        }),
      });
      if (res.ok) {
        setOrderSuccess(true);
        fetchProducts();
        setTimeout(() => {
          setOrderSuccess(false);
          setSelectedProduct(null);
          setOrderForm({ customer_name: "", customer_email: "", customer_address: "", quantity: 1 });
        }, 2000);
      } else {
        const err = await res.json();
        alert(err.detail || "Order failed");
      }
    } catch (error) {
      alert("Error placing order");
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/inquiries/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm),
      });
      if (res.ok) {
        setInquirySuccess(true);
        setTimeout(() => {
          setInquirySuccess(false);
          setShowInquiryModal(false);
          setInquiryForm({ customer_name: "", customer_email: "", message: "" });
        }, 2000);
      }
    } catch (error) {
      alert("Failed to send inquiry");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setAiTyping(true);

    try {
      const res = await fetch(`${API_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "ai", text: "Sorry, I am having trouble connecting to the store right now." }]);
    } finally {
      setAiTyping(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-stone-800 text-white rounded-lg flex items-center justify-center font-serif font-bold">N</div>
          <span className="text-xl font-serif font-semibold tracking-tight text-stone-900">NovaNest Home</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowInquiryModal(true)}
            className="text-sm font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" /> Contact Us
          </button>
          
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold bg-amber-100/70 px-3 py-1 rounded-full">
            Curated Living Spaces
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mt-4 leading-tight">
            Elevate Your Home With Timeless Décor
          </h1>
          <p className="text-stone-600 mt-4 text-lg leading-relaxed">
            Discover handcrafted ceramics, organic textiles, and minimalist accents designed to bring warmth and serenity to every room.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#catalog" className="bg-stone-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-stone-800 transition">
              Shop Collection
            </a>
            <button
              onClick={() => setChatOpen(true)}
              className="bg-white border border-stone-300 text-stone-800 px-6 py-3 rounded-xl font-medium hover:bg-stone-50 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" /> Ask AI Stylist
            </button>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl border border-stone-200">
          <img
            src="/image.jpeg"
            alt="NovaNest Living Room"
            className="w-full h-[400px] object-cover"
          />
        </div>
      </header>

      <main id="catalog" className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900">Featured Collection</h2>
            <p className="text-stone-500 text-sm mt-1">Real-time inventory updated automatically</p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500">No products available yet. Add products from the Admin Portal!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition flex flex-col">
                <div className="h-60 bg-stone-100 relative">
                  <img
                    src={product.image_url || "https://unsplash.com"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-stone-700">
                    {product.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-lg text-stone-900">{product.name}</h3>
                      <span className="font-bold text-lg text-stone-900">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-stone-500 text-sm mt-2 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                    <button
                      disabled={product.stock === 0}
                      onClick={() => setSelectedProduct(product)}
                      className="bg-stone-900 disabled:bg-stone-300 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-stone-800 transition flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" /> Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg">Place Your Order</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>
            {orderSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-stone-900">Order Confirmed!</h4>
                <p className="text-stone-500 text-sm mt-1">Thank you for shopping with NovaNest Home.</p>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="mt-4 space-y-4">
                <div className="bg-stone-50 p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{selectedProduct.name}</p>
                    <p className="text-xs text-stone-500">${selectedProduct.price} each</p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={selectedProduct.stock}
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) })}
                    className="w-16 border border-stone-300 rounded-lg px-2 py-1 text-center text-sm"
                  />
                </div>
                <input
                  required
                  placeholder="Full Name"
                  value={orderForm.customer_name}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  value={orderForm.customer_email}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_email: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
                <textarea
                  required
                  placeholder="Delivery Address"
                  rows={2}
                  value={orderForm.customer_address}
                  onChange={(e) => setOrderForm({ ...orderForm, customer_address: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
                <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition">
                  Confirm Order (${(selectedProduct.price * orderForm.quantity).toFixed(2)})
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg">Send Customer Inquiry</h3>
              <button onClick={() => setShowInquiryModal(false)} className="text-stone-400 hover:text-stone-700"><X className="w-5 h-5" /></button>
            </div>
            {inquirySuccess ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-stone-900">Message Sent!</h4>
                <p className="text-stone-500 text-sm mt-1">Our team will reply to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="mt-4 space-y-4">
                <input
                  required
                  placeholder="Your Name"
                  value={inquiryForm.customer_name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, customer_name: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
                <input
                  required
                  type="email"
                  placeholder="Your Email"
                  value={inquiryForm.customer_email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, customer_email: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
                <textarea
                  required
                  placeholder="How can we help you?"
                  rows={3}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm"
                />
                <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition">
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-40">
        {chatOpen ? (
          <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[380px]">
            <div className="bg-stone-900 text-white px-4 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <h4 className="text-sm font-semibold">NovaNest AI Assistant</h4>
                  <p className="text-[11px] text-stone-300">Ask about stock, décor & orders</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-stone-300 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${m.sender === "user" ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-800 shadow-2xs"}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiTyping && <div className="text-xs text-stone-400 italic">AI is checking catalog...</div>}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 text-sm border border-stone-300 rounded-xl px-3 py-2 focus:outline-none focus:border-stone-800"
              />
              <button type="submit" className="bg-stone-900 text-white p-2.5 rounded-xl hover:bg-stone-800 transition">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="bg-stone-900 text-white px-5 py-3.5 rounded-full shadow-xl hover:bg-stone-800 transition flex items-center gap-2 font-medium text-sm"
          >
            <MessageCircle className="w-5 h-5 text-amber-400" /> AI Assistant
          </button>
        )}
      </div>
    </div>
  );
}
