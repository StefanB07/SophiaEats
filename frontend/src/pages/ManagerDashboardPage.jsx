import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE || "http://localhost:8080";
const CATEGORIES = ["STARTER", "MAIN_COURSE", "DESSERT", "DRINK"];
const DISH_IMAGES = {
    "Pizza Margherita": "/images/pizza-margherita.webp",
    Pasta: "/images/pasta.jpeg",
    Lasagna: "/images/lasagna.jpeg",
    Bruschetta: "/images/bruschetta.jpg",
    Tiramisu: "/images/tiramisu.webp",
    Soba: "/images/soba.webp",
    Udon: "/images/udon.jpeg",
    Ramen: "/images/ramen.jpg",
    Edamame: "/images/edamame.png",
    "Buddha Bowl": "/images/buddha-bowl.jpeg",
    "Veggie Burger": "/images/veggie-burger.webp",
    "Caesar Salad": "/images/caesar-salad.jpg",
    "Chia Pudding": "/images/chia-pudding.jpeg",
    "Classic Burger": "/images/classic-burger.webp",
    "Crispy Chicken Burger": "/images/crispy-chicken-burger.jpg",
    "French Fries": "/images/french-fries.jpg",
    "Chocolate Brownie": "/images/chocolate-brownie.jpeg",
};

function getDishImage(name) {
    return DISH_IMAGES[name] || "/images/dish-placeholder.png";
}

export default function ManagerDashboardPage() {
    const { currentUser } = useUser();
    const [restaurants, setRestaurants] = useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);
    const [restaurantsError, setRestaurantsError] = useState("");
    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [menu, setMenu] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [menuError, setMenuError] = useState("");
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState("");

    const [slotDate, setSlotDate] = useState("");
    const [slotTime, setSlotTime] = useState("");
    const [slotCapacity, setSlotCapacity] = useState("");

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("MAIN_COURSE");
    const [type, setType] = useState("");
    const [dietaryInfo, setDietaryInfo] = useState("");
    const [editingDishName, setEditingDishName] = useState(null);
    const [status, setStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadRestaurants() {
            setLoadingRestaurants(true);
            setRestaurantsError("");
            try {
                const resp = await fetch(`${CATALOG_API_BASE}/restaurants`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                setRestaurants(data);
                if (data.length > 0) setSelectedRestaurant(data[0].name);
            } catch (e) {
                console.error(e);
                setRestaurantsError(e instanceof Error ? e.message : "Unknown error");
            } finally {
                setLoadingRestaurants(false);
            }
        }
        loadRestaurants();
    }, []);

    async function loadMenuForRestaurant(restaurantName) {
        if (!restaurantName) return;
        try {
            setLoadingMenu(true);
            setMenuError("");
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(restaurantName)}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setMenu(Array.isArray(data.menu) ? data.menu : []);
        } catch (e) {
            console.error(e);
            setMenuError(e instanceof Error ? e.message : "Unknown error");
            setMenu([]);
        } finally {
            setLoadingMenu(false);
        }
    }

    async function loadSlotsForRestaurant(restaurantName) {
        if (!restaurantName) return;
        try {
            setLoadingSlots(true);
            setSlotsError("");
            const url = `${CATALOG_API_BASE}/delivery/slots?restaurant=${encodeURIComponent(restaurantName)}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setSlots(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setSlotsError(e instanceof Error ? e.message : "Unknown error");
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }

    useEffect(() => {
        if (!selectedRestaurant) return;
        setEditingDishName(null);
        resetForm();
        void loadMenuForRestaurant(selectedRestaurant);
        void loadSlotsForRestaurant(selectedRestaurant);
    }, [selectedRestaurant]);

    function resetForm() {
        setName("");
        setDescription("");
        setPrice("");
        setCategory("MAIN_COURSE");
        setType("");
        setDietaryInfo("");
        setEditingDishName(null);
        setStatus(null);
    }

    function startEdit(dish) {
        setEditingDishName(dish.name);
        setName(dish.name || "");
        setDescription(dish.description || "");
        setPrice(dish.price != null ? String(dish.price) : "");
        setCategory(dish.category || "MAIN_COURSE");
        setType(dish.type || "");
        const infoFromTags = Array.isArray(dish.dietaryTags) && dish.dietaryTags.length > 0 ? dish.dietaryTags.join(", ") : dish.dietaryInfo || "";
        setDietaryInfo(infoFromTags);
        setStatus(null);
    }

    async function handleDelete(dishName) {
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }
        if (!window.confirm(`Are you sure you want to delete dish "${dishName}" from "${selectedRestaurant}"?`)) return;

        try {
            setSubmitting(true);
            setStatus(null);
            const baseUrl = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(selectedRestaurant)}/dishes/${encodeURIComponent(dishName)}`;
            const resp = await fetch(baseUrl, { method: "DELETE", headers: { Accept: "application/json" } });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }
            setStatus({ type: "success", msg: `Dish "${dishName}" was deleted.` });
            await loadMenuForRestaurant(selectedRestaurant);
            resetForm();
        } catch (e) {
            console.error(e);
            setStatus({ type: "error", msg: e instanceof Error ? e.message : "Could not delete dish." });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant." });
            return;
        }
        if (!name.trim()) {
            setStatus({ type: "error", msg: "Dish name is required." });
            return;
        }
        if (!description.trim()) {
            setStatus({ type: "error", msg: "Description is required." });
            return;
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum <= 0) {
            setStatus({ type: "error", msg: "Price must be a positive number." });
            return;
        }

        setSubmitting(true);
        try {
            const baseUrl = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(selectedRestaurant)}/dishes`;
            const payload = {
                name: name.trim(),
                description: description.trim(),
                price: priceNum,
                category,
                type: type.trim(),
                dietaryInfo: dietaryInfo.trim(),
            };

            let url = baseUrl;
            let method = "POST";
            if (editingDishName) {
                url = `${baseUrl}/${encodeURIComponent(editingDishName)}`;
                method = "PUT";
            }

            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            const result = await resp.json();
            setStatus({
                type: "success",
                msg: editingDishName ? `Dish "${editingDishName}" was updated.` : `Dish "${result.name}" was added.`,
            });
            await loadMenuForRestaurant(selectedRestaurant);
            resetForm();
        } catch (e) {
            console.error(e);
            setStatus({ type: "error", msg: e instanceof Error ? e.message : "Could not save dish." });
        } finally {
            setSubmitting(false);
        }
    }

    function handleSlotCapacityChange(index, value) {
        setSlots((prev) => prev.map((s, i) => i === index ? { ...s, capacity: value === "" ? "" : Number(value) || 0 } : s));
    }

    async function handleSaveSlots(e) {
        e.preventDefault();
        setStatus(null);
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }

        const cleaned = slots.map((s) => ({ label: s.label, capacity: Number(s.capacity) })).filter((s) => s.label && !Number.isNaN(s.capacity) && s.capacity >= 0);
        if (cleaned.length === 0) {
            setStatus({ type: "error", msg: "No valid slots to send." });
            return;
        }

        try {
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(selectedRestaurant)}/slots`;
            const resp = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slots: cleaned }),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            setStatus({ type: "success", msg: "Delivery slot capacities updated." });
            await loadSlotsForRestaurant(selectedRestaurant);
        } catch (e) {
            console.error(e);
            setStatus({ type: "error", msg: e instanceof Error ? e.message : "Could not update slots." });
        }
    }

    async function handleAddSlot(e) {
        e.preventDefault();
        setStatus(null);
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }
        if (!slotDate || !slotTime) {
            setStatus({ type: "error", msg: "Please select both date and time." });
            return;
        }
        const capNum = Number(slotCapacity);
        if (Number.isNaN(capNum) || capNum <= 0) {
            setStatus({ type: "error", msg: "Capacity must be a positive number." });
            return;
        }

        const start = `${slotDate} ${slotTime.slice(0, 5)}`;
        try {
            setSubmitting(true);
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(selectedRestaurant)}/slots`;
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ start, capacity: capNum }),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            const created = await resp.json();
            setStatus({ type: "success", msg: `New slot ${created.label} added.` });
            setSlotDate("");
            setSlotTime("");
            setSlotCapacity("");
            await loadSlotsForRestaurant(selectedRestaurant);
        } catch (e) {
            console.error(e);
            setStatus({ type: "error", msg: e instanceof Error ? e.message : "Could not add slot." });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteSlot(label) {
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }
        if (!window.confirm(`Are you sure you want to delete slot "${label}"?`)) return;

        try {
            setSubmitting(true);
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(selectedRestaurant)}/slots?label=${encodeURIComponent(label)}`;
            const resp = await fetch(url, { method: "DELETE", headers: { Accept: "application/json" } });
            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }
            setStatus({ type: "success", msg: `Slot "${label}" was deleted.` });
            await loadSlotsForRestaurant(selectedRestaurant);
        } catch (e) {
            console.error(e);
            setStatus({ type: "error", msg: e instanceof Error ? e.message : "Could not delete slot." });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-4xl font-heading font-bold text-deep-sea-navy mb-2">Manager Dashboard</h2>
                <p className="text-slate-light text-lg">Manage menus, capacities, and delivery schedules.</p>
            </div>

            {loadingRestaurants && <div className="text-slate-light animate-pulse font-medium text-lg">Loading restaurants...</div>}
            {restaurantsError && <div className="bg-crimson-alert/10 text-crimson-alert p-4 rounded-xl border border-crimson-alert/20 font-medium">{restaurantsError}</div>}
            
            {!loadingRestaurants && !restaurantsError && restaurants.length === 0 && (
                <Card className="text-center py-12 border-dashed border-2">
                    <p className="text-lg font-heading font-bold text-slate-dark">No restaurants available.</p>
                </Card>
            )}

            {!loadingRestaurants && restaurants.length > 0 && (
                <div className="space-y-8">
                    <Card className="flex flex-col sm:flex-row sm:items-center gap-4 bg-ocean-blue/5 border-none shadow-md ring-1 ring-border-gray/50">
                        <label className="font-semibold text-slate-dark uppercase tracking-wide text-sm whitespace-nowrap">Managing Restaurant:</label>
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            className="flex-1 w-full sm:max-w-md px-4 py-3 rounded-xl border-2 border-border-gray bg-pure-white text-slate-dark font-medium focus:border-ocean-blue focus:ring-0 outline-none transition-colors shadow-sm"
                        >
                            {restaurants.map((r) => (
                                <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                    </Card>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <Card className="flex flex-col gap-6 shadow-lg border-border-gray/50">
                            <div className="flex items-center justify-between border-b border-border-gray pb-4">
                                <h3 className="text-2xl font-heading font-bold text-deep-sea-navy">Current Menu</h3>
                            </div>
                            
                            {loadingMenu && <p className="text-slate-light animate-pulse">Loading menu...</p>}
                            {menuError && <p className="text-crimson-alert font-medium">{menuError}</p>}
                            {!loadingMenu && !menuError && menu.length === 0 && <p className="text-slate-light">No dishes defined yet.</p>}

                            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {!loadingMenu && !menuError && menu.length > 0 && menu.map((dish) => (
                                    <div key={dish.name} className="flex gap-4 p-4 rounded-xl border border-border-gray bg-pure-white hover:border-ocean-blue/30 transition-colors shadow-sm group">
                                        <img
                                            src={getDishImage(dish.name)}
                                            alt={dish.name}
                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                            onError={(e) => { e.target.src = '/images/dish-placeholder.png'; }}
                                        />
                                        <div className="flex flex-col flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-heading font-bold text-slate-dark leading-tight">{dish.name}</h4>
                                                <span className="font-bold text-ocean-blue whitespace-nowrap">{dish.price != null ? `${dish.price} €` : ""}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-slate-light mt-1">{dish.category} {dish.type ? `· ${dish.type}` : ""}</span>
                                            {dish.description && <p className="text-sm text-slate-light mt-2 line-clamp-2">{dish.description}</p>}
                                            {Array.isArray(dish.dietaryTags) && dish.dietaryTags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {dish.dietaryTags.map((tag) => (
                                                        <span key={tag} className="text-[10px] uppercase tracking-wider bg-seabreeze-white border border-border-gray text-slate-dark px-1.5 py-0.5 rounded">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(dish)} disabled={submitting} className="text-xs font-semibold text-ocean-blue hover:text-deep-sea-navy transition-colors bg-ocean-blue/10 px-3 py-1.5 rounded-md hover:bg-ocean-blue/20">Edit</button>
                                                <button onClick={() => handleDelete(dish.name)} disabled={submitting} className="text-xs font-semibold text-crimson-alert hover:text-red-700 transition-colors bg-crimson-alert/10 px-3 py-1.5 rounded-md hover:bg-crimson-alert/20">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-seabreeze-white p-6 rounded-2xl border border-border-gray mt-4">
                                <h4 className="text-xl font-heading font-bold text-slate-dark mb-2">
                                    {editingDishName ? `Edit Dish: ${editingDishName}` : "Add New Dish"}
                                </h4>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-semibold text-slate-dark">Name*</label>
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue focus:ring-0 outline-none transition-colors" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-semibold text-slate-dark">Price (€)*</label>
                                            <input type="number" step="0.1" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue focus:ring-0 outline-none transition-colors" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-slate-dark">Description*</label>
                                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="2" className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue focus:ring-0 outline-none transition-colors resize-none"></textarea>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-semibold text-slate-dark">Category*</label>
                                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue focus:ring-0 outline-none transition-colors">
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-sm font-semibold text-slate-dark">Type</label>
                                            <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Pizza" className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue focus:ring-0 outline-none transition-colors" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-semibold text-slate-dark">Dietary Tags</label>
                                        <input type="text" value={dietaryInfo} onChange={(e) => setDietaryInfo(e.target.value)} placeholder="vegetarian, gluten-free..." className="w-full px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue focus:ring-0 outline-none transition-colors" />
                                    </div>
                                    
                                    <div className="flex gap-3 pt-2">
                                        <Button type="submit" disabled={submitting} variant="primary" className="flex-1">
                                            {submitting ? "Saving..." : editingDishName ? "Update Dish" : "Add Dish"}
                                        </Button>
                                        {editingDishName && (
                                            <Button type="button" onClick={resetForm} disabled={submitting} variant="outline" className="flex-1">
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </Card>

                        <div className="space-y-8">
                            <Card className="flex flex-col gap-6 shadow-lg border-border-gray/50">
                                <div className="flex items-center justify-between border-b border-border-gray pb-4">
                                    <h3 className="text-2xl font-heading font-bold text-deep-sea-navy">Delivery Capacities</h3>
                                </div>
                                
                                {loadingSlots && <p className="text-slate-light animate-pulse">Loading slots...</p>}
                                {slotsError && <p className="text-crimson-alert font-medium">{slotsError}</p>}
                                
                                <form onSubmit={handleSaveSlots} className="flex flex-col gap-4">
                                    {!loadingSlots && !slotsError && slots.length === 0 ? (
                                        <p className="text-slate-light italic">No active slots found.</p>
                                    ) : (
                                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border border-border-gray/50 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-seabreeze-white border-b border-border-gray/50 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold text-slate-dark uppercase tracking-wider">Time Slot</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-dark uppercase tracking-wider">Capacity</th>
                                                        <th className="px-4 py-3 font-semibold text-slate-dark uppercase tracking-wider w-20">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {slots.map((slot, idx) => (
                                                        <tr key={slot.label} className="border-b border-border-gray/20 last:border-0 hover:bg-seabreeze-white/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-slate-dark">{slot.label}</td>
                                                            <td className="px-4 py-3">
                                                                <input type="number" min="0" value={slot.capacity ?? 0} onChange={(e) => handleSlotCapacityChange(idx, e.target.value)} className="w-24 px-3 py-1.5 rounded-lg border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button type="button" onClick={() => handleDeleteSlot(slot.label)} disabled={submitting} className="text-crimson-alert hover:text-red-700 bg-crimson-alert/10 px-2 py-1 rounded transition-colors text-xs font-bold uppercase tracking-wider">Del</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {slots.length > 0 && (
                                        <Button type="submit" disabled={submitting} variant="outline" className="self-start">
                                            {submitting ? "Saving..." : "Save Capacities"}
                                        </Button>
                                    )}
                                </form>
                            </Card>

                            <Card className="flex flex-col gap-6 shadow-lg border-border-gray/50 bg-ocean-blue/5">
                                <h4 className="text-xl font-heading font-bold text-deep-sea-navy border-b border-border-gray/50 pb-4">Add New Slot</h4>
                                <form onSubmit={handleAddSlot} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-dark uppercase tracking-wider">Date</label>
                                            <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-dark uppercase tracking-wider">Time</label>
                                            <input type="time" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-slate-dark uppercase tracking-wider">Capacity</label>
                                            <input type="number" min="1" value={slotCapacity} onChange={(e) => setSlotCapacity(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={submitting} variant="primary" className="mt-2">
                                        {submitting ? "Adding..." : "Add Slot"}
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
            
            {status && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 duration-300 ${status.type === 'error' ? 'bg-pure-white border-crimson-alert text-crimson-alert' : 'bg-mint-green text-pure-white border-mint-green'}`}>
                    <span className="font-bold text-lg">{status.type === 'error' ? '⚠️' : '✓'}</span>
                    <span className="font-medium">{status.msg}</span>
                    <button onClick={() => setStatus(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}
        </div>
    );
}
