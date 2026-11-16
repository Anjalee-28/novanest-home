"use client";
import React, { useState, useEffect } from "react";
import { Package, ShoppingCart, MessageSquare, Plus, Trash2, Lock, ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState<"products" | "orders" | "inquiries">("products");

    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [inquiries, setInquiries] = useState<any[]>([]);

    const [newProduct, setNewProduct] = useState({
        name: "",
        description: "",
        category: "Vases",
        price: "",
        stock: "",
        image_url: ""
    });

    const API_URL = "/api";

    useEffect(() => {
        if (authenticated) {
            fetchAllData();
        }
    }, [authenticated]);

    const fetchAllData = async () => {
        try {
            const [pRes, oRes, iRes] = await Promise.all([
                fetch(`${API_URL}/products/`),
                fetch(`${API_URL}/orders/`),
                fetch(`${API_URL}/inquiries/`)
            ]);
            if (pRes.ok) {
                const pData = await pRes.json();
                if (Array.isArray(pData)) setProducts(pData);
            }
            if (oRes.ok) {
                const oData = await oRes.json();
                if (Array.isArray(oData)) setOrders(oData);
            }
            if (iRes.ok) {
                const iData = await iRes.json();
                if (Array.isArray(iData)) setInquiries(iData);
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "admin123") {
            setAuthenticated(true);
        } else {
            alert("Incorrect password! (Hint: use admin123)");
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`${API_URL}/products/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock)
            })
        });
        setNewProduct({ name: "", description: "", category: "Vases", price: "", stock: "", image_url: "" });
        fetchAllData();
    };

    const handleDeleteProduct = async (id: number) => {
        await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
        fetchAllData();
    };

    const handleOrderStatus = async (id: number, status: string) => {
        await fetch(`${API_URL}/orders/${id}/status?status=${status}`, { method: "PATCH" });
        fetchAllData();
    };

    const handleInquiryStatus = async (id: number, status: string) => {
        await fetch(`${API_URL}/inquiries/${id}/status?status=${status}`, { method: "PATCH" });
        fetchAllData();
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full border border-stone-200">
                    <div className="w-12 h-12 bg-stone-900 text-white rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-center text-stone-900">NovaNest Admin Portal</h2>
                    <p className="text-xs text-center text-stone-500 mt-1">Authorized employees only (Pass: admin123)</p>
                    <input
                        type="password"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-stone-300 rounded-xl px-4 py-2.5 mt-6 text-sm"
                    />
                    <button type="submit" className="w-full bg-stone-900 text-white py-2.5 rounded-xl font-medium mt-4 hover:bg-stone-800">
                        Access Dashboard
                    </button>
                    <a href="/" className="block text-center text-xs text-stone-500 mt-4 hover:underline">← Back to Store</a>
                </form>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800">
            <header className="bg-stone-900 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-lg">NovaNest Admin Dashboard</span>
                </div>
                <a href="/" className="text-xs bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> View Live Store
                </a>
            </header>

            <div className="max-w-6xl mx-auto p-6">
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${activeTab === "products" ? "bg-stone-900 text-white" : "bg-white border border-stone-200"}`}
                    >
                        <Package className="w-4 h-4" /> Products ({products.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${activeTab === "orders" ? "bg-stone-900 text-white" : "bg-white border border-stone-200"}`}
                    >
                        <ShoppingCart className="w-4 h-4" /> Orders ({orders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("inquiries")}
                        className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${activeTab === "inquiries" ? "bg-stone-900 text-white" : "bg-white border border-stone-200"}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Inquiries ({inquiries.length})
                    </button>
                </div>

                {activeTab === "products" && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <form onSubmit={handleAddProduct} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 h-fit">
                            <h3 className="font-bold text-base flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add New Product</h3>
                            <input required placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <input required placeholder="Category (e.g., Vases, Lighting)" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <div className="grid grid-cols-2 gap-2">
                                <input required type="number" step="0.01" placeholder="Price ($)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                                <input required type="number" placeholder="Stock Qty" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <input placeholder="Image URL (Unsplash link)" value={newProduct.image_url} onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <textarea placeholder="Description" rows={2} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                            <button type="submit" className="w-full bg-stone-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800">Add Product</button>
                        </form>

                        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-stone-100 text-stone-600">
                                    <tr>
                                        <th className="p-3">Product</th>
                                        <th className="p-3">Price</th>
                                        <th className="p-3">Stock</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => (
                                        <tr key={p.id} className="border-t border-stone-100">
                                            <td className="p-3 font-medium">{p.name} <span className="text-xs text-stone-400 block">{p.category}</span></td>
                                            <td className="p-3">${p.price}</td>
                                            <td className="p-3">{p.stock}</td>
                                            <td className="p-3">
                                                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "orders" && (
                    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-stone-100 text-stone-600">
                                <tr>
                                    <th className="p-3">Order ID</th>
                                    <th className="p-3">Customer</th>
                                    <th className="p-3">Product ID & Qty</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((o) => (
                                    <tr key={o.id} className="border-t border-stone-100">
                                        <td className="p-3 font-medium">#{o.id}</td>
                                        <td className="p-3">{o.customer_name}<span className="text-xs text-stone-400 block">{o.customer_address}</span></td>
                                        <td className="p-3">Product #{o.product_id} (x{o.quantity})</td>
                                        <td className="p-3 font-semibold">${o.total_price}</td>
                                        <td className="p-3">
                                            <select
                                                value={o.status}
                                                onChange={(e) => handleOrderStatus(o.id, e.target.value)}
                                                className="border rounded-lg px-2 py-1 text-xs"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "inquiries" && (
                    <div className="space-y-3">
                        {inquiries.map((inq) => (
                            <div key={inq.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-sm">{inq.customer_name} <span className="text-xs font-normal text-stone-400">({inq.customer_email})</span></h4>
                                    <p className="text-sm text-stone-700 mt-1">{inq.message}</p>
                                </div>
                                <select
                                    value={inq.status}
                                    onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                                    className="border rounded-lg px-2 py-1 text-xs"
                                >
                                    <option value="Open">Open</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
