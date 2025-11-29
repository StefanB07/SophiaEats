import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";

export default function CartAndDeliveryPage() {
    const { items, clearCart, deliveryOptions, updateDeliveryOptions } = useCart();
    const { currentUser } = useUser();
    const navigate = useNavigate();

    // asigurăm array
    const cartItems = useMemo(
        () => (Array.isArray(items) ? items : []),
        [items]
    );
    const hasItems = cartItems.length > 0;

    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedAddress, setSelectedAddress] = useState(
        (deliveryOptions && deliveryOptions.address) || ""
    );
    const [selectedSlot, setSelectedSlot] = useState(
        (deliveryOptions && deliveryOptions.slot) || ""
    );

    const totalPrice = useMemo(
        () =>
            cartItems.reduce((sum, item) => {
                const price =
                    item && item.dish && typeof item.dish.price === "number"
                        ? item.dish.price
                        : 0;
                const qty =
                    item && typeof item.quantity === "number"
                        ? item.quantity
                        : 0;
                return sum + price * qty;
            }, 0),
        [cartItems]
    );

    // sync cu contextul (când revii de la payment sau schimbi userul)
    useEffect(() => {
        if (deliveryOptions && typeof deliveryOptions === "object") {
            if (deliveryOptions.address) {
                setSelectedAddress(deliveryOptions.address);
            }
            if (deliveryOptions.slot) {
                setSelectedSlot(deliveryOptions.slot);
            }
        }
    }, [deliveryOptions]);

    // încărcăm opțiunile de livrare
    useEffect(() => {
        if (!currentUser || !hasItems) {
            setAvailableLocations([]);
            setAvailableSlots([]);
            return;
        }

        let cancelled = false;

        async function fetchOptions() {
            setLoading(true);
            setError(null);
            try {
                const resp = await fetch("/api/cart/delivery-options", {
                    headers: {
                        "X-User-Id": String(currentUser),
                        Accept: "application/json",
                    },
                });

                if (!resp.ok) {
                    throw new Error("HTTP " + resp.status);
                }

                const data = await resp.json();
                if (cancelled) return;

                const rawLocs = Array.isArray(data.locations)
                    ? data.locations
                    : [];
                const rawSlots = Array.isArray(data.slots) ? data.slots : [];

                // locațiile -> string
                const locs = rawLocs.map((loc) => {
                    if (typeof loc === "string") return loc;
                    if (loc && typeof loc === "object" && "name" in loc)
                        return String(loc.name);
                    return String(loc);
                });

                // sloturile -> folosim câmpul "label" din obiect
                const slots = rawSlots.map((slot) => {
                    if (typeof slot === "string") return slot;
                    if (slot && typeof slot === "object" && "label" in slot)
                        return String(slot.label);
                    return String(slot);
                });

                setAvailableLocations(locs);
                setAvailableSlots(slots);

                // preselectăm primul loc/slot dacă nu e nimic ales
                if (!selectedAddress && locs.length > 0) {
                    setSelectedAddress(locs[0]);
                }
                if (!selectedSlot && slots.length > 0) {
                    setSelectedSlot(slots[0]);
                }
            } catch (e) {
                console.error("Failed to fetch delivery options", e);
                if (!cancelled) {
                    setError(
                        "Unable to load delivery options. Please try again later."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchOptions();

        return () => {
            cancelled = true;
        };
    }, [currentUser, hasItems]); // nu punem selectedAddress/Slot aici, altfel refacem fetch mereu

    const handleProceed = () => {
        updateDeliveryOptions(selectedAddress, selectedSlot);
        navigate("/payment");
    };

    return (
        <div className="section">
            {/* Header + back */}
            <div className="section-header">
                <div>
                    <h2 className="page-title">Cart &amp; Delivery</h2>
                    <p className="page-subtitle">
                        Review your order and choose when and where you want it delivered.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate("/restaurants")}
                >
                    ← Back to restaurants
                </button>
            </div>

            {!hasItems ? (
                <div
                    className="card"
                    style={{
                        maxWidth: "480px",
                        padding: "1.5rem",
                        marginTop: "1rem",
                    }}
                >
                    <p>Your cart is empty.</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        style={{ marginTop: "0.75rem" }}
                        onClick={() => navigate("/restaurants")}
                    >
                        Browse restaurants
                    </button>
                </div>
            ) : (
                <div
                    className="card-grid"
                    style={{
                        gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                        alignItems: "flex-start",
                    }}
                >
                    {/* CARD 1 – order summary */}
                    <section
                        className="card"
                        style={{
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                        }}
                    >
                        <h3 className="card-title">Your order</h3>

                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                            }}
                        >
                            {cartItems.map((item, index) => {
                                const name =
                                    item && item.dish ? item.dish.name : "Dish";
                                const restaurant =
                                    item && item.restaurantName
                                        ? item.restaurantName
                                        : "";
                                const price =
                                    item && item.dish && item.dish.price != null
                                        ? item.dish.price
                                        : null;
                                const qty =
                                    item && typeof item.quantity === "number"
                                        ? item.quantity
                                        : 0;

                                return (
                                    <li
                                        key={`${restaurant}-${name}-${index}`}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        <span>
                                            <strong>{name}</strong>{" "}
                                            {restaurant && (
                                                <span
                                                    style={{ color: "#6b7280" }}
                                                >
                                                    ({restaurant})
                                                </span>
                                            )}
                                            {price != null && (
                                                <>
                                                    {" · "}
                                                    <span>
                                                        {qty} × {price} €
                                                    </span>
                                                </>
                                            )}
                                        </span>
                                        <span>
                                            {price != null
                                                ? (price * qty).toFixed(2)
                                                : "-"}{" "}
                                            €
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>

                        <p
                            style={{
                                marginTop: "0.75rem",
                                fontWeight: 600,
                                fontSize: "1rem",
                            }}
                        >
                            Total: {totalPrice.toFixed(2)} €
                        </p>

                        <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ alignSelf: "flex-start", marginTop: 0 }}
                            onClick={clearCart}
                        >
                            Clear cart
                        </button>
                    </section>

                    {/* CARD 2 – delivery details */}
                    <section
                        className="card"
                        style={{
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}
                    >
                        <h3 className="card-title">Delivery details</h3>

                        {loading && <p>Loading delivery options…</p>}
                        {error && (
                            <p style={{ color: "red", fontSize: "0.9rem" }}>
                                {error}
                            </p>
                        )}

                        {!loading && !error && (
                            <>
                                {availableLocations.length === 0 ||
                                availableSlots.length === 0 ? (
                                    <p
                                        style={{
                                            fontSize: "0.9rem",
                                            color: "#6b7280",
                                        }}
                                    >
                                        No delivery options available yet for this
                                        cart. Try changing the restaurant or
                                        dishes.
                                    </p>
                                ) : (
                                    <>
                                        <div>
                                            <label
                                                style={{
                                                    display: "block",
                                                    fontSize: "0.9rem",
                                                    marginBottom: "0.25rem",
                                                }}
                                            >
                                                Delivery location
                                            </label>
                                            <select
                                                value={selectedAddress}
                                                onChange={(e) =>
                                                    setSelectedAddress(
                                                        e.target.value
                                                    )
                                                }
                                                style={{
                                                    width: "100%",
                                                    padding: "0.5rem 0.75rem",
                                                    borderRadius: "0.5rem",
                                                    border: "1px solid #d1d5db",
                                                }}
                                            >
                                                <option value="">
                                                    -- Select location --
                                                </option>
                                                {availableLocations.map(
                                                    (loc, idx) => (
                                                        <option
                                                            key={`${loc}-${idx}`}
                                                            value={loc}
                                                        >
                                                            {loc}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                style={{
                                                    display: "block",
                                                    fontSize: "0.9rem",
                                                    marginBottom: "0.25rem",
                                                }}
                                            >
                                                Delivery time slot
                                            </label>
                                            <select
                                                value={selectedSlot}
                                                onChange={(e) =>
                                                    setSelectedSlot(
                                                        e.target.value
                                                    )
                                                }
                                                style={{
                                                    width: "100%",
                                                    padding: "0.5rem 0.75rem",
                                                    borderRadius: "0.5rem",
                                                    border: "1px solid #d1d5db",
                                                }}
                                            >
                                                <option value="">
                                                    -- Select time --
                                                </option>
                                                {availableSlots.map(
                                                    (slot, idx) => (
                                                        <option
                                                            key={`${slot}-${idx}`}
                                                            value={slot}
                                                        >
                                                            {slot}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                            <p
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "#6b7280",
                                                    marginTop: "0.25rem",
                                                }}
                                            >
                                                Time slots are calculated based
                                                on restaurant opening hours and
                                                existing orders.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-primary btn-full"
                                            style={{ marginTop: "0.5rem" }}
                                            disabled={
                                                !selectedAddress || !selectedSlot
                                            }
                                            onClick={handleProceed}
                                        >
                                            Proceed to payment
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
