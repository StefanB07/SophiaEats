import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;
console.log("CATALOG_API_BASE =", CATALOG_API_BASE);

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

                const url = `${CATALOG_API_BASE}/restaurants`;
                console.log("Fetching restaurants from:", url);

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }

                const data = await response.json();
                console.log("Restaurants response data:", data);
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
                <h2>Restaurants</h2>
                <p>Loading restaurants...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Restaurants</h2>
                <p style={{ color: "red" }}>
                    Could not load restaurants. Details: {error}
                </p>
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div>
                <h2>Restaurants</h2>
                <p>No restaurants available.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Restaurants</h2>
            <p>Select a restaurant to see its menu.</p>

            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.name}
                        style={{
                            padding: "1rem",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            backgroundColor: "white",
                        }}
                    >
                        <h3 style={{ marginTop: 0 }}>{restaurant.name}</h3>
                        <p>
                            <strong>Cuisine:</strong> {restaurant.cuisineType}
                        </p>
                        <p>
                            <strong>Price range:</strong> {restaurant.priceRange}
                        </p>

                        <Link
                            to={`/restaurants/${encodeURIComponent(restaurant.name)}`}
                            style={{ marginTop: "0.5rem", display: "inline-block" }}
                        >
                            View menu →
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
