"use client";

import { useEffect, useState } from "react";

type Sport = {
  id: string;
  name: string;
  slug: string;
  _count: { categories: number };
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  sportId: string;
  sport: { id: string; name: string; slug: string };
  _count: { products: number };
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategoriesPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add category form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSportId, setNewSportId] = useState("");
  const [adding, setAdding] = useState(false);

  // Add sport form (collapsed by default — most stores won't need this often)
  const [showAddSport, setShowAddSport] = useState(false);
  const [newSportName, setNewSportName] = useState("");
  const [addingSport, setAddingSport] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function loadData() {
    setLoading(true);
    const [sportsRes, categoriesRes] = await Promise.all([
      fetch("/api/admin/sports"),
      fetch("/api/admin/categories"),
    ]);
    const sportsData = await sportsRes.json();
    const categoriesData = await categoriesRes.json();
    setSports(sportsData.sports ?? []);
    setCategories(categoriesData.categories ?? []);
    if (!newSportId && sportsData.sports?.length > 0) {
      setNewSportId(sportsData.sports[0].id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAddSport(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAddingSport(true);

    const res = await fetch("/api/admin/sports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newSportName,
        slug: slugify(newSportName),
        sortOrder: sports.length,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not add sport");
    } else {
      setNewSportName("");
      setShowAddSport(false);
      await loadData();
    }
    setAddingSport(false);
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAdding(true);

    const sportCategoryCount = categories.filter((c) => c.sportId === newSportId).length;

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        slug: slugify(newName),
        description: newDescription || null,
        sortOrder: sportCategoryCount,
        sportId: newSportId,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not add category");
    } else {
      setNewName("");
      setNewDescription("");
      await loadData();
    }
    setAdding(false);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
  }

  async function handleSaveEdit(cat: Category) {
    setError(null);
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        slug: slugify(editName),
        description: editDescription || null,
        sortOrder: cat.sortOrder,
        sportId: cat.sportId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save changes");
      return;
    }
    setEditingId(null);
    await loadData();
  }

  async function handleDelete(cat: Category) {
    if (cat._count.products > 0) {
      alert(`Cannot delete: ${cat._count.products} product(s) still use this category.`);
      return;
    }
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;

    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Could not delete category");
      return;
    }
    await loadData();
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink">Categories</h1>
        <button
          type="button"
          onClick={() => setShowAddSport((v) => !v)}
          className="font-meta text-[11px] text-line-grey hover:text-track-orange"
        >
          {showAddSport ? "Cancel" : "+ Add Sport"}
        </button>
      </div>

      {error && (
        <p className="mt-4 border border-track-orange bg-track-orange/5 px-3 py-2 font-body text-sm text-track-orange">
          {error}
        </p>
      )}

      {showAddSport && (
        <form onSubmit={handleAddSport} className="court-card mt-6 flex gap-3 p-5">
          <input
            required
            value={newSportName}
            onChange={(e) => setNewSportName(e.target.value)}
            placeholder="Sport name (e.g. Tennis)"
            className="flex-1 border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
          />
          <button
            type="submit"
            disabled={addingSport}
            className="bg-ink px-5 py-2.5 font-meta text-xs text-court-white hover:opacity-90 disabled:opacity-50"
          >
            {addingSport ? "Adding…" : "Add Sport"}
          </button>
        </form>
      )}

      {/* Add new category */}
      <form onSubmit={handleAddCategory} className="court-card mt-6 flex flex-wrap gap-3 p-5">
        <select
          required
          value={newSportId}
          onChange={(e) => setNewSportId(e.target.value)}
          className="border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
        >
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
        <input
          required
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Category name (e.g. Wristbands)"
          className="flex-1 border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
        />
        <input
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
        />
        <button
          type="submit"
          disabled={adding || sports.length === 0}
          className="bg-track-orange px-5 py-2.5 font-meta text-xs text-court-white hover:opacity-90 disabled:opacity-50"
        >
          {adding ? "Adding…" : "+ Add Category"}
        </button>
      </form>

      {/* List, grouped by sport */}
      {loading ? (
        <p className="mt-6 px-4 py-10 text-center font-body text-sm text-line-grey">Loading…</p>
      ) : (
        sports.map((sport) => {
          const sportCategories = categories.filter((c) => c.sportId === sport.id);
          return (
            <div key={sport.id} className="mt-8">
              <h2 className="font-meta text-xs text-track-orange">{sport.name}</h2>
              <div className="court-card mt-3 overflow-hidden">
                {sportCategories.length === 0 ? (
                  <p className="px-4 py-6 font-body text-sm text-line-grey">
                    No categories yet under {sport.name}.
                  </p>
                ) : (
                  <div className="divide-y divide-line-grey-soft">
                    {sportCategories.map((cat) => (
                      <div key={cat.id} className="flex items-center gap-4 px-4 py-4">
                        {editingId === cat.id ? (
                          <>
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 border border-line-grey-soft px-3 py-2 font-body text-sm focus:border-ink"
                            />
                            <input
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Description"
                              className="flex-1 border border-line-grey-soft px-3 py-2 font-body text-sm focus:border-ink"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat)}
                              className="font-meta text-[11px] text-court-green"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="font-meta text-[11px] text-line-grey"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="font-body text-sm font-medium text-ink">{cat.name}</p>
                              {cat.description && (
                                <p className="font-body text-xs text-line-grey">{cat.description}</p>
                              )}
                            </div>
                            <span className="font-meta text-[10px] text-line-grey">
                              {cat._count.products} product{cat._count.products === 1 ? "" : "s"}
                            </span>
                            <button
                              type="button"
                              onClick={() => startEdit(cat)}
                              className="font-meta text-[11px] text-ink hover:text-track-orange"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(cat)}
                              className="font-meta text-[11px] text-line-grey hover:text-track-orange"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
