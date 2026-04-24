"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";
import { apiFetch, getAccessToken } from "../../../lib/api";
import toast from "react-hot-toast";

export default function CreateProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    apiFetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data));
  }, []);

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (!file) {
      setImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (
      !form.price ||
      Number.isNaN(Number(form.price)) ||
      Number(form.price) <= 0
    )
      e.price = "Enter a valid price greater than 0.";
    if (
      !form.quantity ||
      Number.isNaN(Number(form.quantity)) ||
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0
    )
      e.quantity = "Enter a valid whole number for quantity.";
    return e;
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        router.push("/login");
        return;
      }

      let imageUrl = "";
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("file", imageFile);

        const uploadRes = await apiFetch("/api/products/upload-image", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const msg = await uploadRes.text();
          toast.error(msg || "Image upload failed.");
          setLoading(false);
          return;
        }

        const uploaded = await uploadRes.json();
        imageUrl = uploaded.imageUrl || "";
      }

      const res = await apiFetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          imageUrl,
          categoryIds: categoryId ? [Number(categoryId)] : [],
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("You don't have permission. Seller role required.");
        return;
      }
      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || "Failed to create product.");
        return;
      }

      toast.success("Product created!");
      setForm({ name: "", description: "", price: "", quantity: "" });
      setImageFile(null);
      setImagePreview("");
      setTimeout(() => router.push("/products"), 1200);
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <button
            type="button"
            className="hover:text-blue-500 transition-colors"
            onClick={() => router.push("/products")}
          >
            Products
          </button>
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="product-image">
                Product image
              </label>
              <input
                id="product-image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">Optional. Max size 5MB.</p>
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Selected product preview"
                  width={800}
                  height={320}
                  unoptimized
                  className="mt-2 h-40 w-full rounded-xl object-cover border border-gray-200"
                />
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="product-category">
                Category
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 disabled:opacity-50"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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