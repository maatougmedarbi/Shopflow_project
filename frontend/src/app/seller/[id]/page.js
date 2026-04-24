"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import ProductCard from "../../components/ProductCard";

export default function SellerStorePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([
      apiFetch(`/api/seller/profile/${id}`).then((res) => {
        if (!res.ok) throw new Error("Store not found");
        return res.json();
      }),
      apiFetch(`/api/products/seller/${id}`).then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([prof, prods]) => {
        setProfile(prof);
        setProducts(prods);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto py-20 text-center">Loading store details...</div>;
  if (error) return <div className="max-w-5xl mx-auto py-20 text-center text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-12">
      {/* Store Header */}
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 rounded-[2rem] p-10 md:p-16 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 bg-white rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center text-gray-400 font-bold text-4xl">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt={profile.storeName} className="w-full h-full object-cover" />
            ) : (
              profile.storeName?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{profile.storeName}</h1>
            {profile.description ? (
              <p className="text-blue-100 text-lg max-w-2xl">{profile.description}</p>
            ) : (
              <p className="text-blue-200 italic">Welcome to my store! We offer the best quality products.</p>
            )}
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-sm font-semibold text-blue-200">
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">Verified Seller</span>
              <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">{products.length} Products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products */}
      <div className="px-4 sm:px-0">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">This seller has no products listed yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
