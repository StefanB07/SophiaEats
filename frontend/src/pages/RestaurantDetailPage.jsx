import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;

export default function RestaurantDetailPage() {
    const { name } = useParams(); // restaurant name from URL (encoded)
    const decodedName = decodeURIComponent(name || "");

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { addItem } = useCart();

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
                console.log("Fetching restaurant details from:", url);

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }

                const data = await response.json();
                console.log("Restaurant details:", data);
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
        /* TODO here, later, we will call Cart Service / Order Service */
        addItem(dish, restaurant.name);
        console.log("Added to cart:", dish);
        alert(`(DEV) Added "${dish.name}" to cart (simulated).`);
    }

    if (loading) {
        return (
            <div>
                <h2>Restaurant menu</h2>
                <p>Loading restaurant details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Restaurant menu</h2>
                <p style={{ color: "red" }}>
                    Could not load restaurant details. Details: {error}
                </p>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div>
                <h2>Restaurant menu</h2>
                <p>No data found for this restaurant.</p>
            </div>
        );
    }

    const menu = restaurant.menu || [];

    return (
        <div>
            <h2>{restaurant.name}</h2>
            <p>
                <strong>Cuisine:</strong> {restaurant.cuisineType || "N/A"}
            </p>
            <p>
                <strong>Price range:</strong> {restaurant.priceRange || "N/A"}
            </p>
            {/* TODO : Opening Hours*/}
            {restaurant.openingHours && (
                <p>
                    <strong>Opening hours:</strong> {restaurant.openingHours}
                </p>
            )}

            <h3 style={{ marginTop: "2rem" }}>Menu</h3>

            {menu.length === 0 ? (
                <p>No dishes defined for this restaurant.</p>
            ) : (
                <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                    {menu.map((dish) => (
                        <div
                            key={dish.name}
                            style={{
                                padding: "1rem",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                backgroundColor: "white",
                            }}
                        >
                            <h4 style={{ marginTop: 0 }}>{dish.name}</h4>
                            {dish.description && <p>{dish.description}</p>}
                            <p>
                                <strong>Price:</strong>{" "}
                                {dish.price != null ? `${dish.price} €` : "N/A"}
                            </p>

                            {/* TODO here, if you have categories/tags */}
                            {dish.categories && dish.categories.length > 0 && (
                                <p style={{ fontSize: "0.9rem" }}>
                                    <strong>Categories:</strong> {dish.categories.join(", ")}
                                </p>
                            )}

                            {/* TODO extensions / options – for now we just display them, without complex UI */}
                            {dish.extensions && dish.extensions.length > 0 && (
                                <p style={{ fontSize: "0.9rem" }}>
                                    <strong>Options:</strong>{" "}
                                    {dish.extensions.map((ext) => ext.name || ext).join(", ")}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => handleAddToCart(dish)}
                                style={{ marginTop: "0.5rem" }}
                            >
                                Add to cart
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
