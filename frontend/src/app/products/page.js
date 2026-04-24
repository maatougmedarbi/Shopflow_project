"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "../components/ProductCard";
import { apiFetch, getAccessToken } from "../../lib/api";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState(null);
  const filtersRef = useRef({ query: "", categoryId: "", minPrice: "", maxPrice: "" });

  const router = useRouter();

  useEffect(() => {
    filtersRef.current = { query, categoryId, minPrice, maxPrice };
  }, [query, categoryId, minPrice, maxPrice]);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data));
  }, []);

  const fetchProducts = useCallback(async ({ pageOverride = 0, query = "", categoryId = "", minPrice = "", maxPrice = "" } = {}) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (categoryId) params.set("categoryId", categoryId);
        if (minPrice.trim()) params.set("minPrice", minPrice.trim());
        if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
        params.set("page", String(pageOverride));
        params.set("size", "9");
        params.set("sortBy", "newest");

        const res = await apiFetch(`/api/products/paged?${params.toString()}`);

        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        const data = await res.json();
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }, []);

  const handleOrder = async (productId) => {
    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    setBuyingId(productId);

    try {
      const res = await apiFetch(`/api/cart/items?productId=${productId}&quantity=1`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Added to cart");
        fetchProducts({ pageOverride: page });
      } else {
        const msg = await res.text();
        toast.error(msg || "Add to cart failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBuyingId(null);
    }
  };

  useEffect(() => {
    fetchProducts({ pageOverride: page, ...filtersRef.current });
  }, [page, fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `${products.length} products`}
          </p>
        </div>

        <button
          onClick={() => fetchProducts({ pageOverride: page, ...filtersRef.current })}
          className="text-sm text-gray-600 hover:text-blue-500"
        >
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min price"
          type="number"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max price"
          type="number"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />
        <button
          onClick={() => {
            setPage(0);
            fetchProducts({ pageOverride: 0, query, categoryId, minPrice, maxPrice });
          }}
          className="rounded-xl bg-blue-500 text-white px-4 py-2 text-sm"
        >
          Filter
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-6">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={handleOrder}
              buying={buyingId === product.id}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-xl border px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}