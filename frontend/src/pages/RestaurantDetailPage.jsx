import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;

// imagini pentru DISH-uri, după numele din DataSeeder
const dishImages = {
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
    return dishImages[name] || "/images/dish-placeholder.png";
}

// mock toppings / extensions aux plats (R2)
const EXTRA_OPTIONS = {
    "Pizza Margherita": [
        { id: "extra-cheese", label: "Extra cheese", price: 1.0 },
        { id: "olives", label: "Olives", price: 0.5 },
        { id: "spicy-oil", label: "Spicy oil", price: 0.3 },
    ],
    Pasta: [
        { id: "extra-parmesan", label: "Extra parmesan", price: 0.8 },
        { id: "garlic-bread", label: "Garlic bread", price: 1.5 },
    ],
    Ramen: [
        { id: "extra-egg", label: "Extra egg", price: 1.0 },
        { id: "extra-noodles", label: "Extra noodles", price: 1.5 },
    ],
    "Classic Burger": [
        { id: "extra-patty", label: "Double patty", price: 2.5 },
        { id: "extra-cheddar", label: "Extra cheddar", price: 0.8 },
        { id: "bacon", label: "Bacon", price: 1.2 },
    ],
};

function getDishCategory(dish) {
    if (dish.category) return dish.category;
    if (Array.isArray(dish.categories) && dish.categories.length > 0) {
        return dish.categories[0];
    }
    return null;
}

function getDietaryTags(dish) {
    if (Array.isArray(dish.dietaryTags)) return dish.dietaryTags;
    if (Array.isArray(dish.tags)) return dish.tags;
    if (typeof dish.dietaryInfo === "string" && dish.dietaryInfo.trim() !== "") {
        return dish.dietaryInfo.split(",").map((t) => t.trim());
    }
    return [];
}

function isVegetarianDish(dish) {
    const tags = getDietaryTags(dish).map((t) => t.toLowerCase());
    if (tags.some((t) => t.includes("vegetarian") || t.includes("vegan"))) return true;

    // fallback: descrierea conține "vegetarian"/"vegan"
    if (typeof dish.description === "string") {
        const d = dish.description.toLowerCase();
        if (d.includes("vegetarian") || d.includes("vegan")) return true;
    }
    return false;
}

export default function RestaurantDetailPage() {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name || "");

    const { addItem } = useCart();

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [lastAddedDish, setLastAddedDish] = useState(null);
    const [addError, setAddError] = useState("");

    // filtre R2 + C2
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [onlyVegetarian, setOnlyVegetarian] = useState(false);

    // toppings selectate per dish
    const [selectedExtras, setSelectedExtras] = useState({}); // { [dishName]: string[] }

    useEffect(() => {
        async function loadRestaurant() {
            try {
                if (!CATALOG_API_BASE) {
                    throw new Error("VITE_CATALOG_API_BASE is not defined");
                }
                if (!decodedName) {
                    throw new Error("Restaurant name is missing from URL");
                }

                const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                    decodedName
                )}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }

                const data = await response.json();
                setRestaurant(data);
                setError("");
            } catch (err) {
                console.error("Failed to load restaurant details:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unknown error when loading restaurant details"
                );
            } finally {
                setLoading(false);
            }
        }

        void loadRestaurant();
    }, [decodedName]);

    function toggleExtra(dishName, optionId) {
        setSelectedExtras((prev) => {
            const current = prev[dishName] || [];
            if (current.includes(optionId)) {
                return {
                    ...prev,
                    [dishName]: current.filter((id) => id !== optionId),
                };
            }
            return {
                ...prev,
                [dishName]: [...current, optionId],
            };
        });
    }

    function getSelectedExtrasForDish(dish) {
        const allExtras = EXTRA_OPTIONS[dish.name] || [];
        const selectedIds = selectedExtras[dish.name] || [];
        return allExtras.filter((opt) => selectedIds.includes(opt.id));
    }

    async function handleAddToCart(dish) {
        if (!restaurant) return;

        try {
            setAddError("");

            const extras = getSelectedExtrasForDish(dish);
            let dishForCart = dish;

            if (extras.length > 0) {
                const extrasTotal = extras.reduce(
                    (sum, e) => sum + (e.price || 0),
                    0
                );
                dishForCart = {
                    ...dish,
                    // cresc prețul pentru a include toppings (R2 – extra paid options)
                    price:
                        typeof dish.price === "number"
                            ? dish.price + extrasTotal
                            : dish.price,
                    selectedExtras: extras,
                };
            }

            await addItem(dishForCart, restaurant.name);

            setLastAddedDish(dish.name);
            setTimeout(() => {
                setLastAddedDish((prev) => (prev === dish.name ? null : prev));
            }, 1000);
        } catch (err) {
            console.error("Failed to add dish to cart:", err);
            const msg =
                err && typeof err.message === "string"
                    ? err.message
                    : "Could not add this dish to cart (maybe you already have items from another restaurant).";
            setAddError(msg);
        }
    }

    if (loading) {
        return (
            <div>
                <h2 className="page-title">Restaurant menu</h2>
                <p className="page-subtitle">Loading restaurant details…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2 className="page-title">Restaurant menu</h2>
                <p style={{ color: "red" }}>
                    Could not load restaurant details. Details: {error}
                </p>
                <Link className="btn btn-ghost" to="/restaurants">
                    ← Back to restaurants
                </Link>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div>
                <h2 className="page-title">Restaurant menu</h2>
                <p>No data found for this restaurant.</p>
                <Link className="btn btn-ghost" to="/restaurants">
                    ← Back to restaurants
                </Link>
            </div>
        );
    }

    const menu = Array.isArray(restaurant.menu) ? restaurant.menu : [];

    // categoriile existente în meniu (R2 – folosim categoria pentru selecție)
    const categorySet = new Set();
    menu.forEach((dish) => {
        const c = getDishCategory(dish);
        if (c) categorySet.add(c);
    });
    const availableCategories = ["ALL", ...Array.from(categorySet)];

    const filteredMenu = menu.filter((dish) => {
        const cat = getDishCategory(dish);

        if (activeCategory !== "ALL" && cat !== activeCategory) {
            return false;
        }

        if (onlyVegetarian && !isVegetarianDish(dish)) {
            return false;
        }

        return true;
    });

    return (
        <div>
            <div className="section-header">
                <div>
                    <h2 className="page-title">{restaurant.name}</h2>
                    <p className="page-subtitle">
                        Cuisine: {restaurant.cuisineType || "N/A"} · Price range:{" "}
                        {restaurant.priceRange || "N/A"}
                    </p>
                </div>
                <Link className="btn btn-ghost" to="/restaurants">
                    ← Back to restaurants
                </Link>
            </div>

            <div className="section">
                {/* FILTRE – R2 & C2 */}
                <div
                    className="card"
                    style={{
                        padding: "1rem 1.25rem",
                        marginBottom: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                    }}
                >
                    <div>
                        <span
                            style={{
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                marginRight: "0.75rem",
                            }}
                        >
                            Filter by category:
                        </span>
                        <div
                            style={{
                                display: "inline-flex",
                                flexWrap: "wrap",
                                gap: "0.4rem",
                            }}
                        >
                            {availableCategories.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={
                                        activeCategory === c ? "pill pill-active" : "pill"
                                    }
                                    onClick={() => setActiveCategory(c)}
                                >
                                    {c === "ALL" ? "All" : c.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label
                        style={{
                            fontSize: "0.9rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={onlyVegetarian}
                            onChange={(e) => setOnlyVegetarian(e.target.checked)}
                        />
                        Show only vegetarian dishes
                    </label>

                    {addError && (
                        <p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>
                            {addError}
                        </p>
                    )}
                </div>

                <h3 className="page-title">Menu</h3>
                <p className="page-subtitle">
                    Choose your dishes and add them to the cart. You can also select
                    extra paid toppings.
                </p>

                {filteredMenu.length === 0 ? (
                    <p>No dishes match the selected filters for this restaurant.</p>
                ) : (
                    <div className="card-grid">
                        {filteredMenu.map((dish) => {
                            const isJustAdded = lastAddedDish === dish.name;
                            const imgSrc = getDishImage(dish.name);
                            const category = getDishCategory(dish);
                            const dietaryTags = getDietaryTags(dish);
                            const extras = EXTRA_OPTIONS[dish.name] || [];
                            const selectedForDish = selectedExtras[dish.name] || [];

                            return (
                                <article key={dish.name} className="card">
                                    <img
                                        src={imgSrc}
                                        alt={dish.name}
                                        style={{
                                            width: "100%",
                                            borderRadius: "12px",
                                            maxHeight: "140px",
                                            objectFit: "cover",
                                            marginBottom: "0.5rem",
                                        }}
                                    />

                                    <div className="card-header-row">
                                        <div>
                                            <h4 className="card-title">{dish.name}</h4>
                                            {dish.description && (
                                                <div className="card-meta">
                                                    {dish.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <p
                                        style={{
                                            marginTop: "0.5rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {dish.price != null
                                            ? `${dish.price} €`
                                            : "Price N/A"}
                                    </p>

                                    {/* categorie + tag-uri */}
                                    <div className="tag-list">
                                        {category && (
                                            <span className="tag">{category}</span>
                                        )}
                                        {dietaryTags.map((t) => (
                                            <span key={t} className="tag">
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    {/* EXTRA OPTIONS / TOPPINGS */}
                                    {extras.length > 0 && (
                                        <div
                                            style={{
                                                marginTop: "0.6rem",
                                                paddingTop: "0.5rem",
                                                borderTop: "1px solid #e5e7eb",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "0.85rem",
                                                    fontWeight: 500,
                                                    marginBottom: "0.25rem",
                                                }}
                                            >
                                                Extra options:
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "0.25rem",
                                                }}
                                            >
                                                {extras.map((opt) => (
                                                    <label
                                                        key={opt.id}
                                                        style={{
                                                            fontSize: "0.85rem",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "0.4rem",
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedForDish.includes(
                                                                opt.id
                                                            )}
                                                            onChange={() =>
                                                                toggleExtra(
                                                                    dish.name,
                                                                    opt.id
                                                                )
                                                            }
                                                        />
                                                        <span>
                                                            {opt.label}{" "}
                                                            {opt.price != null &&
                                                                `(+${opt.price.toFixed(
                                                                    1
                                                                )} €)`}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(dish)}
                                        className={`btn btn-primary btn-full ${
                                            isJustAdded ? "btn-added" : ""
                                        }`}
                                        style={{ marginTop: "0.75rem" }}
                                    >
                                        {isJustAdded ? "Added ✓" : "Add to cart"}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
