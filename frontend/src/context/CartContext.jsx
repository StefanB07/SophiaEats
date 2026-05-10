import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    // items = [{ key, restaurantName, dish, quantity }]
    // keep carts per user id: { [userId]: items[] }
    const [carts, setCarts] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("carts") || "{}");
        } catch {
            console.warn("Failed to parse carts from localStorage");
            return {};
        }
    });

    // [NEW] State to hold delivery options (location & slot)
    const [deliveryInfo, setDeliveryInfo] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("deliveryInfo") || "{}");
        } catch {
            return {};
        }
    });

    const { currentUser } = useUser();

    // derive current user's items (empty array if none)
    const items = carts[currentUser] ?? [];

    useEffect(() => {
        try {
            localStorage.setItem("carts", JSON.stringify(carts));
        } catch {
            console.warn("Failed to persist carts to localStorage");
        }
    }, [carts]);

    // [NEW] Persist delivery info when it changes
    useEffect(() => {
        try {
            localStorage.setItem("deliveryInfo", JSON.stringify(deliveryInfo));
        } catch {
            console.warn("Failed to persist delivery info");
        }
    }, [deliveryInfo]);

    // [NEW] Helper to update delivery info (partial updates allowed)
    function updateDelivery(info) {
        setDeliveryInfo((prev) => ({ ...prev, ...info }));
    }

    function addItem(dish, restaurantName) {

        const userCart = carts[currentUser] ?? [];

        if (userCart.length > 0) {
            const currentRestaurant = userCart[0].restaurantName;
            if (currentRestaurant && currentRestaurant !== restaurantName) {
                const err = new Error(
                    `Your cart already contains items from "${currentRestaurant}". Please clear the cart before ordering from another restaurant.`
                );
                alert(err.message);
                throw err;
            }
        }

        setCarts((prev) => {
            const prevUserCart = prev[currentUser] ?? [];

            const key = `${restaurantName}::${dish.name}`;
            const existing = prevUserCart.find((i) => i.key === key);

            let newUserCart;
            if (existing) {
                newUserCart = prevUserCart.map((i) =>
                    i.key === key ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                newUserCart = [
                    ...prevUserCart,
                    { key, restaurantName, dish, quantity: 1 },
                ];
            }

            // Fire-and-forget backend sync (POST /cart)
            try {
                fetch("/api/cart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-User-Id": currentUser,
                    },
                    body: JSON.stringify({
                        restaurant: restaurantName,
                        dish: dish.name,
                        qty: 1,
                    }),
                }).catch(() => {
                    /* ignore for now */
                });
            } catch {
                /* ignore */
            }

            return { ...prev, [currentUser]: newUserCart };
        });
    }


    function clearCart() {
        setCarts((prev) => ({ ...prev, [currentUser]: [] }));
        setDeliveryInfo({});
        try {
            fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'X-User-Id': currentUser }
            }).catch(() => { /* ignore network error; local state cleared */ });
        } catch {
            /* ignore */
        }
    }

    function resetDeliveryOptions() {
        setDeliveryInfo({});
    }

    // Provide both original keys and aliases expected by CartAndDeliveryPage
    const value = {
        items,
        addItem,
        clearCart,
        deliveryInfo,
        updateDelivery,
        // aliases for backward compatibility / current page expectations
        deliveryOptions: deliveryInfo,
        updateDeliveryOptions: (address, slot) => updateDelivery({ address, slot }),
        resetDeliveryOptions
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return ctx;
}