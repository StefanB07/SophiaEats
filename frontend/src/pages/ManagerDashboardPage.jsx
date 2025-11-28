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

    // 2) Load menu when selectedRestaurant changes
    useEffect(() => {
        if (!selectedRestaurant) return;
        setEditingDishName(null);
        resetForm();
        void loadMenuForRestaurant(selectedRestaurant);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <div className="section">
            <div className="section-header">
                <div>
                    <h2 className="page-title">Manager dashboard</h2>
                    <p className="page-subtitle">
                        Manage restaurant dishes (requirement R4* – add / update menu).
                    </p>
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
                            <strong>dietary info</strong> (requirement R4*).
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

                </>
            )}
        </div>
    );
}
