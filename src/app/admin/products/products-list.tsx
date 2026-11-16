"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name_en: string;
  slug: string;
  material_type: string;
  finish: string;
  room_uses: string[];
  photo_urls: string[];
  created_at: string;
}

export function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search.length > 0) params.set("search", search);
      if (room.length > 0) params.set("room", room);

      const res = await fetch(`/api/admin/products?${params}`, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotal(data.total);
      }
      setLoading(false);
    }
    void loadProducts();
    return () => controller.abort();
  }, [page, search, room]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-bone">Products</h1>
          <p className="text-bone/60 mt-1">Total: {total} products</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone text-sm"
          />
          <select
            value={room}
            onChange={(e) => { setRoom(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone text-sm"
          >
            <option value="">All rooms</option>
            <option value="bathroom">Bathroom</option>
            <option value="kitchen">Kitchen</option>
            <option value="living-room">Living Room</option>
            <option value="bedroom">Bedroom</option>
            <option value="flooring">Flooring</option>
            <option value="wall-cladding">Wall Cladding</option>
            <option value="balcony">Balcony</option>
            <option value="exterior">Exterior</option>
            <option value="commercial">Commercial</option>
            <option value="pool">Pool</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-bone/60">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-bone/60 py-12">No products found</p>
      ) : (
        <>
          <div className="grid gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-ink-2 border border-bone/10 rounded-lg hover:border-bone/20"
              >
                {Array.isArray(product.photo_urls) && product.photo_urls.length > 0 && product.photo_urls[0] !== undefined && product.photo_urls[0] !== null && (
                  <img
                    src={product.photo_urls[0]}
                    alt={product.name_en}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-bone font-medium truncate">{product.name_en}</h3>
                  <p className="text-bone/60 text-sm">{product.slug}</p>
                  <div className="flex gap-2 mt-1">
                    {Array.isArray(product.room_uses) && product.room_uses.length > 0 ? product.room_uses.map((r) => (
                      <span key={r} className="text-xs px-2 py-0.5 bg-bone/10 rounded text-bone/70">
                        {r}
                      </span>
                    )) : null}
                  </div>
                </div>
                <div className="text-right text-sm text-bone/60">
                  <p>{product.material_type}</p>
                  <p>{product.finish}</p>
                </div>
                <Link
                  href={`/admin/products/${product.id}`}
                  className="px-4 py-2 bg-gold text-ink rounded-lg hover:bg-gold/90 text-sm font-medium"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>

          {total > 50 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone disabled:opacity-30"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-bone/60">
                Page {page} of {Math.ceil(total / 50)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 50 >= total}
                className="px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
