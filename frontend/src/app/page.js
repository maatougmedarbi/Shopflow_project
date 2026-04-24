"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import ProductCard from "./components/ProductCard";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/categories").then((res) => (res.ok ? res.json() : [])),
      apiFetch("/api/products/top-selling").then((res) => (res.ok ? res.json() : [])),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setTopProducts(prods);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-32 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[70vh] flex items-center justify-center rounded-[3rem] overflow-hidden bg-gray-900 text-white shadow-3xl">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.4),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/20 blur-[120px] rounded-full animate-pulse delay-700" />
        
        <div className="relative z-10 px-6 py-20 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs font-bold mb-8 tracking-widest uppercase text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            New Season Arrival
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400">Shopping</span> is Here.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
            Curated collections, lightning-fast delivery, and a seamless experience designed for the modern lifestyle.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link
              href="/products"
              className="px-10 py-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 active:scale-95"
            >
              Shop Collection
            </Link>
            <Link
              href="/signup"
              className="px-10 py-5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white font-black text-lg transition-all hover:-translate-y-1 active:scale-95"
            >
              Join the Club
            </Link>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
        {[
          { label: "Active Users", value: "50K+" },
          { label: "Countries", value: "24+" },
          { label: "Products", value: "5000+" },
          { label: "Support", value: "24/7" },
        ].map((stat, i) => (
          <div key={i} className="text-center group">
            <p className="text-4xl font-black text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{stat.value}</p>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* CATEGORIES STRIP */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Categories</h2>
            <p className="text-gray-500 mt-2 font-medium">Find exactly what you're looking for</p>
          </div>
          <Link href="/products" className="group flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
            Explore All Categories <span className="text-xl">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[280px] h-40 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/products?categoryId=${cat.id}`}
                className="snap-start min-w-[280px] relative h-40 rounded-3xl overflow-hidden group border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">
                    {cat.name?.[0]}
                  </div>
                  <h3 className="text-xl font-black text-gray-800">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TRENDING SECTION */}
      <section className="max-w-7xl mx-auto bg-gray-900 -mx-4 sm:mx-0 px-4 sm:px-12 py-24 rounded-[3.5rem] text-white">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black tracking-tight mb-4">Trending Now</h2>
          <p className="text-gray-400 font-medium">Handpicked favorites for your collection</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-96 rounded-3xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No products available yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topProducts.slice(0, 8).map((product) => (
              <div key={product.id} className="text-gray-900">
                <ProductCard 
                  product={product} 
                  onBuy={(id) => {
                    window.location.href = `/products/${id}`;
                  }} 
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-20 text-white text-center shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Don't miss the drop.</h2>
            <p className="text-blue-100 mb-10 text-lg font-medium">
              Subscribe to our newsletter and get early access to new collections and exclusive discounts.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-blue-100 outline-none focus:bg-white/20 transition-all font-medium"
              />
              <button 
                type="button" 
                className="px-8 py-4 rounded-2xl bg-white text-blue-600 font-black hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                Join Now
              </button>
            </form>
            <p className="mt-6 text-xs text-blue-200 font-medium opacity-60">We respect your privacy. No spam, ever.</p>
          </div>
        </div>
      </section>

    </div>
  );
}