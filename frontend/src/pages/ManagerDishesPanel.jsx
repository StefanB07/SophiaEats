import { useEffect, useState } from "react";

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

    // Load existing menu from backend restaurant details (read-only for now)
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

                const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                    restaurantName
                )}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }
                const data = await response.json();

                // If backend already has a menu, map it into our editable structure.
                const initialDishes = Array.isArray(data.menu)
                    ? data.menu.map((d) => ({
                        name: d.name || "",
                        description: d.description || "",
                        category: d.category || GENERAL_CATEGORIES[0],
                        type: d.type || "",
                        price: d.price ?? "",
                        toppings: d.toppings || [],
                        tags: d.tags || [],
                    }))
                    : [];

                setDishes(initialDishes);
            } catch (err) {
                console.error("Failed to load menu for manager:", err);
                setError(
                    err instanceof Error ? err.message : "Unknown error loading menu"
                );
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
                tags: has
                    ? prev.tags.filter((t) => t !== tag)
                    : [...prev.tags, tag],
            };
        });
    }

    function handleAddTopping() {
        if (!newTopping.name.trim()) return;
        const priceNumber =
            newTopping.price === "" ? 0 : Number(newTopping.price);
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
        setStatusMessage("Dish removed locally. TODO: sync with backend.");
        // TODO: call DELETE /manager/restaurants/{restaurantId}/dishes/{dishId}
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

        const priceNumber =
            form.price === "" ? 0 : Number(String(form.price).replace(",", "."));
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

        setStatusMessage(
            editingIndex == null
                ? "Dish added locally. TODO: send to backend."
                : "Dish updated locally. TODO: sync with backend."
        );

        // TODO: call POST/PUT to backend manager endpoints here.

        setEditingIndex(null);
        setForm(emptyDish());
        setNewTopping({ name: "", price: "" });
    }

    return (
        <div>
            <h3>Manage dishes for {restaurantName}</h3>

            {loading && <p>Loading current menu...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* List of dishes */}
            {!loading && !error && (
                <>
                    <h4>Existing dishes</h4>
                    {dishes.length === 0 ? (
                        <p>No dishes defined yet.</p>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gap: "0.75rem",
                                marginBottom: "1.5rem",
                            }}
                        >
                            {dishes.map((dish, idx) => (
                                <div
                                    key={`${dish.name}-${idx}`}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "0.75rem 1rem",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <strong>{dish.name}</strong> –{" "}
                                            <span>{dish.category}</span>
                                            {dish.type && (
                                                <span> · <em>{dish.type}</em></span>
                                            )}
                                        </div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(idx)}
                                                style={{ marginRight: "0.5rem" }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(idx)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {dish.description && (
                                        <p style={{ marginTop: "0.5rem" }}>
                                            {dish.description}
                                        </p>
                                    )}

                                    <p style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                                        <strong>Price:</strong>{" "}
                                        {dish.price != null ? `${dish.price} €` : "N/A"}
                                    </p>

                                    {dish.toppings && dish.toppings.length > 0 && (
                                        <p style={{ fontSize: "0.85rem" }}>
                                            <strong>Toppings:</strong>{" "}
                                            {dish.toppings
                                                .map(
                                                    (t) =>
                                                        `${t.name} (${t.price ?? 0} €)`
                                                )
                                                .join(", ")}
                                        </p>
                                    )}

                                    {dish.tags && dish.tags.length > 0 && (
                                        <p style={{ fontSize: "0.85rem" }}>
                                            <strong>Tags:</strong>{" "}
                                            {dish.tags.join(", ")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Form for add / edit */}
            <h4>{editingIndex == null ? "Add a new dish" : "Edit dish"}</h4>

            <form
                onSubmit={handleSubmit}
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    backgroundColor: "#fafafa",
                    maxWidth: "600px",
                }}
            >
                <div style={{ marginBottom: "0.75rem" }}>
                    <label>
                        Name*:
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleFieldChange}
                            style={{
                                marginLeft: "0.5rem",
                                padding: "0.4rem",
                                width: "100%",
                                maxWidth: "350px",
                            }}
                            required
                        />
                    </label>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                    <label>
                        Description:
                        <br />
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleFieldChange}
                            rows={3}
                            style={{ width: "100%", maxWidth: "500px" }}
                        />
                    </label>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        marginBottom: "0.75rem",
                        flexWrap: "wrap",
                    }}
                >
                    <label>
                        Category:
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleFieldChange}
                            style={{ marginLeft: "0.5rem" }}
                        >
                            {GENERAL_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        Type (optional):
                        <input
                            list="dish-types"
                            name="type"
                            value={form.type}
                            onChange={handleFieldChange}
                            style={{ marginLeft: "0.5rem" }}
                            placeholder="e.g. Pasta, Pizza"
                        />
                        <datalist id="dish-types">
                            {SUGGESTED_TYPES.map((t) => (
                                <option key={t} value={t} />
                            ))}
                        </datalist>
                    </label>

                    <label>
                        Price (€):
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            value={form.price}
                            onChange={handleFieldChange}
                            style={{ marginLeft: "0.5rem", width: "100px" }}
                        />
                    </label>
                </div>

                {/* Toppings */}
                <div style={{ marginBottom: "0.75rem" }}>
                    <strong>Paid toppings (optional):</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                        <input
                            type="text"
                            placeholder="Topping name"
                            value={newTopping.name}
                            onChange={(e) =>
                                setNewTopping((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            style={{ marginRight: "0.5rem", padding: "0.3rem" }}
                        />
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Price"
                            value={newTopping.price}
                            onChange={(e) =>
                                setNewTopping((prev) => ({
                                    ...prev,
                                    price: e.target.value,
                                }))
                            }
                            style={{ marginRight: "0.5rem", padding: "0.3rem", width: "80px" }}
                        />
                        <button
                            type="button"
                            onClick={handleAddTopping}
                            disabled={!newTopping.name.trim()}
                        >
                            Add topping
                        </button>
                    </div>

                    {form.toppings.length > 0 && (
                        <ul style={{ marginTop: "0.5rem" }}>
                            {form.toppings.map((t, idx) => (
                                <li key={`${t.name}-${idx}`}>
                                    {t.name} ({t.price ?? 0} €){" "}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTopping(idx)}
                                        style={{ marginLeft: "0.5rem" }}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Tags */}
                <div style={{ marginBottom: "0.75rem" }}>
                    <strong>Tags (dietary / composition):</strong>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem 1rem",
                            marginTop: "0.5rem",
                        }}
                    >
                        {TAG_OPTIONS.map((tag) => (
                            <label key={tag} style={{ fontSize: "0.9rem" }}>
                                <input
                                    type="checkbox"
                                    checked={form.tags.includes(tag)}
                                    onChange={() => handleTagToggle(tag)}
                                    style={{ marginRight: "0.25rem" }}
                                />
                                {tag}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                    <button type="submit" style={{ marginRight: "0.5rem" }}>
                        {editingIndex == null ? "Add dish" : "Save changes"}
                    </button>
                    <button type="button" onClick={handleResetForm}>
                        Reset form
                    </button>
                </div>

                {statusMessage && (
                    <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#555" }}>
                        {statusMessage}
                    </p>
                )}
            </form>
        </div>
    );
}
