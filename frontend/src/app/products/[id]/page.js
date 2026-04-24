"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch, getAccessToken } from "../../../lib/api";
import toast from "react-hot-toast";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  
  // Variants selection state
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
    : 0;

  const load = useCallback(async () => {
    const [productRes, reviewsRes] = await Promise.all([
      apiFetch(`/api/products/${id}`),
      apiFetch(`/api/reviews/product/${id}`),
    ]);

    if (productRes.ok) {
      const data = await productRes.json();
      setProduct(data);
      // Auto-select first available variant properties if they exist
      if (data.variants && data.variants.length > 0) {
        const uniqueSizes = [...new Set(data.variants.map(v => v.size).filter(Boolean))];
        const uniqueColors = [...new Set(data.variants.map(v => v.color).filter(Boolean))];
        if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);
        if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0]);
      }
    }
    if (reviewsRes.ok) {
      setReviews(await reviewsRes.json());
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const addToCart = async () => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    const res = await apiFetch(`/api/cart/items?productId=${id}&quantity=1`, {
      method: "POST",
    });

    if (res.ok) {
      toast.success("Added to cart");
      return;
    }

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    toast.error("Failed to add to cart");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    const res = await apiFetch(`/api/reviews?productId=${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: Number(rating), comment }),
    });
    if (res.ok) {
      toast.success("Review submitted! Admins will check it.");
      setComment("");
    } else if (res.status === 401) {
      router.push("/login");
    } else {
      const msg = await res.text();
      toast.error(msg || "Review failed");
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Derive unique sizes and colors
  const sizes = product.variants ? [...new Set(product.variants.map(v => v.size).filter(Boolean))] : [];
  const colors = product.variants ? [...new Set(product.variants.map(v => v.color).filter(Boolean))] : [];
  
  // Find current active variant based on selections
  let activeVariant = null;
  if (product.variants && product.variants.length > 0) {
    activeVariant = product.variants.find(v => 
      (v.size === selectedSize || (!v.size && !selectedSize)) && 
      (v.color === selectedColor || (!v.color && !selectedColor))
    ) || product.variants[0];
  }

  const displayQuantity = activeVariant ? activeVariant.stockQuantity : product.quantity;
  const isOutOfStock = displayQuantity <= 0;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      
      <div className="grid md:grid-cols-2 gap-10">
        {/* Left Column: Image */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-sm h-fit">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={1200}
              height={1200}
              unoptimized
              className="w-full h-auto aspect-square object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          {product.categoryNames && (
            <span className="text-blue-600 font-semibold text-sm tracking-wide uppercase mb-2">
              {product.categoryNames}
            </span>
          )}
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center text-yellow-400 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
              <span className="text-sm font-bold text-yellow-700 mr-1">{averageRating.toFixed(1)}</span>
              <span>★</span>
            </div>
            <span className="text-sm text-gray-500 underline decoration-gray-300">
              {reviews.length} reviews
            </span>
          </div>
          
          <p className="text-4xl font-bold text-gray-900 mb-6">
            {Number(product.price).toFixed(2)} <span className="text-xl text-gray-500 font-medium">DT</span>
          </p>

          <p className="text-gray-600 leading-relaxed mb-8 border-b border-gray-100 pb-8">
            {product.description}
          </p>

          {/* Variants Selector */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Size</h3>
              <div className="flex flex-wrap gap-3">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedSize === size ? "bg-gray-900 text-white border-gray-900 shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Color</h3>
              <div className="flex flex-wrap gap-3">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${selectedColor === color ? "bg-gray-900 text-white border-gray-900 shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Actions */}
          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${isOutOfStock ? "bg-red-500" : displayQuantity <= 5 ? "bg-orange-500" : "bg-green-500"}`} />
              <span className={`text-sm font-semibold ${isOutOfStock ? "text-red-600" : displayQuantity <= 5 ? "text-orange-600" : "text-green-600"}`}>
                {isOutOfStock ? "Out of stock" : `${displayQuantity} available in stock`}
              </span>
            </div>

            <button 
              onClick={addToCart} 
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all shadow-lg ${isOutOfStock ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] hover:shadow-xl"}`}
            >
              {isOutOfStock ? "Unavailable" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Seller Profile Card */}
      {product.sellerId && (
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-3xl p-6 md:p-8 flex items-center justify-between gap-6 mt-8">
          <div>
            <p className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-1">Sold By</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{product.sellerStoreName || "Independent Seller"}</h3>
            <p className="text-gray-600 text-sm">Quality products and reliable shipping.</p>
          </div>
          <Link href={`/seller/${product.sellerId}`} className="px-6 py-3 rounded-xl bg-white text-blue-600 font-bold shadow-sm hover:shadow-md transition-all border border-blue-100 whitespace-nowrap">
            Visit Store
          </Link>
        </div>
      )}

      {/* Reviews Section */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 italic">No approved reviews yet. Be the first to share your thoughts!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">{r.customerName}</span>
                    <div className="flex text-yellow-400 text-sm">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  <p className="text-gray-700">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                <select
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>{v} Stars</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={4}
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <button className="w-full rounded-xl bg-gray-900 px-4 py-3 text-white font-bold transition-all hover:bg-black hover:shadow-lg active:scale-[0.98]" type="submit">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
