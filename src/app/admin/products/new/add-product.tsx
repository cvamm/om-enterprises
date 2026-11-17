"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const MATERIALS = [
  { value: "ceramic", label: "Ceramic" },
  { value: "vitrified", label: "Vitrified" },
  { value: "porcelain", label: "Porcelain" },
  { value: "natural-stone", label: "Natural Stone" },
  { value: "engineered-marble", label: "Engineered Marble" },
  { value: "quartz", label: "Quartz" },
  { value: "mosaic", label: "Mosaic" },
  { value: "wood-plank", label: "Wood Plank" },
  { value: "terrazzo", label: "Terrazzo" },
];

const FINISHES = [
  { value: "glossy", label: "Glossy" },
  { value: "matte", label: "Matte" },
  { value: "textured", label: "Textured" },
  { value: "leathered", label: "Leathered" },
  { value: "honed", label: "Honed" },
  { value: "polished", label: "Polished" },
  { value: "rustic", label: "Rustic" },
  { value: "brushed", label: "Brushed" },
  { value: "decor", label: "Decor" },
];

const SHAPES = [
  { value: "square", label: "Square" },
  { value: "rectangular", label: "Rectangular" },
  { value: "hexagonal", label: "Hexagonal" },
  { value: "herringbone", label: "Herringbone" },
  { value: "tile", label: "Tile" },
  { value: "mosaic-sheet", label: "Mosaic Sheet" },
];

const ROOMS = [
  "bathroom",
  "kitchen",
  "living-room",
  "bedroom",
  "flooring",
  "wall-cladding",
  "exterior",
  "commercial",
  "pool",
  "balcony",
];

const GRADES = [
  { value: "aaa", label: "AAA" },
  { value: "aa", label: "AA" },
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

const STOCK = [
  { value: "in-stock", label: "In Stock" },
  { value: "made-to-order", label: "Made to Order" },
  { value: "preorder", label: "Preorder" },
  { value: "sold-out", label: "Sold Out" },
];

const SECTIONS = [
  { value: "tile", label: "Main Catalogue (Tiles & Stone)" },
  { value: "tiles-adhesive", label: "Tiles Adhesive" },
  { value: "washing-basins", label: "Washing Basins" },
  { value: "western-toilets", label: "Western Toilets" },
  { value: "mirrors", label: "Mirrors" },
  { value: "taps", label: "Taps" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

export function AdminAddProduct() {
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [material, setMaterial] = useState("ceramic");
  const [finish, setFinish] = useState("glossy");
  const [shape, setShape] = useState("square");
  const [roomUses, setRoomUses] = useState<string[]>([]);
  const [dims, setDims] = useState({ l: 0, w: 0, t: 0 });
  const [boxArea, setBoxArea] = useState(0);
  const [tilesPerBox, setTilesPerBox] = useState(0);
  const [price, setPrice] = useState(0);
  const [moq, setMoq] = useState(1);
  const [grade, setGrade] = useState("aaa");
  const [stock, setStock] = useState("in-stock");
  const [section, setSection] = useState("tile");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleRoom(room: string) {
    setRoomUses((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const res = await fetch("/api/admin/products/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setPhotos((prev) => [...prev, ...(data.urls ?? [])]);
      setMessage("Images uploaded.");
    } else {
      setMessage("Image upload failed.");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/admin/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name_en: name,
        name_hi: nameHi !== "" ? nameHi : null,
        material_type: material,
        finish,
        shape,
        room_uses: roomUses,
        nominal_dimensions_mm: [dims.l, dims.w, dims.t],
        box_area_sqft: boxArea,
        tiles_per_box: tilesPerBox,
        price_per_box_inr: price,
        moq_boxes: moq,
        grade,
        stock_status: stock,
        section_tag: section,
        photo_urls: photos,
        description_en: description !== "" ? description : null,
      }),
    });

    if (res.ok) {
      window.location.href = "/admin/products";
    } else {
      const data = await res.json();
      setMessage(`Error: ${data.error ?? "Failed to create product"}`);
    }
    setSaving(false);
  }

  const inputCls =
    "w-full px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone focus:outline-none focus:border-gold/50 text-sm";
  const labelCls = "block text-sm text-bone/70 mb-2";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/admin/products" className="text-gold hover:text-gold/80 text-sm">
          Back to products
        </Link>
        <h1 className="font-display text-3xl text-bone mt-2">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelCls}>Product Name (English) *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Product Name (Hindi)</label>
            <input
              type="text"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Material Type</label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} className={inputCls}>
              {MATERIALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Finish</label>
            <select value={finish} onChange={(e) => setFinish(e.target.value)} className={inputCls}>
              {FINISHES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value)} className={inputCls}>
              {SHAPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Grade</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className={inputCls}>
              {GRADES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Price per Box (INR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Stock Status</label>
            <select value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls}>
              {STOCK.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Product Section (where it will show on the website)</label>
            <select value={section} onChange={(e) => setSection(e.target.value)} className={inputCls}>
              {SECTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Dimensions (length, width, thickness in mm)</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                value={dims.l}
                onChange={(e) => setDims({ ...dims, l: Number(e.target.value) })}
                className={inputCls}
                placeholder="Length"
              />
            </div>
            <div>
              <input
                type="number"
                value={dims.w}
                onChange={(e) => setDims({ ...dims, w: Number(e.target.value) })}
                className={inputCls}
                placeholder="Width"
              />
            </div>
            <div>
              <input
                type="number"
                value={dims.t}
                onChange={(e) => setDims({ ...dims, t: Number(e.target.value) })}
                className={inputCls}
                placeholder="Thickness"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={labelCls}>Coverage per Box (sq.ft)</label>
            <input
              type="number"
              step="0.1"
              value={boxArea}
              onChange={(e) => setBoxArea(Number(e.target.value))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Pieces per Box</label>
            <input
              type="number"
              value={tilesPerBox}
              onChange={(e) => setTilesPerBox(Number(e.target.value))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Minimum Order (boxes)</label>
            <input
              type="number"
              value={moq}
              onChange={(e) => setMoq(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Room Uses (select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {ROOMS.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => toggleRoom(room)}
                className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wide border transition-colors ${
                  roomUses.includes(room)
                    ? "bg-gold text-ink border-gold"
                    : "bg-ink-2 border-bone/10 text-bone/70 hover:border-bone/30"
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Product Images</label>
          <div className="flex gap-3 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-ink-2 border border-bone/10 rounded-lg text-bone hover:border-bone/20 disabled:opacity-50 text-sm"
            >
              {uploading ? "Uploading..." : "Upload Images"}
            </button>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {photos.map((url, i) => (
                <div key={i} className="relative">
                  <img src={url} alt="" className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-ink/80 text-bone text-xs rounded px-1"
                  >
                    remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || name.length === 0}
            className="px-6 py-3 bg-gold text-ink font-semibold rounded-lg hover:bg-gold/90 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Product"}
          </button>
          {message.length > 0 && (
            <span className={`text-sm ${message.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
