<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> origin/db_mare_fail
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;

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
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [onlyVegetarian, setOnlyVegetarian] = useState(false);
    const [selectedExtras, setSelectedExtras] = useState({});

    useEffect(() => {
        async function loadRestaurant() {
            try {
                if (!CATALOG_API_BASE) {
                    throw new Error("VITE_CATALOG_API_BASE is not defined");
                }
                if (!decodedName) {
                    throw new Error("Restaurant name is missing from URL");
                }
                const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(decodedName)}`;
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }
                const data = await response.json();
                setRestaurant(data);
                setError("");
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Unknown error");
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
                return { ...prev, [dishName]: current.filter((id) => id !== optionId) };
            }
            return { ...prev, [dishName]: [...current, optionId] };
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
                const extrasTotal = extras.reduce((sum, e) => sum + (e.price || 0), 0);
                dishForCart = {
                    ...dish,
                    price: typeof dish.price === "number" ? dish.price + extrasTotal : dish.price,
                    selectedExtras: extras,
                };
            }

            await addItem(dishForCart, restaurant.name);
            setLastAddedDish(dish.name);
            setTimeout(() => {
                setLastAddedDish((prev) => (prev === dish.name ? null : prev));
            }, 1000);
        } catch (err) {
            console.error(err);
            setAddError(err && typeof err.message === "string" ? err.message : "Could not add this dish to cart");
        }
    }

    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-3xl font-heading font-bold text-starlight-white mb-2">Restaurant menu</h2>
                <p className="text-fog-gray animate-pulse">Loading restaurant details…</p>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="py-8 space-y-4">
                <h2 className="text-3xl font-heading font-bold text-starlight-white mb-2">Restaurant menu</h2>
                <p className="text-crimson-alert font-medium bg-deep-sea-surface p-4 rounded-lg border border-luminescent-line shadow-sm">
                    {error || "No data found for this restaurant."}
                </p>
                <Link to="/restaurants" className="inline-flex text-wave-crest-blue hover:text-starlight-white font-semibold transition-colors">
                    ← Back to restaurants
                </Link>
            </div>
        );
    }

    const menu = Array.isArray(restaurant.menu) ? restaurant.menu : [];
    const categorySet = new Set();
    menu.forEach((dish) => {
        const c = getDishCategory(dish);
        if (c) categorySet.add(c);
    });
    const availableCategories = ["ALL", ...Array.from(categorySet)];

    const filteredMenu = menu.filter((dish) => {
        const cat = getDishCategory(dish);
        if (activeCategory !== "ALL" && cat !== activeCategory) return false;
        if (onlyVegetarian && !isVegetarianDish(dish)) return false;
        return true;
    });

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold text-starlight-white mb-3">{restaurant.name}</h2>
                    <div className="flex items-center gap-3 text-starlight-white text-lg font-medium">
                        <span className="bg-midnight-navy px-3 py-1 rounded-md border border-luminescent-line">{restaurant.cuisineType || "N/A"}</span>
                        <span className="text-fog-gray">·</span>
                        <span className="text-neon-gold">{restaurant.priceRange || "N/A"}</span>
                    </div>
                </div>
                <Link to="/restaurants" className="inline-flex items-center gap-2 text-wave-crest-blue hover:text-starlight-white font-semibold transition-colors bg-wave-crest-blue/10 px-4 py-2 rounded-lg hover:bg-wave-crest-blue/20">
                    ← Back to restaurants
                </Link>
            </div>

            <Card className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                    <span className="text-sm font-semibold text-fog-gray uppercase tracking-wider mb-3 block">Filter by category</span>
                    <div className="flex flex-wrap gap-2">
                        {availableCategories.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setActiveCategory(c)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === c
                                    ? "bg-wave-crest-blue/20 text-wave-crest-blue border border-wave-crest-blue/30 shadow-md scale-105"
                                    : "bg-midnight-navy text-starlight-white hover:bg-luminescent-line border border-luminescent-line"
                                    }`}
                            >
                                {c === "ALL" ? "All" : c.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer group shrink-0">
                    <div className="relative flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={onlyVegetarian}
                            onChange={(e) => setOnlyVegetarian(e.target.checked)}
                            className="peer appearance-none w-6 h-6 border-2 border-luminescent-line bg-midnight-navy rounded-md checked:bg-mint-glow checked:border-mint-glow transition-colors cursor-pointer"
                        />
                        <svg className="absolute w-4 h-4 text-midnight-navy opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                            <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className="text-starlight-white font-medium group-hover:text-mint-glow transition-colors">Vegetarian only</span>
                </label>
            </Card>

            {addError && (
                <div className="bg-crimson-alert/10 text-crimson-alert p-3 rounded-lg border border-crimson-alert/20 font-medium text-sm">
                    {addError}
                </div>
            )}

            <div>
                <h3 className="text-2xl font-heading font-bold text-starlight-white mb-2">Menu</h3>
                <p className="text-fog-gray mb-6">Choose your dishes and add them to the cart. You can also select extra toppings.</p>

                {filteredMenu.length === 0 ? (
                    <div className="text-center py-16 bg-deep-sea-surface rounded-2xl border-2 border-dashed border-luminescent-line shadow-sm">
                        <p className="text-lg text-fog-gray font-medium">No dishes match the selected filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMenu.map((dish) => {
                            const isJustAdded = lastAddedDish === dish.name;
                            const imgSrc = getDishImage(dish.name);
                            const category = getDishCategory(dish);
                            const dietaryTags = getDietaryTags(dish);
                            const extras = EXTRA_OPTIONS[dish.name] || [];
                            const selectedForDish = selectedExtras[dish.name] || [];

                            return (
                                <Card key={dish.name} className="flex flex-col p-0 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <div className="h-48 overflow-hidden bg-midnight-navy relative border-b border-luminescent-line">
                                        <img
                                            src={imgSrc}
                                            alt={dish.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/600x400/0B132B/F8FAFC?text=Dish';
                                            }}
                                        />
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                            {category && <Badge variant="brand" className="shadow-sm">{category}</Badge>}
                                            {dietaryTags.map((t) => (
                                                <Badge key={t} variant={t.toLowerCase().includes('veg') ? 'success' : 'neutral'} className="shadow-sm">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <h4 className="text-xl font-heading font-bold text-starlight-white leading-tight">{dish.name}</h4>
                                            <span className="text-lg font-bold text-wave-crest-blue whitespace-nowrap">
                                                {dish.price != null ? `${dish.price} €` : "N/A"}
                                            </span>
                                        </div>

                                        {dish.description && (
                                            <p className="text-sm text-fog-gray mb-4 line-clamp-2">{dish.description}</p>
                                        )}

                                        {extras.length > 0 && (
                                            <div className="mt-auto mb-4 bg-midnight-navy p-3 rounded-lg border border-luminescent-line">
                                                <div className="text-xs font-semibold text-starlight-white uppercase tracking-wider mb-2">Extra Options</div>
                                                <div className="flex flex-col gap-2">
                                                    {extras.map((opt) => (
                                                        <label key={opt.id} className="flex items-center justify-between text-sm cursor-pointer group">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedForDish.includes(opt.id)}
                                                                    onChange={() => toggleExtra(dish.name, opt.id)}
                                                                    className="w-4 h-4 rounded border-luminescent-line bg-deep-sea-surface text-wave-crest-blue focus:ring-wave-crest-blue cursor-pointer"
                                                                />
                                                                <span className="text-starlight-white group-hover:text-wave-crest-blue transition-colors">{opt.label}</span>
                                                            </div>
                                                            {opt.price != null && <span className="text-fog-gray font-medium">+{opt.price.toFixed(1)} €</span>}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-4">
                                            <Button
                                                type="button"
                                                onClick={() => handleAddToCart(dish)}
                                                variant={isJustAdded ? "secondary" : "primary"}
                                                className={`w-full font-bold transition-all ${isJustAdded ? 'bg-mint-glow text-midnight-navy hover:bg-mint-glow/90 border-none' : 'bg-sunset-coral text-midnight-navy hover:bg-sunset-coral/90 border-none'}`}
                                            >
                                                {isJustAdded ? "Added to Cart ✓" : "Add to Cart"}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
<<<<<<< HEAD
>>>>>>> 973a4b5ee0724c8af2a79148676bd95c2cbe45ed
=======
>>>>>>> origin/db_mare_fail
