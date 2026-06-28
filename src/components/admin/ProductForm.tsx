"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Category = { id: string; name: string; sportId: string };

type ProductFormData = {
  name: string;
  slug: string;
  brand: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
  weightGrip: string | null;
  balancePoint: string | null;
  flexibility: string | null;
  stringTension: string | null;
  material: string | null;
  shoeSizeRange: string | null;
  terrainType: string | null;
  cushioning: string | null;
  dropHeight: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  categoryId: string;
  imageUrls: string[];
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductForm({
  sports,
  categories,
  initialData,
  productId,
}: {
  sports: { id: string; name: string }[];
  categories: Category[];
  initialData?: ProductFormData;
  productId?: string;
}) {
  const router = useRouter();
  const isEditing = Boolean(productId);

  // Determine initial sport based on category
  const initialSportId = initialData
    ? categories.find((c) => c.id === initialData.categoryId)?.sportId
    : sports[0]?.id ?? "";

  const [form, setForm] = useState<ProductFormData>(
    initialData ?? {
      name: "",
      slug: "",
      brand: "Victor",
      description: "",
      price: 0,
      compareAtPrice: null,
      stock: 0,
      sku: null,
      weightGrip: null,
      balancePoint: null,
      flexibility: null,
      stringTension: null,
      material: null,
      shoeSizeRange: null,
      terrainType: null,
      cushioning: null,
      dropHeight: null,
      isPublished: true,
      isFeatured: false,
      categoryId: categories.find((c) => c.sportId === initialSportId)?.id ?? "",
      imageUrls: [],
    }
  );
  const [selectedSportId, setSelectedSportId] = useState(initialSportId);
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter categories to only those in the selected sport
  const sportCategories = categories.filter((c) => c.sportId === selectedSportId);

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(value: string) {
    update("name", value);
    if (!slugTouched) {
      update("slug", slugify(value));
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      update("imageUrls", [...form.imageUrls, data.url]);
    } catch {
      setError("Could not upload image. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    update("imageUrls", form.imageUrls.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const endpoint = isEditing ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not save product");
        setSaving(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="border border-track-orange bg-track-orange/5 px-3 py-2 font-body text-sm text-track-orange">
          {error}
        </p>
      )}

      {/* Basic info */}
      <div className="court-card p-5">
        <h2 className="font-meta text-xs text-line-grey">Basic Information</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Product Name">
            <input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Slug (URL)">
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", slugify(e.target.value));
              }}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Brand">
            <input
              required
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Sport">
            <select
              required
              value={selectedSportId}
              onChange={(e) => {
                setSelectedSportId(e.target.value);
                // Auto-select the first category in the new sport
                const firstCatInSport = categories.find((c) => c.sportId === e.target.value);
                if (firstCatInSport) {
                  update("categoryId", firstCatInSport.id);
                }
              }}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            >
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Category">
            <select
              required
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            >
              {sportCategories.length === 0 ? (
                <option disabled>No categories in this sport</option>
              ) : (
                sportCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Description">
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
        </div>
      </div>

      {/* Pricing & stock */}
      <div className="court-card p-5">
        <h2 className="font-meta text-xs text-line-grey">Pricing & Stock</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Field label="Price (৳)">
            <input
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Compare-at Price (৳)">
            <input
              type="number"
              min={0}
              value={form.compareAtPrice ?? ""}
              onChange={(e) =>
                update("compareAtPrice", e.target.value ? Number(e.target.value) : null)
              }
              placeholder="Optional"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Stock Quantity">
            <input
              required
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => update("stock", Number(e.target.value))}
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="SKU">
            <input
              value={form.sku ?? ""}
              onChange={(e) => update("sku", e.target.value || null)}
              placeholder="Optional"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
        </div>
      </div>

      {/* Racquet specs */}
      <div className="court-card p-5">
        <h2 className="font-meta text-xs text-line-grey">
          Racquet Specs <span className="text-line-grey/60">(optional — leave blank for non-racquet items)</span>
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Weight / Grip">
            <input
              value={form.weightGrip ?? ""}
              onChange={(e) => update("weightGrip", e.target.value || null)}
              placeholder="e.g. 4U G5"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Balance Point">
            <input
              value={form.balancePoint ?? ""}
              onChange={(e) => update("balancePoint", e.target.value || null)}
              placeholder="e.g. Head Heavy"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Flexibility">
            <input
              value={form.flexibility ?? ""}
              onChange={(e) => update("flexibility", e.target.value || null)}
              placeholder="e.g. Stiff"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="String Tension">
            <input
              value={form.stringTension ?? ""}
              onChange={(e) => update("stringTension", e.target.value || null)}
              placeholder="e.g. 20-28 lbs"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Material">
            <input
              value={form.material ?? ""}
              onChange={(e) => update("material", e.target.value || null)}
              placeholder="e.g. Carbon Fiber"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
        </div>
      </div>

      {/* Running shoe specs */}
      <div className="court-card p-5">
        <h2 className="font-meta text-xs text-line-grey">
          Running Shoe Specs <span className="text-line-grey/60">(optional — leave blank for non-shoe items)</span>
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Shoe Size Range">
            <input
              value={form.shoeSizeRange ?? ""}
              onChange={(e) => update("shoeSizeRange", e.target.value || null)}
              placeholder="e.g. EU 39-45"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Terrain Type">
            <input
              value={form.terrainType ?? ""}
              onChange={(e) => update("terrainType", e.target.value || null)}
              placeholder="e.g. Road, Trail"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Cushioning">
            <input
              value={form.cushioning ?? ""}
              onChange={(e) => update("cushioning", e.target.value || null)}
              placeholder="e.g. High, Medium, Minimal"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
          <Field label="Heel-to-Toe Drop">
            <input
              value={form.dropHeight ?? ""}
              onChange={(e) => update("dropHeight", e.target.value || null)}
              placeholder="e.g. 8mm"
              className="w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </Field>
        </div>
      </div>

      {/* Images */}
      <div className="court-card p-5">
        <h2 className="font-meta text-xs text-line-grey">Images</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {form.imageUrls.map((url) => (
            <div key={url} className="relative h-24 w-24 border border-line-grey-soft">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-track-orange font-meta text-xs text-court-white"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center border border-dashed border-line-grey-soft font-meta text-[10px] text-line-grey hover:border-ink">
            {uploading ? "Uploading…" : "+ Add Image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="mt-2 font-body text-xs text-line-grey">
          First image is used as the main product photo. JPEG, PNG, or WebP, up to 5MB.
        </p>
      </div>

      {/* Visibility */}
      <div className="court-card p-5">
        <h2 className="font-meta text-xs text-line-grey">Visibility</h2>
        <div className="mt-4 flex gap-6">
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => update("isPublished", e.target.checked)}
            />
            Published (visible on storefront)
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => update("isFeatured", e.target.checked)}
            />
            Featured on homepage
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-track-orange px-6 py-3 font-meta text-xs text-court-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : isEditing ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-meta text-[10px] text-line-grey">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
