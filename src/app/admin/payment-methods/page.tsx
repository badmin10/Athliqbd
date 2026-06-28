"use client";

import { useEffect, useState } from "react";

type PaymentMethod = {
  id: string;
  name: string;
  type: string;
  instructions: string | null;
  requiresReference: boolean;
  isEnabled: boolean;
  sortOrder: number;
  _count: { orders: number };
};

const TYPE_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  mobile_banking: "Mobile Banking",
  bank_transfer: "Bank Transfer",
  card: "Card",
  manual: "Manual",
};

const emptyForm = {
  name: "",
  type: "mobile_banking",
  instructions: "",
  requiresReference: false,
  isEnabled: true,
};

export default function AdminPaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/admin/payment-methods");
    const data = await res.json();
    setMethods(data.paymentMethods ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch("/api/admin/payment-methods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: methods.length }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not add payment method");
    } else {
      setForm(emptyForm);
      setShowAddForm(false);
      await loadData();
    }
    setSaving(false);
  }

  function startEdit(method: PaymentMethod) {
    setEditingId(method.id);
    setEditForm({
      name: method.name,
      type: method.type,
      instructions: method.instructions ?? "",
      requiresReference: method.requiresReference,
      isEnabled: method.isEnabled,
    });
  }

  async function handleSaveEdit(method: PaymentMethod) {
    setError(null);
    const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editForm, sortOrder: method.sortOrder }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save changes");
      return;
    }
    setEditingId(null);
    await loadData();
  }

  async function handleToggleEnabled(method: PaymentMethod) {
    setError(null);
    const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: method.name,
        type: method.type,
        instructions: method.instructions,
        requiresReference: method.requiresReference,
        isEnabled: !method.isEnabled,
        sortOrder: method.sortOrder,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not update");
      return;
    }
    await loadData();
  }

  async function handleDelete(method: PaymentMethod) {
    if (method._count.orders > 0) {
      alert(
        `Cannot delete: ${method._count.orders} order(s) used this method. Disable it instead so past orders keep their history.`
      );
      return;
    }
    if (!window.confirm(`Delete payment method "${method.name}"?`)) return;

    const res = await fetch(`/api/admin/payment-methods/${method.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Could not delete payment method");
      return;
    }
    await loadData();
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Payment Methods</h1>
          <p className="mt-1 font-body text-sm text-line-grey">
            Control what customers can choose at checkout. Disabled methods are hidden from
            checkout but kept for order history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="bg-track-orange px-4 py-2 font-meta text-xs text-court-white hover:opacity-90"
        >
          {showAddForm ? "Cancel" : "+ Add Method"}
        </button>
      </div>

      {error && (
        <p className="mt-4 border border-track-orange bg-track-orange/5 px-3 py-2 font-body text-sm text-track-orange">
          {error}
        </p>
      )}

      {showAddForm && (
        <form onSubmit={handleAdd} className="court-card mt-6 grid gap-3 p-5 md:grid-cols-2">
          <div>
            <label className="font-meta text-[10px] text-line-grey">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Rocket, Bank Transfer"
              className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </div>
          <div>
            <label className="font-meta text-[10px] text-line-grey">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="font-meta text-[10px] text-line-grey">
              Instructions shown to customer at checkout
            </label>
            <textarea
              rows={2}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              placeholder="e.g. Send the total to 01XXXXXXXXX (Personal), then enter the Transaction ID below."
              className="mt-1 w-full border border-line-grey-soft px-3 py-2.5 font-body text-sm focus:border-ink"
            />
          </div>
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="checkbox"
              checked={form.requiresReference}
              onChange={(e) => setForm({ ...form, requiresReference: e.target.checked })}
            />
            Require a transaction/reference ID at checkout
          </label>
          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isEnabled}
              onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })}
            />
            Enabled (visible at checkout)
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-court-green px-5 py-2.5 font-meta text-xs text-court-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add Payment Method"}
            </button>
          </div>
        </form>
      )}

      <div className="court-card mt-6 overflow-hidden">
        {loading ? (
          <p className="px-4 py-10 text-center font-body text-sm text-line-grey">Loading…</p>
        ) : methods.length === 0 ? (
          <p className="px-4 py-10 text-center font-body text-sm text-line-grey">
            No payment methods yet. Add one above — Cash on Delivery is a good place to start.
          </p>
        ) : (
          <div className="divide-y divide-line-grey-soft">
            {methods.map((method) => (
              <div key={method.id} className="px-4 py-4">
                {editingId === method.id ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="border border-line-grey-soft px-3 py-2 font-body text-sm focus:border-ink"
                    />
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      className="border border-line-grey-soft px-3 py-2 font-body text-sm focus:border-ink"
                    >
                      {Object.entries(TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <textarea
                      rows={2}
                      value={editForm.instructions}
                      onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                      className="border border-line-grey-soft px-3 py-2 font-body text-sm focus:border-ink md:col-span-2"
                    />
                    <label className="flex items-center gap-2 font-body text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={editForm.requiresReference}
                        onChange={(e) =>
                          setEditForm({ ...editForm, requiresReference: e.target.checked })
                        }
                      />
                      Require reference ID
                    </label>
                    <label className="flex items-center gap-2 font-body text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={editForm.isEnabled}
                        onChange={(e) =>
                          setEditForm({ ...editForm, isEnabled: e.target.checked })
                        }
                      />
                      Enabled
                    </label>
                    <div className="flex gap-3 md:col-span-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(method)}
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
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-body text-sm font-medium text-ink">{method.name}</p>
                        <span className="font-meta text-[10px] text-line-grey">
                          {TYPE_LABELS[method.type] ?? method.type}
                        </span>
                        {method.requiresReference && (
                          <span className="font-meta text-[10px] text-court-green">
                            Needs reference ID
                          </span>
                        )}
                      </div>
                      {method.instructions && (
                        <p className="mt-1 font-body text-xs text-line-grey">
                          {method.instructions}
                        </p>
                      )}
                      <p className="mt-1 font-meta text-[10px] text-line-grey">
                        Used in {method._count.orders} order
                        {method._count.orders === 1 ? "" : "s"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(method)}
                      className={`font-meta text-[11px] ${
                        method.isEnabled ? "text-court-green" : "text-line-grey"
                      }`}
                    >
                      {method.isEnabled ? "Enabled" : "Disabled"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(method)}
                      className="font-meta text-[11px] text-ink hover:text-track-orange"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(method)}
                      className="font-meta text-[11px] text-line-grey hover:text-track-orange"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
