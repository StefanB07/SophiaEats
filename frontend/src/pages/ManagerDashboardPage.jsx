<<<<<<< HEAD
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";

const CATALOG_API_BASE =
    import.meta.env.VITE_CATALOG_API_BASE || "http://localhost:8080";

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

    // add-slot form
    const [slotDate, setSlotDate] = useState("");      // yyyy-MM-dd
    const [slotTime, setSlotTime] = useState("");      // HH:mm
    const [slotCapacity, setSlotCapacity] = useState("");

    // form state (add / edit)
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("MAIN_COURSE");
    const [type, setType] = useState("");
    const [dietaryInfo, setDietaryInfo] = useState("");

    const [editingDishName, setEditingDishName] = useState(null);
    const [status, setStatus] = useState(null); // {type:"success"|"error", msg:string}
    const [submitting, setSubmitting] = useState(false);


    // 1) Load all restaurants on mount
    useEffect(() => {
        async function loadRestaurants() {
            setLoadingRestaurants(true);
            setRestaurantsError("");
            try {
                const resp = await fetch(`${CATALOG_API_BASE}/restaurants`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                setRestaurants(data);
                if (data.length > 0) {
                    setSelectedRestaurant(data[0].name);
                }
            } catch (e) {
                console.error("Failed to load restaurants for manager:", e);
                setRestaurantsError(
                    e instanceof Error ? e.message : "Unknown error loading restaurants",
                );
            } finally {
                setLoadingRestaurants(false);
            }
        }

        loadRestaurants();
    }, []);

    // Helper for loading menu
    async function loadMenuForRestaurant(restaurantName) {
        if (!restaurantName) return;
        try {
            setLoadingMenu(true);
            setMenuError("");
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                restaurantName,
            )}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const menuFromBackend = Array.isArray(data.menu) ? data.menu : [];
            setMenu(menuFromBackend);
        } catch (e) {
            console.error("Failed to load menu for manager:", e);
            setMenuError(
                e instanceof Error ? e.message : "Unknown error loading menu",
            );
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
            const url = `${CATALOG_API_BASE}/delivery/slots?restaurant=${encodeURIComponent(
                restaurantName
            )}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setSlots(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load slots for manager:", e);
            setSlotsError(
                e instanceof Error ? e.message : "Unknown error loading slots"
            );
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }


    // 2) Load menu when selectedRestaurant changes
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
        setEditingDishName(dish.name); // save the old name for PUT URL
        setName(dish.name || "");
        setDescription(dish.description || "");
        setPrice(dish.price != null ? String(dish.price) : "");
        setCategory(dish.category || "MAIN_COURSE");
        setType(dish.type || "");

        const infoFromTags =
            Array.isArray(dish.dietaryTags) && dish.dietaryTags.length > 0
                ? dish.dietaryTags.join(", ")
                : dish.dietaryInfo || "";
        setDietaryInfo(infoFromTags);

        setStatus(null);
    }

    async function handleDelete(dishName) {
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete dish "${dishName}" from "${selectedRestaurant}"?`,
        );
        if (!confirmed) return;

        try {
            setSubmitting(true);
            setStatus(null);

            const baseUrl = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                selectedRestaurant,
            )}/dishes/${encodeURIComponent(dishName)}`;

            const resp = await fetch(baseUrl, {
                method: "DELETE",
                headers: { Accept: "application/json" },
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            setStatus({
                type: "success",
                msg: `Dish "${dishName}" was deleted.`,
            });

            await loadMenuForRestaurant(selectedRestaurant);
            resetForm();
        } catch (e) {
            console.error("Failed to delete dish", e);
            setStatus({
                type: "error",
                msg: e instanceof Error ? e.message : "Could not delete dish.",
            });
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
            const baseUrl = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                selectedRestaurant,
            )}/dishes`;

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

            // edit -> PUT /restaurants/{rest}/dishes/{old_name}
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
            console.log("Dish saved:", result);

            setStatus({
                type: "success",
                msg: editingDishName
                    ? `Dish "${editingDishName}" was updated.`
                    : `Dish "${result.name}" was added to ${selectedRestaurant}.`,
            });

            await loadMenuForRestaurant(selectedRestaurant);
            resetForm();
        } catch (e) {
            console.error("Failed to save dish", e);
            setStatus({
                type: "error",
                msg: e instanceof Error ? e.message : "Could not save dish.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    function handleSlotCapacityChange(index, value) {
        setSlots((prev) =>
            prev.map((s, i) =>
                i === index
                    ? { ...s, capacity: value === "" ? "" : Number(value) || 0 }
                    : s
            )
        );
    }

    async function handleSaveSlots(e) {
        e.preventDefault();
        setStatus(null);

        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }

        const cleaned = slots
            .map((s) => ({
                label: s.label,
                capacity: Number(s.capacity),
            }))
            .filter(
                (s) =>
                    s.label &&
                    !Number.isNaN(s.capacity) &&
                    s.capacity >= 0
            );

        if (cleaned.length === 0) {
            setStatus({
                type: "error",
                msg: "No valid slots to send.",
            });
            return;
        }

        try {
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                selectedRestaurant
            )}/slots`;

            const resp = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slots: cleaned }),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            setStatus({
                type: "success",
                msg: "Delivery slot capacities updated.",
            });

            await loadSlotsForRestaurant(selectedRestaurant);
        } catch (e) {
            console.error("Failed to update slots", e);
            setStatus({
                type: "error",
                msg: e instanceof Error ? e.message : "Could not update slots.",
            });
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
            setStatus({
                type: "error",
                msg: "Please select both date and time for the new slot.",
            });
            return;
        }

        const capNum = Number(slotCapacity);
        if (Number.isNaN(capNum) || capNum <= 0) {
            setStatus({
                type: "error",
                msg: "Capacity for new slot must be a positive number.",
            });
            return;
        }

        const timePart = slotTime.slice(0, 5); // HH:mm
        const start = `${slotDate} ${timePart}`;

        try {
            setSubmitting(true);
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                selectedRestaurant
            )}/slots`;

            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start,
                    capacity: capNum,
                }),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            const created = await resp.json();
            console.log("New slot created:", created);

            setStatus({
                type: "success",
                msg: `New slot ${created.label} added for ${selectedRestaurant}.`,
            });

            setSlotDate("");
            setSlotTime("");
            setSlotCapacity("");

            await loadSlotsForRestaurant(selectedRestaurant);
        } catch (e) {
            console.error("Failed to add slot", e);
            setStatus({
                type: "error",
                msg: e instanceof Error ? e.message : "Could not add slot.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteSlot(label) {
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete slot "${label}" for "${selectedRestaurant}"?`
        );
        if (!confirmed) return;

        try {
            setSubmitting(true);
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                selectedRestaurant
            )}/slots?label=${encodeURIComponent(label)}`;

            const resp = await fetch(url, {
                method: "DELETE",
                headers: { Accept: "application/json" },
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            setStatus({
                type: "success",
                msg: `Slot "${label}" was deleted.`,
            });

            await loadSlotsForRestaurant(selectedRestaurant);
        } catch (e) {
            console.error("Failed to delete slot", e);
            setStatus({
                type: "error",
                msg: e instanceof Error ? e.message : "Could not delete slot.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="section">
            <div className="section-header">
                <div>
                    <h2 className="page-title">Manager dashboard</h2>
                </div>
            </div>

            <p style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                Logged in as manager with user ID:{" "}
                <strong>{currentUser || "(none)"}</strong>
            </p>

            {/* Restaurant selector */}
            {loadingRestaurants && <p>Loading restaurants...</p>}
            {restaurantsError && (
                <p style={{ color: "red" }}>Error: {restaurantsError}</p>
            )}

            {!loadingRestaurants && !restaurantsError && restaurants.length === 0 && (
                <p>No restaurants available.</p>
            )}

            {!loadingRestaurants && restaurants.length > 0 && (
                <>
                    <div
                        style={{
                            marginTop: "1rem",
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            background:
                                "linear-gradient(90deg,#eff6ff,#f9fafb,#fefce8)",
                        }}
                    >
                        <label style={{ fontSize: "0.9rem" }}>
                            Managing restaurant:{" "}
                            <select
                                value={selectedRestaurant}
                                onChange={(e) => setSelectedRestaurant(e.target.value)}
                                style={{
                                    marginLeft: "0.5rem",
                                    minWidth: "220px",
                                    padding: "0.3rem 0.5rem",
                                }}
                            >
                                {restaurants.map((r) => (
                                    <option key={r.name} value={r.name}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Menu list */}
                    <section style={{ marginTop: "1.5rem" }}>
                        <h3>Current menu</h3>
                        {loadingMenu && <p>Loading menu...</p>}
                        {menuError && (
                            <p style={{ color: "red" }}>Error: {menuError}</p>
                        )}

                        {!loadingMenu && !menuError && menu.length === 0 && (
                            <p>No dishes defined yet for this restaurant.</p>
                        )}

                        {!loadingMenu && !menuError && menu.length > 0 && (
                            <div
                                style={{
                                    display: "grid",
                                    gap: "0.75rem",
                                    marginTop: "0.75rem",
                                }}
                            >
                                {menu.map((dish) => (
                                    <div
                                        key={dish.name}
                                        style={{
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "16px",
                                            padding: "0.75rem 1rem",
                                            backgroundColor: "#ffffff",
                                            boxShadow: "0 10px 25px rgba(15,23,42,0.04)",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "1rem",
                                                alignItems: "flex-start",
                                            }}
                                        >
                                            <img
                                                src={getDishImage(dish.name)}
                                                alt={dish.name}
                                                style={{
                                                    width: "72px",
                                                    height: "72px",
                                                    objectFit: "cover",
                                                    borderRadius: "12px",
                                                    flexShrink: 0,
                                                }}
                                            />

                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div>
                                                        <strong>{dish.name}</strong>{" "}
                                                        {dish.price != null && (
                                                            <span>– {dish.price} €</span>
                                                        )}
                                                        <div
                                                            style={{
                                                                marginTop: "0.2rem",
                                                                fontSize: "0.8rem",
                                                                color: "#6b7280",
                                                            }}
                                                        >
                                                            {dish.category && (
                                                                <span>
                                                                    {dish.category}
                                                                    {dish.type
                                                                        ? ` · ${dish.type}`
                                                                        : ""}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "0.5rem",
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => startEdit(dish)}
                                                            disabled={submitting}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(dish.name)
                                                            }
                                                            disabled={submitting}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {dish.description && (
                                                    <p
                                                        style={{
                                                            marginTop: "0.35rem",
                                                            fontSize: "0.9rem",
                                                            color: "#4b5563",
                                                        }}
                                                    >
                                                        {dish.description}
                                                    </p>
                                                )}

                                                {Array.isArray(dish.dietaryTags) &&
                                                    dish.dietaryTags.length > 0 && (
                                                        <div
                                                            style={{
                                                                marginTop: "0.35rem",
                                                                display: "flex",
                                                                flexWrap: "wrap",
                                                                gap: "0.25rem",
                                                            }}
                                                        >
                                                            {dish.dietaryTags.map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="tag"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Form add / edit */}
                    <section style={{ marginTop: "2rem" }}>
                        <h3 className="card-title">
                            {editingDishName ? `Edit dish: ${editingDishName}` : "Add a new dish"}
                        </h3>

                        <p
                            style={{
                                marginTop: "0.35rem",
                                fontSize: "0.85rem",
                                color: "#6b7280",
                            }}
                        >
                            Use this form to create or update dishes with{" "}
                            <strong>name, description, category, type</strong> and{" "}
                            <strong>dietary info</strong> .
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            style={{
                                marginTop: "1.25rem",
                                marginBottom: "0.5rem",
                                padding: "1.75rem 2rem",
                                borderRadius: "24px",
                                background:
                                    "radial-gradient(circle at top left,#eef2ff,#f9fafb,#fee2e2)",
                                boxShadow: "0 24px 60px rgba(15,23,42,0.16)",
                                maxWidth: "720px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            {/* Name */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    Name*:
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Pizza Margherita"
                                    style={{
                                        width: "100%",
                                        marginTop: "0.35rem",
                                        padding: "0.6rem 0.8rem",
                                        borderRadius: "0.9rem",
                                        border: "1px solid #d1d5db",
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    Description*:
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Classic pizza with tomato sauce and mozzarella."
                                    style={{
                                        width: "100%",
                                        marginTop: "0.35rem",
                                        padding: "0.6rem 0.8rem",
                                        borderRadius: "0.9rem",
                                        border: "1px solid #d1d5db",
                                        resize: "vertical",
                                    }}
                                />
                            </div>

                            {/* Price + Category + Type on one line */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "0.7fr 0.8fr 1fr",
                                    gap: "0.75rem",
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Price (€)*:
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        style={{
                                            width: "100%",
                                            marginTop: "0.35rem",
                                            padding: "0.6rem 0.8rem",
                                            borderRadius: "0.9rem",
                                            border: "1px solid #d1d5db",
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Category*:
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        style={{
                                            width: "100%",
                                            marginTop: "0.35rem",
                                            padding: "0.6rem 0.8rem",
                                            borderRadius: "0.9rem",
                                            border: "1px solid #d1d5db",
                                        }}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Type (optional):
                                    </label>
                                    <input
                                        type="text"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        placeholder="Pizza, Pasta, Burger…"
                                        style={{
                                            width: "100%",
                                            marginTop: "0.35rem",
                                            padding: "0.6rem 0.8rem",
                                            borderRadius: "0.9rem",
                                            border: "1px solid #d1d5db",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Dietary info */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    Dietary / composition info:
                                </label>
                                <input
                                    type="text"
                                    value={dietaryInfo}
                                    onChange={(e) => setDietaryInfo(e.target.value)}
                                    placeholder="vegetarian, gluten-free, contains peanuts…"
                                    style={{
                                        width: "100%",
                                        marginTop: "0.35rem",
                                        padding: "0.6rem 0.8rem",
                                        borderRadius: "0.9rem",
                                        border: "1px solid #d1d5db",
                                    }}
                                />
                                <p
                                    style={{
                                        marginTop: "0.25rem",
                                        fontSize: "0.8rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    This will be shown to students when they browse the menu (e.g.
                                    vegetarian, vegan, contains lactose).
                                </p>
                            </div>

                            {/* Buttons + status */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: "0.75rem",
                                    gap: "0.75rem",
                                    flexWrap: "wrap",
                                }}
                            >
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn btn-primary"
                                        style={{
                                            borderRadius: "999px",
                                            paddingInline: "1.5rem",
                                        }}
                                    >
                                        {submitting
                                            ? "Saving..."
                                            : editingDishName
                                                ? "Save changes"
                                                : "Add dish"}
                                    </button>

                                    {editingDishName && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            disabled={submitting}
                                            className="btn btn-ghost"
                                        >
                                            Cancel edit
                                        </button>
                                    )}
                                </div>

                                {status && (
                                    <p
                                        style={{
                                            color: status.type === "error" ? "#b91c1c" : "#15803d",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {status.msg}
                                    </p>
                                )}
                            </div>

                            <p
                                style={{
                                    fontSize: "0.8rem",
                                    color: "#6b7280",
                                    marginTop: "0.5rem",
                                }}
                            >
                                Existing dishes from the data seeder can be edited by clicking{" "}
                                <strong>"Edit"</strong> in the list above. Changes are kept in
                                memory for the current server session.
                            </p>
                        </form>
                    </section>
                    {/* R5: manage opening hours / capacities */}
                    <section style={{ marginTop: "2rem" }}>
                        <h3>Delivery capacities (R5)</h3>
                        <p style={{ fontSize: "0.9rem", color: "#555" }}>
                            Slots are pre-seeded in the backend (DataSeeder) and you can
                            adjust the <strong>capacity</strong> (number of orders per half
                            hour), add new slots or delete existing ones for the selected
                            restaurant.
                        </p>

                        {loadingSlots && <p>Loading delivery slots...</p>}
                        {slotsError && (
                            <p style={{ color: "red" }}>Error: {slotsError}</p>
                        )}

                        {!loadingSlots && !slotsError && slots.length === 0 && (
                            <p>No delivery slots defined for this restaurant.</p>
                        )}

                        {!loadingSlots && !slotsError && slots.length > 0 && (
                            <form
                                onSubmit={handleSaveSlots}
                                style={{
                                    marginTop: "1rem",
                                    padding: "1rem",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    backgroundColor: "#fafafa",
                                }}
                            >
                                <table
                                    style={{
                                        width: "100%",
                                        borderCollapse: "collapse",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    <thead>
                                    <tr>
                                        <th
                                            style={{
                                                textAlign: "left",
                                                borderBottom: "1px solid #ccc",
                                                paddingBottom: "0.5rem",
                                            }}
                                        >
                                            Time slot
                                        </th>
                                        <th
                                            style={{
                                                textAlign: "left",
                                                borderBottom: "1px solid #ccc",
                                                paddingBottom: "0.5rem",
                                            }}
                                        >
                                            Capacity (orders / 30 min)
                                        </th>
                                        <th
                                            style={{
                                                textAlign: "left",
                                                borderBottom: "1px solid #ccc",
                                                paddingBottom: "0.5rem",
                                            }}
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {slots.map((slot, idx) => (
                                        <tr key={slot.label}>
                                            <td style={{ padding: "0.4rem 0" }}>
                                                {slot.label}
                                            </td>
                                            <td style={{ padding: "0.4rem 0" }}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={slot.capacity ?? 0}
                                                    onChange={(e) =>
                                                        handleSlotCapacityChange(
                                                            idx,
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{ width: "80px" }}
                                                />
                                            </td>
                                            <td style={{ padding: "0.4rem 0" }}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteSlot(slot.label)
                                                    }
                                                    disabled={submitting}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{ marginTop: "0.75rem" }}
                                >
                                    {submitting ? "Saving..." : "Save capacities"}
                                </button>
                            </form>
                        )}

                        {/* Add new slot */}
                        <form
                            onSubmit={handleAddSlot}
                            style={{
                                marginTop: "1.5rem",
                                padding: "1rem",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                backgroundColor: "#fafafa",
                                maxWidth: "520px",
                            }}
                        >
                            <h4>Add a new slot</h4>
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "0.75rem",
                                    marginTop: "0.5rem",
                                }}
                            >
                                <label>
                                    Date:
                                    <input
                                        type="date"
                                        value={slotDate}
                                        onChange={(e) => setSlotDate(e.target.value)}
                                    />
                                </label>

                                <label>
                                    Time:
                                    <input
                                        type="time"
                                        value={slotTime}
                                        onChange={(e) => setSlotTime(e.target.value)}
                                    />
                                </label>

                                <label>
                                    Capacity:
                                    <input
                                        type="number"
                                        min="1"
                                        value={slotCapacity}
                                        onChange={(e) =>
                                            setSlotCapacity(e.target.value)
                                        }
                                        style={{ width: "90px" }}
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{ marginTop: "0.75rem" }}
                            >
                                {submitting ? "Adding..." : "Add slot"}
                            </button>
                        </form>
                    </section>

                    {status && (
                        <p
                            style={{
                                color: status.type === "error" ? "red" : "green",
                                marginTop: "1rem",
                                fontWeight: 500,
                            }}
                        >
                            {status.msg}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
=======
=======
>>>>>>> origin/db_mare_fail
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { handleApiError } from "../utils/apiUtils.js";

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
                if (!resp.ok) await handleApiError(resp);
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
            if (!resp.ok) await handleApiError(resp);
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
            if (!resp.ok) await handleApiError(resp);
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
        if (editingDishName === dish.name) {
            resetForm();
            return;
        }
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

    function handleAddNewDishClick() {
        if (editingDishName === "__NEW__") {
            resetForm();
            return;
        }
        resetForm();
        setEditingDishName("__NEW__");
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
                await handleApiError(resp);
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
            if (editingDishName && editingDishName !== "__NEW__") {
                url = `${baseUrl}/${encodeURIComponent(editingDishName)}`;
                method = "PUT";
            }

            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                await handleApiError(resp);
            }

            const result = await resp.json();
            setStatus({
                type: "success",
                msg: (editingDishName && editingDishName !== "__NEW__") ? `Dish "${editingDishName}" was updated.` : `Dish "${result.name}" was added.`,
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
                await handleApiError(resp);
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
                await handleApiError(resp);
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
                await handleApiError(resp);
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

    function renderDishForm() {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-midnight-navy p-6 rounded-xl border border-luminescent-line">
                <h4 className="text-xl font-heading font-bold text-starlight-white mb-2">
                    {editingDishName === "__NEW__" ? "Add New Dish" : `Edit Dish: ${editingDishName}`}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-starlight-white">Name*</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-luminescent-line bg-deep-sea-surface text-starlight-white focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-starlight-white">Price (€)*</label>
                        <input type="number" step="0.1" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-luminescent-line bg-deep-sea-surface text-starlight-white focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors" />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-starlight-white">Description*</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="2" className="w-full px-4 py-2.5 rounded-xl border border-luminescent-line bg-deep-sea-surface text-starlight-white focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors resize-none"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-starlight-white">Category*</label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className="appearance-none w-full px-4 pr-12 py-2.5 rounded-xl border border-luminescent-line bg-deep-sea-surface text-starlight-white focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors cursor-pointer"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F8FAFC' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 1.25rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em'
                            }}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-starlight-white">Type</label>
                        <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Pizza" className="w-full px-4 py-2.5 rounded-xl border border-luminescent-line bg-deep-sea-surface text-starlight-white focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors" />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-starlight-white">Dietary Tags</label>
                    <input type="text" value={dietaryInfo} onChange={(e) => setDietaryInfo(e.target.value)} placeholder="vegetarian, gluten-free..." className="w-full px-4 py-2.5 rounded-xl border border-luminescent-line bg-deep-sea-surface text-starlight-white focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors" />
                </div>
                
                <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={submitting} variant="primary" className="flex-1">
                        {submitting ? "Saving..." : editingDishName && editingDishName !== "__NEW__" ? "Update Dish" : "Save Dish"}
                    </Button>
                    <Button type="button" onClick={resetForm} disabled={submitting} variant="outline" className="flex-1">
                        Cancel
                    </Button>
                </div>
            </form>
        );
    }

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-4xl font-heading font-bold text-starlight-white mb-2">Manager Dashboard</h2>
                <p className="text-fog-gray text-lg">Manage menus, capacities, and delivery schedules.</p>
            </div>

            {loadingRestaurants && <div className="text-fog-gray animate-pulse font-medium text-lg">Loading restaurants...</div>}
            {restaurantsError && <div className="bg-crimson-alert/10 text-crimson-alert p-4 rounded-xl border border-crimson-alert/20 font-medium">{restaurantsError}</div>}
            
            {!loadingRestaurants && !restaurantsError && restaurants.length === 0 && (
                <Card className="text-center py-12 border-dashed border-2 border-luminescent-line bg-transparent shadow-none">
                    <p className="text-lg font-heading font-bold text-starlight-white">No restaurants available.</p>
                </Card>
            )}

            {!loadingRestaurants && restaurants.length > 0 && (
                <div className="space-y-8">
                    <Card className="flex flex-col sm:flex-row sm:items-center gap-4 border-none shadow-md ring-1 ring-luminescent-line bg-deep-sea-surface">
                        <label className="font-semibold text-starlight-white uppercase tracking-wide text-sm whitespace-nowrap">Managing Restaurant:</label>
                        <select
                            value={selectedRestaurant}
                            onChange={(e) => setSelectedRestaurant(e.target.value)}
                            className="appearance-none flex-1 w-full sm:max-w-md px-4 pr-12 py-3 rounded-xl border-2 border-luminescent-line bg-midnight-navy text-starlight-white font-medium focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors shadow-sm cursor-pointer"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F8FAFC' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 1.25rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em'
                            }}
                        >
                            {restaurants.map((r) => (
                                <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                    </Card>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <Card className="flex flex-col gap-6 shadow-lg border-transparent">
                            <div className="flex items-center justify-between border-b border-luminescent-line pb-4">
                                <h3 className="text-2xl font-heading font-bold text-starlight-white">Current Menu</h3>
                            </div>
                            
                            {loadingMenu && <p className="text-fog-gray animate-pulse">Loading menu...</p>}
                            {menuError && <p className="text-crimson-alert font-medium">{menuError}</p>}
                            {!loadingMenu && !menuError && menu.length === 0 && <p className="text-fog-gray">No dishes defined yet.</p>}

                            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {!loadingMenu && !menuError && menu.length > 0 && menu.map((dish) => (
                                    <div key={dish.name} className="flex flex-col gap-4 p-4 rounded-xl border border-luminescent-line bg-midnight-navy hover:border-wave-crest-blue/30 transition-colors shadow-sm group">
                                        <div className="flex gap-4">
                                            <img
                                                src={getDishImage(dish.name)}
                                                alt={dish.name}
                                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                onError={(e) => { e.target.src = '/images/dish-placeholder.png'; }}
                                            />
                                            <div className="flex flex-col flex-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-heading font-bold text-starlight-white leading-tight">{dish.name}</h4>
                                                    <span className="font-bold text-wave-crest-blue whitespace-nowrap">{dish.price != null ? `${dish.price} €` : ""}</span>
                                                </div>
                                                <span className="text-xs font-semibold text-fog-gray mt-1">{dish.category} {dish.type ? `· ${dish.type}` : ""}</span>
                                                {dish.description && <p className="text-sm text-fog-gray mt-2 line-clamp-2">{dish.description}</p>}
                                                {Array.isArray(dish.dietaryTags) && dish.dietaryTags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {dish.dietaryTags.map((tag) => (
                                                            <span key={tag} className="text-[10px] uppercase tracking-wider bg-deep-sea-surface border border-luminescent-line text-starlight-white px-1.5 py-0.5 rounded">{tag}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex gap-2 mt-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(dish)} disabled={submitting} className="text-xs font-semibold text-wave-crest-blue hover:text-starlight-white transition-colors bg-wave-crest-blue/10 px-3 py-1.5 rounded-md hover:bg-wave-crest-blue/20">Edit</button>
                                                    <button onClick={() => handleDelete(dish.name)} disabled={submitting} className="text-xs font-semibold text-crimson-alert hover:text-starlight-white transition-colors bg-crimson-alert/10 px-3 py-1.5 rounded-md hover:bg-crimson-alert/80">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                        {editingDishName === dish.name && (
                                            <div className="border-t border-luminescent-line pt-4">
                                                {renderDishForm()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2">
                                {editingDishName !== "__NEW__" ? (
                                    <Button onClick={handleAddNewDishClick} variant="outline" className="w-full border-dashed">
                                        + Add New Dish
                                    </Button>
                                ) : (
                                    <div className="mt-4">
                                        {renderDishForm()}
                                    </div>
                                )}
                            </div>
                        </Card>

                        <div className="space-y-8">
                            <Card className="flex flex-col gap-6 shadow-lg border-transparent">
                                <div className="flex items-center justify-between border-b border-luminescent-line pb-4">
                                    <h3 className="text-2xl font-heading font-bold text-starlight-white">Delivery Capacities</h3>
                                </div>
                                
                                {loadingSlots && <p className="text-fog-gray animate-pulse">Loading slots...</p>}
                                {slotsError && <p className="text-crimson-alert font-medium">{slotsError}</p>}
                                
                                <form onSubmit={handleSaveSlots} className="flex flex-col gap-4">
                                    {!loadingSlots && !slotsError && slots.length === 0 ? (
                                        <p className="text-fog-gray italic">No active slots found.</p>
                                    ) : (
                                        <div className="max-h-[300px] overflow-y-auto overflow-x-auto pr-2 custom-scrollbar border border-luminescent-line rounded-xl">
                                            <table className="w-full text-left text-sm min-w-[300px]">
                                                <thead className="bg-midnight-navy border-b border-luminescent-line sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold text-starlight-white uppercase tracking-wider">Time Slot</th>
                                                        <th className="px-4 py-3 font-semibold text-starlight-white uppercase tracking-wider">Capacity</th>
                                                        <th className="px-4 py-3 font-semibold text-starlight-white uppercase tracking-wider w-20">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {slots.map((slot, idx) => (
                                                        <tr key={slot.label} className="border-b border-luminescent-line last:border-0 hover:bg-deep-sea-surface/50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-starlight-white">{slot.label}</td>
                                                            <td className="px-4 py-3">
                                                                <input type="number" min="0" value={slot.capacity ?? 0} onChange={(e) => handleSlotCapacityChange(idx, e.target.value)} className="w-24 px-3 py-1.5 rounded-lg border border-luminescent-line bg-deep-sea-surface text-starlight-white focus:border-wave-crest-blue outline-none transition-colors" />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button type="button" onClick={() => handleDeleteSlot(slot.label)} disabled={submitting} className="text-crimson-alert hover:text-starlight-white bg-crimson-alert/10 hover:bg-crimson-alert/80 px-2 py-1 rounded transition-colors text-xs font-bold uppercase tracking-wider">Del</button>
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

                            <Card className="flex flex-col gap-6 shadow-lg border-transparent">
                                <h4 className="text-xl font-heading font-bold text-starlight-white border-b border-luminescent-line pb-4">Add New Slot</h4>
                                <form onSubmit={handleAddSlot} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-starlight-white uppercase tracking-wider">Date</label>
                                            <input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-luminescent-line bg-midnight-navy text-starlight-white focus:border-wave-crest-blue outline-none transition-colors [color-scheme:dark]" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-starlight-white uppercase tracking-wider">Time</label>
                                            <input type="time" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-luminescent-line bg-midnight-navy text-starlight-white focus:border-wave-crest-blue outline-none transition-colors [color-scheme:dark]" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-semibold text-starlight-white uppercase tracking-wider">Capacity</label>
                                            <input type="number" min="1" value={slotCapacity} onChange={(e) => setSlotCapacity(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-luminescent-line bg-midnight-navy text-starlight-white focus:border-wave-crest-blue outline-none transition-colors" />
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
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 duration-300 ${status.type === 'error' ? 'bg-midnight-navy border-crimson-alert text-crimson-alert' : 'bg-mint-glow text-midnight-navy border-mint-glow'}`}>
                    <span className="font-bold text-lg">{status.type === 'error' ? '⚠️' : '✓'}</span>
                    <span className="font-medium">{status.msg}</span>
                    <button onClick={() => setStatus(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
                </div>
            )}
        </div>
    );
}
<<<<<<< HEAD
>>>>>>> 973a4b5ee0724c8af2a79148676bd95c2cbe45ed
=======
>>>>>>> origin/db_mare_fail
