import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./UserContext.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    // items = [{ key, restaurantName, dish, quantity }]
    // keep carts per user id: { [userId]: items[] }
    const [carts, setCarts] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("carts") || "{}");
        } catch (e) {
            console.warn("Failed to parse carts from localStorage", e);
            return {};
        }
    });

    // [NEW] State to hold delivery options (location & slot)
    const [deliveryInfo, setDeliveryInfo] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("deliveryInfo") || "{}");
        } catch (e) {
            return {};
        }
    });

    const { currentUser } = useUser();

    // derive current user's items (empty array if none)
    const items = carts[currentUser] ?? [];

    useEffect(() => {
        try {
            localStorage.setItem("carts", JSON.stringify(carts));
        } catch (e) {
            console.warn("Failed to persist carts to localStorage", e);
        }
    }, [carts]);

    // [NEW] Persist delivery info when it changes
    useEffect(() => {
        try {
            localStorage.setItem("deliveryInfo", JSON.stringify(deliveryInfo));
        } catch (e) {
            console.warn("Failed to persist delivery info", e);
        }
    }, [deliveryInfo]);

    // [NEW] Helper to update delivery info (partial updates allowed)
    function updateDelivery(info) {
        setDeliveryInfo((prev) => ({ ...prev, ...info }));
    }

    function addItem(dish, restaurantName) {
        setCarts((prev) => {
            const userCart = prev[currentUser] ?? [];

            if (userCart.length > 0) {
                const currentRestaurant = userCart[0].restaurantName;
                if (currentRestaurant !== restaurantName) {
                    console.warn(
                        `Cannot add dish from "${restaurantName}" because cart already contains items from "${currentRestaurant}".`
                    );
                    alert(
                        `Your cart already contains items from "${currentRestaurant}". ` +
                        `Please clear the cart before ordering from another restaurant.`
                    );
                    return prev; // no change
                }
            }

            const key = `${restaurantName}::${dish.name}`;
            const existing = userCart.find((i) => i.key === key);
            let newUserCart;
            if (existing) {
                newUserCart = userCart.map((i) =>
                    i.key === key ? { ...i, quantity: i.quantity + 1 } : i
                );
            } else {
                newUserCart = [...userCart, { key, restaurantName, dish, quantity: 1 }];
            }

            return { ...prev, [currentUser]: newUserCart };
        });
    }

    function clearCart() {
        setCarts((prev) => ({ ...prev, [currentUser]: [] }));
        // [NEW] Clear delivery info when cart is cleared
        setDeliveryInfo({});
    }

    return (
        // [NEW] Expose deliveryInfo and updateDelivery
        <CartContext.Provider value={{ items, addItem, clearCart, deliveryInfo, updateDelivery }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return ctx;
}