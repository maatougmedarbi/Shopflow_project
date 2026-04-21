"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";

export default function CreateProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Enter a valid price greater than 0.";
    if (
      !form.quantity ||
      isNaN(Number(form.quantity)) ||
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0
    )
      e.quantity = "Enter a valid whole number for quantity.";
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("http://127.0.0.1:8081/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("You don't have permission. Seller role required.");
        return;
      }
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Failed to create product.");
        return;
      }

      setSuccess(true);
      setForm({ name: "", description: "", price: "", quantity: "" });
      setTimeout(() => router.push("/products"), 1200);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <span
            className="hover:text-[blue-500] cursor-pointer transition-colors"
            onClick={() => router.push("/products")}
          >
            Products
          </span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-700 font-medium">Create product</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create a new product</h1>
          <p className="mt-1 text-sm text-gray-500">
            Seller only — fill in the details below to add a product to the catalogue.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Success */}
          {success && (
            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Product created! Redirecting to catalogue…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex flex-col gap-5">
            <Input
              id="product-name"
              label="Product name"
              placeholder="e.g. Playstation 5"
              value={form.name}
              onChange={set("name")}
              required
              disabled={loading}
              error={errors.name}
            />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="product-description"
                className="text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="product-description"
                placeholder="Brief product description…"
                value={form.description}
                onChange={set("description")}
                disabled={loading}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="product-price"
                label="Price (DT)"
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={set("price")}
                required
                disabled={loading}
                error={errors.price}
              />
              <Input
                id="product-quantity"
                label="Quantity"
                type="number"
                placeholder="0"
                value={form.quantity}
                onChange={set("quantity")}
                required
                disabled={loading}
                error={errors.quantity}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/products")}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="create-product-btn"
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200
                  ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Creating…
                  </span>
                ) : (
                  "Create product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}