import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;

const restaurantImages = {
    "Restaurant A": "/images/restaurant-a.jpg",
    "Second Place": "/images/second-place.png",
    "Green Garden": "/images/green-garden.jpeg",
    "Burger Hub": "/images/burger-hub.png",
};

export default function RestaurantListPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    return (
        <div>
            <h2 className="page-title">Restaurants</h2>
            <p className="page-subtitle">
                Choose a restaurant to browse its menu and place an order.
            </p>

            <div className="card-grid">
                {restaurants.map((r) => {
                    const imgSrc =
                        restaurantImages[r.name] || "/images/restaurant-placeholder.jpg";
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
                                <span className="badge">Open</span>
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
        </div>
    );
}
