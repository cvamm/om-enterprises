"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const SECTIONS = [
  { value: "tile", label: "Main Catalogue (Tiles & Stone)" },
  { value: "tiles-adhesive", label: "Tiles Adhesive" },
  { value: "washing-basins", label: "Washing Basins" },
  { value: "western-toilets", label: "Western Toilets" },
  { value: "mirrors", label: "Mirrors" },
  { value: "taps", label: "Taps" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export function AdminEditProduct({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface Product {
    id: string;
    name_en: string;
    name_hi?: string;
    material_type: string;
    finish: string;
    room_uses: string[];
    photo_urls: string[];
    price_per_box_inr: number;
    stock_status: string;
    nominal_dimensions_mm: number[];
    box_area_sqft: number;
    tiles_per_box: number;
    grade: string;
    shape: string;
    description_en: string;
    section_tag: string;
  }

  useEffect(() => {
    fetch(`/api/admin/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        // Normalise nullable fields so the form never renders from a null.
        const p: Product = {
          ...data,
          description_en: data.description_en ?? "",
          room_uses: Array.isArray(data.room_uses) ? data.room_uses : [],
          photo_urls: Array.isArray(data.photo_urls) ? data.photo_urls : [],
          nominal_dimensions_mm: Array.isArray(data.nominal_dimensions_mm)
            ? data.nominal_dimensions_mm
            : [0, 0, 0],
          section_tag:
            typeof data.section_tag === "string" && data.section_tag.length > 0
              ? data.section_tag
              : "tile",
        };
        setProduct(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    setMessage("");

    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (res.ok) {
      setMessage("Saved successfully!");
    } else {
      setMessage("Error saving");
    }
    setSaving(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const res = await fetch(`/api/admin/products/${productId}/upload`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = (await res.json()) as { urls: string[] };
      updateField("photo_urls", data.urls);
      setMessage("Images uploaded!");
    } else {
      setMessage("Upload failed");
    }
    setUploading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-bone/60">Loading product...</p>
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-400">Product not found</p>
      </div>
    );
  }

  function updateField<K extends keyof Product>(field: K, value: Product[K]) {
    setProduct((prev) => (prev === null ? null : { ...prev, [field]: value }));
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/admin/products" className="text-gold hover:text-gold/80 text-sm">
          Back to products
        </Link>
        <h1 className="font-display text-3xl text-bone mt-2">{product.name_en}</h1>
        <p className="text-bone/60 text-sm mt-1 font-mono">{product.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm text-bone/70 mb-2">Product Name (English)</label>
            <input
              type="text"
              value={product.name_en}
              onChange={(e) => updateField("name_en", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Product Name (Hindi)</label>
            <input
              type="text"
              value={product.name_hi ?? ""}
              onChange={(e) => updateField("name_hi", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Material Type</label>
            <select
              value={product.material_type}
              onChange={(e) => updateField("material_type", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            >
              <option value="ceramic">Ceramic</option>
              <option value="vitrified">Vitrified</option>
              <option value="porcelain">Porcelain</option>
              <option value="natural-stone">Natural Stone</option>
              <option value="engineered-marble">Engineered Marble</option>
              <option value="quartz">Quartz</option>
              <option value="mosaic">Mosaic</option>
              <option value="wood-plank">Wood Plank</option>
              <option value="terrazzo">Terrazzo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Finish</label>
            <select
              value={product.finish}
              onChange={(e) => updateField("finish", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            >
              <option value="glossy">Glossy</option>
              <option value="matte">Matte</option>
              <option value="textured">Textured</option>
              <option value="leathered">Leathered</option>
              <option value="honed">Honed</option>
              <option value="polished">Polished</option>
              <option value="rustic">Rustic</option>
              <option value="brushed">Brushed</option>
              <option value="decor">Decor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Price per Box (INR)</label>
            <input
              type="number"
              value={product.price_per_box_inr}
              onChange={(e) => updateField("price_per_box_inr", Number(e.target.value))}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Stock Status</label>
            <select
              value={product.stock_status}
              onChange={(e) => updateField("stock_status", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            >
              <option value="in-stock">In Stock</option>
              <option value="made-to-order">Made to Order</option>
              <option value="preorder">Preorder</option>
              <option value="sold-out">Sold Out</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Product Section</label>
            <select
              value={product.section_tag}
              onChange={(e) => updateField("section_tag", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            >
              {SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Dimensions (length, width, thickness in mm)</label>
            <input
              type="text"
              value={product.nominal_dimensions_mm.join(", ")}
              onChange={(e) => {
                const val = e.target.value;
                const parts = val.split(",").map((v) => {
                  const num = Number(v.trim());
                  return Number.isNaN(num) ? 0 : num;
                });
                if (parts.length === 3) {
                  updateField("nominal_dimensions_mm", parts);
                }
              }}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Box Area (sq.ft)</label>
            <input
              type="number"
              step="0.1"
              value={product.box_area_sqft}
              onChange={(e) => updateField("box_area_sqft", Number(e.target.value))}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Tiles per Box</label>
            <input
              type="number"
              value={product.tiles_per_box}
              onChange={(e) => updateField("tiles_per_box", Number(e.target.value))}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Grade</label>
            <select
              value={product.grade}
              onChange={(e) => updateField("grade", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            >
              <option value="aaa">AAA</option>
              <option value="aa">AA</option>
              <option value="a">A</option>
              <option value="b">B</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-bone/70 mb-2">Shape</label>
            <select
              value={product.shape}
              onChange={(e) => updateField("shape", e.target.value)}
              className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
            >
              <option value="square">Square</option>
              <option value="rectangular">Rectangular</option>
              <option value="hexagonal">Hexagonal</option>
              <option value="herringbone">Herringbone</option>
              <option value="tile">Tile</option>
              <option value="mosaic-sheet">Mosaic Sheet</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-bone/70 mb-2">Description (English)</label>
          <textarea
            value={product.description_en}
            onChange={(e) => updateField("description_en", e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
          />
        </div>

        <div>
          <label className="block text-sm text-bone/70 mb-2">Room Uses (comma separated)</label>
          <input
            type="text"
            value={product.room_uses?.join(", ") ?? ""}
            onChange={(e) =>
              updateField(
                "room_uses",
                e.target.value.split(",").map((r) => r.trim()).filter((r) => r.length > 0)
              )
            }
            placeholder="bathroom, kitchen, living-room"
            className="w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50"
          />
        </div>

        <div>
          <label className="block text-sm text-bone/70 mb-2">Product Images</label>
          <div className="flex gap-3 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone hover:border-bone/20 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </button>
          </div>
          {product.photo_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {product.photo_urls.map((url: string, i: number) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-full h-24 object-cover rounded" />
                  <p className="text-xs text-bone/50 mt-1 truncate">{url.split("/").pop()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gold text-ink font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message.length > 0 && (
            <span
              className={`text-sm ${message.includes("Error") || message.includes("failed") ? "text-red-400" : "text-green-400"}`}
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
