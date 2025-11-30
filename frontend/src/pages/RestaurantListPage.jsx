import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;

// simple mock images
const restaurantImages = {
    "Restaurant A": "/images/restaurant-a.jpg",
    "Second Place": "/images/second-place.png",
    "Green Garden": "/images/green-garden.jpeg",
    "Burger Hub": "/images/burger-hub.png",
};

// orar mock pentru C1 – disponibilité horaire
const OPENING_HOURS = {
    "Second Place": { open: 11, close: 22 },
    "Green Garden": { open: 10, close: 20 },
    "Restaurant A": { open: 11, close: 21 },
    "Burger Hub": { open: 12, close: 23 },
};

function isOpenNow(restaurant) {
    const hours = OPENING_HOURS[restaurant.name];
    if (!hours) return true; // dacă nu avem date, îl considerăm deschis
    const now = new Date();
    const h = now.getHours();
    return h >= hours.open && h < hours.close;
}

// restaurant cu „plats spécifiques végétariens” – C2
function hasVegetarianOptions(restaurant) {
    // dacă backend-ul trimite ceva mai bogat, poți adapta ușor.
    if (
        restaurant.cuisineType &&
        restaurant.cuisineType.toLowerCase().includes("vegetarian")
    ) {
        return true;
    }
    // fallback: numele restaurantului sugerează vegetarian
    if (restaurant.name && restaurant.name.toLowerCase().includes("green")) {
        return true;
    }
    return false;
}

export default function RestaurantListPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // filtre UI
    const [searchText, setSearchText] = useState("");
    const [showOnlyOpen, setShowOnlyOpen] = useState(false);
    const [showOnlyVegetarian, setShowOnlyVegetarian] = useState(false);

    useEffect(() => {
        async function loadRestaurants() {
            try {
                if (!CATALOG_API_BASE) {
                    throw new Error("VITE_CATALOG_API_BASE is not defined");
                }

                const response = await fetch(`${CATALOG_API_BASE}/restaurants`);
                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }

                const data = await response.json();
                setRestaurants(data);
                setError("");
            } catch (err) {
                console.error("Failed to load restaurants:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unknown error when loading restaurants"
                );
            } finally {
                setLoading(false);
            }
        }

        void loadRestaurants();
    }, []);

    if (loading) {
        return (
            <div>
                <h2 className="page-title">Restaurants</h2>
                <p className="page-subtitle">Loading restaurants…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2 className="page-title">Restaurants</h2>
                <p style={{ color: "red" }}>Could not load restaurants: {error}</p>
            </div>
        );
    }

    const filteredRestaurants = restaurants.filter((r) => {
        // C1 – disponibilité horaire
        if (showOnlyOpen && !isOpenNow(r)) {
            return false;
        }

        // C2 – plats spécifiques (végétarien…)
        if (showOnlyVegetarian && !hasVegetarianOptions(r)) {
            return false;
        }

        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            const nameMatch = r.name && r.name.toLowerCase().includes(q);
            const cuisineMatch =
                r.cuisineType && r.cuisineType.toLowerCase().includes(q);
            if (!nameMatch && !cuisineMatch) return false;
        }

        return true;
    });

    return (
        <div>
            <h2 className="page-title">Restaurants</h2>
            <p className="page-subtitle">
                Choose a restaurant to browse its menu and place an order.
            </p>

            {/* bară filtre C1 + C2 */}
            <div
                className="card"
                style={{
                    padding: "0.9rem 1.25rem",
                    marginBottom: "1.25rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ flex: "1 1 220px" }}>
                    <input
                        type="text"
                        placeholder="Search by name or cuisine…"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.9rem",
                            border: "1px solid #d1d5db",
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        alignItems: "center",
                    }}
                >
                    <label
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontSize: "0.9rem",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={showOnlyOpen}
                            onChange={(e) => setShowOnlyOpen(e.target.checked)}
                        />
                        Show only open now (delivery possible)
                    </label>

                    <label
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontSize: "0.9rem",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={showOnlyVegetarian}
                            onChange={(e) => setShowOnlyVegetarian(e.target.checked)}
                        />
                        Has vegetarian options
                    </label>
                </div>
            </div>

            {filteredRestaurants.length === 0 ? (
                <p>No restaurants match your filters.</p>
            ) : (
                <div className="card-grid">
                    {filteredRestaurants.map((r) => {
                        const imgSrc =
                            restaurantImages[r.name] ||
                            "/images/restaurant-placeholder.jpg";
                        const open = isOpenNow(r);

                        return (
                            <article key={r.name} className="card">
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    <div>
                                        <h3>{r.name}</h3>
                                        <div className="card-meta">
                                            Cuisine: {r.cuisineType || "N/A"} · Price:{" "}
                                            {r.priceRange || "N/A"}
                                        </div>
                                    </div>
                                    <span
                                        className={
                                            open ? "badge badge-success" : "badge badge-muted"
                                        }
                                    >
                                        {open ? "Open" : "Closed"}
                                    </span>
                                </div>

                                <img
                                    src={imgSrc}
                                    alt={r.name}
                                    style={{
                                        width: "100%",
                                        borderRadius: "12px",
                                        maxHeight: "150px",
                                        objectFit: "cover",
                                        marginBottom: "0.75rem",
                                    }}
                                />

                                <button className="btn btn-full" type="button">
                                    <Link
                                        to={`/restaurants/${encodeURIComponent(r.name)}`}
                                        style={{ color: "inherit", textDecoration: "none" }}
                                    >
                                        View menu →
                                    </Link>
                                </button>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
