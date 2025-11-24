import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom"; // Needed for navigation

export default function CartAndDeliveryPage() {
    const { items, clearCart, deliveryOptions, updateDeliveryOptions } = useCart();
    const navigate = useNavigate();

    // Local state for the lists fetched from backend
    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    // Local state for form inputs
    const [selectedAddress, setSelectedAddress] = useState(deliveryOptions.address || "");
    const [selectedSlot, setSelectedSlot] = useState(deliveryOptions.slot || "");

    const totalPrice = items.reduce((sum, item) => {
        const price = item.dish.price ?? 0;
        return sum + price * item.quantity;
    }, 0);

    // 1. FETCH DATA FROM BACKEND
    useEffect(() => {
        // In a real scenario, you might filter slots by the Restaurant ID of items in the cart
        // For now, we fetch generic options.
        const fetchOptions = async () => {
            try {
                // Replace this URL with your actual Java Handler route
                // Example response: { locations: ["Campus", "Dorm"], slots: ["12:00", "12:15"] }
                const response = await fetch("/cart/delivery-options");
                if (response.ok) {
                    const data = await response.json();
                    setAvailableLocations(data.locations || []);
                    setAvailableSlots(data.slots || []);
                }
            } catch (e) {
                console.error("Failed to load delivery options", e);
            }
        };

        if (items.length > 0) {
            fetchOptions();
        }
    }, [items]);

    // 2. HANDLE SUBMISSION
    const handleProceed = () => {
        updateDeliveryOptions(selectedAddress, selectedSlot);
        navigate("/payment"); // Navigate to the next step
    };

    return (
        <div>
            <h2>Cart & Delivery</h2>

            {items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <ul>
                        {items.map((item) => (
                            <li key={item.key}>
                                <strong>{item.dish.name}</strong> ({item.restaurantName}) –{" "}
                                {item.quantity} ×{" "}
                                {item.dish.price != null ? `${item.dish.price} €` : "N/A"}
                            </li>
                        ))}
                    </ul>
                    <p>
                        <strong>Total:</strong> {totalPrice.toFixed(2)} €
                    </p>
                    <button type="button" onClick={clearCart}>
                        Clear cart
                    </button>

                    <hr style={{ margin: "1.5rem 0" }} />

                    {/* 3. DELIVERY FORM */}
                    <h3>Delivery Details</h3>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>
                            Delivery Location:
                        </label>
                        <select
                            value={selectedAddress}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            style={{ padding: "0.5rem", minWidth: "200px" }}
                        >
                            <option value="">-- Select Location --</option>
                            {availableLocations.map(loc => (
                                <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem" }}>
                            Delivery Time Slot:
                        </label>
                        <select
                            value={selectedSlot}
                            onChange={(e) => setSelectedSlot(e.target.value)}
                            style={{ padding: "0.5rem", minWidth: "200px" }}
                        >
                            <option value="">-- Select Time --</option>
                            {availableSlots.map(slot => (
                                <option key={slot.label} value={slot.label}>{slot.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleProceed}
                        disabled={!selectedAddress || !selectedSlot}
                        style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}
                    >
                        Proceed to Payment
                    </button>
                </>
            )}
        </div>
    );
}