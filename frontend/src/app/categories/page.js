"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCategories(data));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Categories</h1>
      <div className="grid gap-3">
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories available.</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="rounded-2xl bg-white p-4 border">
              <p className="font-semibold">{category.name}</p>
              <p className="text-sm text-gray-500">{category.description || "No description"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
