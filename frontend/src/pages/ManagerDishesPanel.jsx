import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;
const GENERAL_CATEGORIES = ["Starter", "Main Course", "Dessert", "Drink"];
const SUGGESTED_TYPES = ["Pasta", "Meat", "Pizza", "Burger", "Ice Cream", "Cake"];
const TAG_OPTIONS = [
    "gluten-free",
    "vegetarian",
    "vegan",
    "contains frozen products",
    "contains nuts",
    "may contain traces of peanuts",
];

export default function ManagerDishesPanel({ restaurantName }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dishes, setDishes] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [form, setForm] = useState(emptyDish());
    const [newTopping, setNewTopping] = useState({ name: "", price: "" });
    const [statusMessage, setStatusMessage] = useState("");

    function emptyDish() {
        return {
            name: "",
            description: "",
            category: GENERAL_CATEGORIES[0],
            type: "",
            price: "",
            toppings: [],
            tags: [],
        };
    }

    useEffect(() => {
        async function loadMenu() {
            setLoading(true);
            setError("");
            setStatusMessage("");
            try {
                if (!CATALOG_API_BASE) {
                    throw new Error("VITE_CATALOG_API_BASE is not defined");
                }
                if (!restaurantName) {
                    throw new Error("Restaurant name missing");
                }
                const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(restaurantName)}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }
                const data = await response.json();
                const initialDishes = Array.isArray(data.menu) ? data.menu.map((d) => ({
                    name: d.name || "",
                    description: d.description || "",
                    category: d.category || GENERAL_CATEGORIES[0],
                    type: d.type || "",
                    price: d.price ?? "",
                    toppings: d.toppings || [],
                    tags: d.tags || [],
                })) : [];
                setDishes(initialDishes);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Unknown error loading menu");
            } finally {
                setLoading(false);
            }
        }
        loadMenu();
        setForm(emptyDish());
        setEditingIndex(null);
    }, [restaurantName]);

    function handleFieldChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleTagToggle(tag) {
        setForm((prev) => {
            const has = prev.tags.includes(tag);
            return {
                ...prev,
                tags: has ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
            };
        });
    }

    function handleAddTopping() {
        if (!newTopping.name.trim()) return;
        const priceNumber = newTopping.price === "" ? 0 : Number(newTopping.price);
        if (Number.isNaN(priceNumber)) return;
        setForm((prev) => ({
            ...prev,
            toppings: [...prev.toppings, { name: newTopping.name.trim(), price: priceNumber }],
        }));
        setNewTopping({ name: "", price: "" });
    }

    function handleRemoveTopping(idx) {
        setForm((prev) => ({
            ...prev,
            toppings: prev.toppings.filter((_, i) => i !== idx),
        }));
    }

    function handleEdit(index) {
        const dish = dishes[index];
        setEditingIndex(index);
        setForm({
            name: dish.name || "",
            description: dish.description || "",
            category: dish.category || GENERAL_CATEGORIES[0],
            type: dish.type || "",
            price: dish.price ?? "",
            toppings: dish.toppings || [],
            tags: dish.tags || [],
        });
        setStatusMessage("");
    }

    function handleDelete(index) {
        if (!window.confirm("Delete this dish?")) return;
        setDishes((prev) => prev.filter((_, i) => i !== index));
        setStatusMessage("Dish removed locally. Update backend soon.");
    }

    function handleResetForm() {
        setEditingIndex(null);
        setForm(emptyDish());
        setNewTopping({ name: "", price: "" });
        setStatusMessage("");
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) {
            alert("Dish name is required");
            return;
        }
        const priceNumber = form.price === "" ? 0 : Number(String(form.price).replace(",", "."));
        if (Number.isNaN(priceNumber) || priceNumber < 0) {
            alert("Price must be a non-negative number");
            return;
        }
        const normalizedDish = {
            ...form,
            name: form.name.trim(),
            description: form.description.trim(),
            type: form.type.trim(),
            price: priceNumber,
        };
        setDishes((prev) => {
            if (editingIndex == null) {
                return [...prev, normalizedDish];
            } else {
                return prev.map((d, i) => (i === editingIndex ? normalizedDish : d));
            }
        });
        setStatusMessage(editingIndex == null ? "Dish added locally." : "Dish updated locally.");
        setEditingIndex(null);
        setForm(emptyDish());
        setNewTopping({ name: "", price: "" });
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold text-deep-sea-navy border-b border-border-gray pb-2">Manage dishes for {restaurantName}</h3>
            {loading && <p className="text-slate-light animate-pulse">Loading current menu...</p>}
            {error && <p className="text-crimson-alert bg-red-50 p-4 rounded-lg border border-red-200">{error}</p>}
            
            {!loading && !error && (
                <div className="space-y-6">
                    <h4 className="text-xl font-heading font-bold text-slate-dark">Existing dishes</h4>
                    {dishes.length === 0 ? (
                        <Card className="text-center py-8 border-dashed border-2">
                            <p className="text-slate-light font-medium">No dishes defined yet.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dishes.map((dish, idx) => (
                                <Card key={`${dish.name}-${idx}`} className="flex flex-col gap-3 shadow-sm border border-border-gray hover:border-ocean-blue/30 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <strong className="text-lg font-heading text-slate-dark">{dish.name}</strong>
                                            <div className="text-sm text-slate-light mt-0.5">
                                                <span>{dish.category}</span>
                                                {dish.type && <span className="italic"> · {dish.type}</span>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(idx)} className="text-xs font-semibold text-ocean-blue hover:text-deep-sea-navy px-2 py-1 bg-ocean-blue/10 rounded transition-colors">Edit</button>
                                            <button onClick={() => handleDelete(idx)} className="text-xs font-semibold text-crimson-alert hover:text-red-700 px-2 py-1 bg-crimson-alert/10 rounded transition-colors">Del</button>
                                        </div>
                                    </div>
                                    {dish.description && <p className="text-sm text-slate-light line-clamp-2">{dish.description}</p>}
                                    <p className="text-sm font-semibold text-ocean-blue">
                                        Price: {dish.price != null ? `${dish.price} €` : "N/A"}
                                    </p>
                                    {dish.toppings && dish.toppings.length > 0 && (
                                        <div className="text-xs text-slate-light bg-seabreeze-white p-2 rounded border border-border-gray">
                                            <strong className="text-slate-dark">Toppings:</strong> {dish.toppings.map((t) => `${t.name} (+${t.price ?? 0}€)`).join(", ")}
                                        </div>
                                    )}
                                    {dish.tags && dish.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-auto">
                                            {dish.tags.map(t => <span key={t} className="text-[10px] uppercase tracking-wider bg-mint-green/10 text-mint-green border border-mint-green/20 px-1.5 py-0.5 rounded">{t}</span>)}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <Card className="bg-seabreeze-white border-border-gray mt-8">
                <h4 className="text-xl font-heading font-bold text-slate-dark mb-4">{editingIndex == null ? "Add a new dish" : "Edit dish"}</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-dark">Name*</label>
                            <input type="text" name="name" value={form.name} onChange={handleFieldChange} required className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-dark">Price (€)</label>
                            <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleFieldChange} className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-dark">Description</label>
                        <textarea name="description" value={form.description} onChange={handleFieldChange} rows="3" className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors resize-none"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-dark">Category</label>
                            <select name="category" value={form.category} onChange={handleFieldChange} className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors">
                                {GENERAL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-dark">Type (optional)</label>
                            <input list="dish-types" name="type" value={form.type} onChange={handleFieldChange} placeholder="e.g. Pasta, Pizza" className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                            <datalist id="dish-types">{SUGGESTED_TYPES.map((t) => <option key={t} value={t} />)}</datalist>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-border-gray pt-4 mt-2">
                        <strong className="text-sm text-slate-dark">Paid toppings (optional)</strong>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Topping name" value={newTopping.name} onChange={(e) => setNewTopping(prev => ({ ...prev, name: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none text-sm" />
                            <input type="number" step="0.1" min="0" placeholder="Price" value={newTopping.price} onChange={(e) => setNewTopping(prev => ({ ...prev, price: e.target.value }))} className="w-24 px-3 py-2 rounded-lg border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none text-sm" />
                            <button type="button" onClick={handleAddTopping} disabled={!newTopping.name.trim()} className="px-4 py-2 bg-deep-sea-navy text-pure-white rounded-lg text-sm font-semibold hover:bg-ocean-blue disabled:opacity-50 transition-colors">Add</button>
                        </div>
                        {form.toppings.length > 0 && (
                            <ul className="flex flex-wrap gap-2 mt-2">
                                {form.toppings.map((t, idx) => (
                                    <li key={`${t.name}-${idx}`} className="bg-pure-white border border-border-gray px-3 py-1.5 rounded-full text-sm text-slate-dark flex items-center gap-2">
                                        {t.name} <span className="font-semibold text-ocean-blue">(+{t.price ?? 0}€)</span>
                                        <button type="button" onClick={() => handleRemoveTopping(idx)} className="text-crimson-alert hover:text-red-700 ml-1">✕</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-border-gray pt-4">
                        <strong className="text-sm text-slate-dark">Dietary Tags</strong>
                        <div className="flex flex-wrap gap-3 mt-1">
                            {TAG_OPTIONS.map((tag) => (
                                <label key={tag} className="flex items-center gap-2 text-sm cursor-pointer group">
                                    <input type="checkbox" checked={form.tags.includes(tag)} onChange={() => handleTagToggle(tag)} className="w-4 h-4 rounded border-border-gray text-ocean-blue focus:ring-ocean-blue cursor-pointer" />
                                    <span className="text-slate-light group-hover:text-slate-dark transition-colors">{tag}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 mt-2 border-t border-border-gray">
                        <Button type="submit" variant="primary" className="flex-1">
                            {editingIndex == null ? "Save Dish" : "Update Dish"}
                        </Button>
                        <Button type="button" onClick={handleResetForm} variant="outline" className="flex-1">
                            Reset Form
                        </Button>
                    </div>
                    {statusMessage && <p className="text-mint-green font-medium text-sm text-center">{statusMessage}</p>}
                </form>
            </Card>
        </div>
    );
}
