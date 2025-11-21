import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    // items = [{ key, restaurantName, dish, quantity }]
    const [items, setItems] = useState([]);

    function addItem(dish, restaurantName) {
        const key = `${restaurantName}::${dish.name}`;
        setItems((prev) => {
            const existing = prev.find((i) => i.key === key);
            if (existing) {
                return prev.map((i) =>
                    i.key === key ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { key, restaurantName, dish, quantity: 1 }];
        });
    }

    function clearCart() {
        setItems([]);
    }

    return (
        <CartContext.Provider value={{ items, addItem, clearCart }}>
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
