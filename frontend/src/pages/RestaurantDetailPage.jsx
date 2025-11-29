import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;

// imagini pentru DISH-uri, după numele din DataSeeder
const dishImages = {
    "Pizza Margherita": "/images/pizza-margherita.webp",
    "Pasta": "/images/pasta.jpeg",
    "Lasagna": "/images/lasagna.jpeg",
    "Bruschetta": "/images/bruschetta.jpg",
    "Tiramisu": "/images/tiramisu.webp",

    "Soba": "/images/soba.png",
    "Udon": "/images/udon.png",
    "Ramen": "/images/ramen.png",
    "Edamame": "/images/edamame.png",

    "Buddha Bowl": "/images/buddha-bowl.png",
    "Veggie Burger": "/images/veggie-burger.png",
    "Caesar Salad": "/images/caesar-salad.png",
    "Chia Pudding": "/images/chia-pudding.png",

    "Classic Burger": "/images/classic-burger.png",
    "Crispy Chicken Burger": "/images/crispy-chicken-burger.png",
    "French Fries": "/images/french-fries.png",
    "Chocolate Brownie": "/images/chocolate-brownie.png",
};

export default function RestaurantDetailPage() {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name || "");

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // NEW: State for the active filter
    const [activeFilter, setActiveFilter] = useState("All");

    const { addItem } = useCart();

    // pentru feedback vizual pe buton ("Added ✓")
    const [lastAddedDish, setLastAddedDish] = useState(null);

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

    function handleAddToCart(dish) {
        if (!restaurant) return;
        addItem(dish, restaurant.name);

        // marcăm dish-ul ca "tocmai adăugat"
        setLastAddedDish(dish.name);
        // după 1 secundă revenim la starea normală
        setTimeout(() => {
            setLastAddedDish((prev) => (prev === dish.name ? null : prev));
        }, 1000);
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
                <Link className="btn btn-ghost" to="/">
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
            </div>
        );
    }

    const menu = restaurant.menu || [];

    // --- NEW: Filter Logic ---
    // 1. Extract unique categories and tags
    const allTags = new Set();
    menu.forEach(dish => {
        dish.categories?.forEach(c => allTags.add(c));
        dish.dietaryTags?.forEach(t => allTags.add(t));
    });
    const filterOptions = ["All", ...Array.from(allTags)];

    // 2. Filter the menu based on selection
    const filteredMenu = activeFilter === "All"
        ? menu
        : menu.filter(dish =>
            dish.categories?.includes(activeFilter) ||
            dish.dietaryTags?.includes(activeFilter)
        );

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
                <Link className="btn btn-ghost" to="/">
                    ← Back to restaurants
                </Link>
            </div>

            {/* am scos complet poza mare a restaurantului */}

            <div className="section">
                <h3 className="page-title">Menu</h3>
                <p className="page-subtitle">
                    Choose your dishes and add them to the cart.
                </p>

                {/* --- NEW: Filter Buttons UI --- */}
                {menu.length > 0 && (
                    <div className="filter-container">
                        {filterOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => setActiveFilter(option)}
                                className={`filter-btn ${activeFilter === option ? 'active' : ''}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                )}

                {menu.length === 0 ? (
                    <p>No dishes defined for this restaurant yet.</p>
                ) : filteredMenu.length === 0 ? (
                    <p>No dishes found for the selected filter.</p>
                ) : (
                    <div className="card-grid">
                        {filteredMenu.map((dish) => {
                            const isJustAdded = lastAddedDish === dish.name;
                            const dishImg =
                                dishImages[dish.name] || "/images/dish-placeholder.png";

                            return (
                                <article key={dish.name} className="card">
                                    <img
                                        src={dishImg}
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
                                                <div className="card-meta">{dish.description}</div>
                                            )}
                                        </div>
                                    </div>

                                    <p style={{ marginTop: "0.5rem", fontWeight: 500 }}>
                                        {dish.price != null ? `${dish.price} €` : "Price N/A"}
                                    </p>

                                    {dish.categories && dish.categories.length > 0 && (
                                        <div className="tag-list">
                                            {dish.categories.map((c) => (
                                                <span key={c} className="tag">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {dish.dietaryTags && dish.dietaryTags.length > 0 && (
                                        <div className="tag-list">
                                            {dish.dietaryTags.map((t) => (
                                                <span key={t} className="tag">
                                                    {t}
                                                </span>
                                            ))}
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