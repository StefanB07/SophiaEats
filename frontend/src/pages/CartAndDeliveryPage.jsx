import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export default function CartAndDeliveryPage() {
    const { items, clearCart, deliveryOptions, updateDeliveryOptions, resetDeliveryOptions } = useCart();
    const { currentUser } = useUser();
    const navigate = useNavigate();

    // Local state for the lists fetched from backend
    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Local state for form inputs
    const [selectedAddress, setSelectedAddress] = useState(deliveryOptions.address || "");
    const [selectedSlot, setSelectedSlot] = useState(deliveryOptions.slot || "");

    const totalPrice = items.reduce((sum, item) => {
        const price = item.dish.price ?? 0;
        return sum + price * item.quantity;
    }, 0);

    // 1. FETCH DATA FROM BACKEND
    useEffect(() => {
        const fetchOptions = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!currentUser) throw new Error('No user yet');
                const response = await fetch('/api/cart/delivery-options', {
                    headers: { 'X-User-Id': String(currentUser) }
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setAvailableLocations(data.locations || []);
                setAvailableSlots(data.slots || []);
            } catch (e) {
                console.error('Failed to load delivery options', e);
                setError('Unable to load delivery options. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (items.length > 0 && currentUser) {
            // Ensure backend cart is in sync after server restarts
            (async () => {
                try {
                    const cartResp = await fetch('/api/cart', {
                        headers: { 'X-User-Id': String(currentUser), 'Accept': 'application/json' }
                    });
                    if (cartResp.ok) {
                        const cartData = await cartResp.json();
                        const serverCount = Array.isArray(cartData.items) ? cartData.items.length : 0;
                        if (serverCount === 0 && items.length > 0) {
                            // Replay local items to backend so delivery slots can be computed
                            await Promise.all(items.map((item) =>
                                fetch('/api/cart', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-User-Id': String(currentUser)
                                    },
                                    body: JSON.stringify({
                                        restaurant: item.restaurantName,
                                        dish: item.dish.name,
                                        qty: item.quantity
                                    })
                                })
                            ));
                        }
                    }
                } catch (_) { /* ignore and still attempt to fetch options */ }
                await fetchOptions();
            })();
        } else {
            setAvailableLocations([]);
            setAvailableSlots([]);
        }

        return () => {
            // On unmount: clear only selections (keep cart items) so page resets next visit
            resetDeliveryOptions();
        };
    }, [items, currentUser]);

    // Keep local selection in sync if context changes elsewhere
    useEffect(() => {
        if (deliveryOptions.address) setSelectedAddress(deliveryOptions.address);
        if (deliveryOptions.slot) setSelectedSlot(deliveryOptions.slot);
    }, [deliveryOptions]);

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
                                <strong>{item.dish.name}</strong> ({item.restaurantName}) – {item.quantity} × {item.dish.price != null ? `${item.dish.price} €` : "N/A"}
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

                    {loading && <p>Loading delivery options...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}

                    {!loading && !error && (
                        <>
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
                                    {availableLocations.map((loc) => (
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
                                    {availableSlots.map((slot) => (
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
                </>
            )}
        </div>
    );
}