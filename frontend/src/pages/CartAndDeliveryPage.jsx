<<<<<<< HEAD
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

                // sloturile -> folosim câmpul "label" din obiect, fără filtrare
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                            {items.map((item) => {
                                const extras =
                                    (item.dish && item.dish.selectedExtras) ||
                                    item.selectedExtras ||
                                    item.extraOptions ||
                                    [];

                                return (
                                    <li key={item.key} style={{ marginBottom: "0.4rem" }}>
                                        <div>
                                            <strong>{item.dish.name}</strong>{" "}
                                            {item.restaurantName && (
                                                <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                                                    ({item.restaurantName})
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "0.9rem" }}>
                                            {item.quantity} ×{" "}
                                            {item.dish.price != null ? `${item.dish.price} €` : "N/A"}
                                        </div>
                                        {extras.length > 0 && (
                                            <div
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "#6b7280",
                                                    marginTop: "0.15rem",
                                                }}
                                            >
                                                Extras:{" "}
                                                {extras
                                                    .map((e) =>
                                                        e.price != null
                                                            ? `${e.label} (+${e.price.toFixed(1)} €)`
                                                            : e.label
                                                    )
                                                    .join(", ")}
                                            </div>
                                        )}
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
=======
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";

export default function CartAndDeliveryPage() {
    const { items, clearCart, deliveryOptions, updateDeliveryOptions } = useCart();
    const { currentUser } = useUser();
    const navigate = useNavigate();

    const cartItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
    const hasItems = cartItems.length > 0;

    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedAddress, setSelectedAddress] = useState((deliveryOptions && deliveryOptions.address) || "");
    const [selectedSlot, setSelectedSlot] = useState((deliveryOptions && deliveryOptions.slot) || "");

    const totalPrice = useMemo(() => cartItems.reduce((sum, item) => {
        const price = item && item.dish && typeof item.dish.price === "number" ? item.dish.price : 0;
        const qty = item && typeof item.quantity === "number" ? item.quantity : 0;
        return sum + price * qty;
    }, 0), [cartItems]);

    useEffect(() => {
        if (deliveryOptions && typeof deliveryOptions === "object") {
            if (deliveryOptions.address) setSelectedAddress(deliveryOptions.address);
            if (deliveryOptions.slot) setSelectedSlot(deliveryOptions.slot);
        }
    }, [deliveryOptions]);

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

                const rawLocs = Array.isArray(data.locations) ? data.locations : [];
                const rawSlots = Array.isArray(data.slots) ? data.slots : [];

                const locs = rawLocs.map((loc) => {
                    if (typeof loc === "string") return loc;
                    if (loc && typeof loc === "object" && "name" in loc) return String(loc.name);
                    return String(loc);
                });

                const slots = rawSlots.map((slot) => {
                    if (typeof slot === "string") return slot;
                    if (slot && typeof slot === "object" && "label" in slot) return String(slot.label);
                    return String(slot);
                });

                setAvailableLocations(locs);
                setAvailableSlots(slots);

                if (!selectedAddress && locs.length > 0) setSelectedAddress(locs[0]);
                if (!selectedSlot && slots.length > 0) setSelectedSlot(slots[0]);
            } catch (e) {
                console.error(e);
                if (!cancelled) {
                    setError("Unable to load delivery options. Please try again later.");
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
    }, [currentUser, hasItems]);

    const handleProceed = () => {
        updateDeliveryOptions(selectedAddress, selectedSlot);
        navigate("/payment");
    };

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-heading font-bold text-deep-sea-navy mb-2">Cart & Delivery</h2>
                    <p className="text-slate-light text-lg">Review your order and choose when and where you want it delivered.</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 text-ocean-blue hover:text-deep-sea-navy font-semibold transition-colors bg-ocean-blue/10 px-4 py-2 rounded-lg hover:bg-ocean-blue/20"
                    onClick={() => navigate("/restaurants")}
                >
                    ← Back to restaurants
                </button>
            </div>

            {!hasItems ? (
                <Card className="max-w-xl mx-auto text-center py-16 mt-8 border-dashed border-2">
                    <div className="text-5xl mb-4">🛒</div>
                    <p className="text-xl font-heading font-bold text-slate-dark mb-6">Your cart is empty.</p>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => navigate("/restaurants")}
                    >
                        Browse restaurants
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <Card className="lg:col-span-7 flex flex-col gap-6 shadow-lg border-border-gray/50">
                        <div className="flex items-center justify-between border-b border-border-gray pb-4">
                            <h3 className="text-2xl font-heading font-bold text-deep-sea-navy">Your Order</h3>
                            <button
                                type="button"
                                className="text-sm font-medium text-crimson-alert hover:text-red-700 transition-colors bg-crimson-alert/10 px-3 py-1.5 rounded-md hover:bg-crimson-alert/20"
                                onClick={clearCart}
                            >
                                Clear cart
                            </button>
                        </div>

                        <ul className="flex flex-col gap-4">
                            {cartItems.map((item) => {
                                const extras = (item.dish && item.dish.selectedExtras) || item.selectedExtras || item.extraOptions || [];

                                return (
                                    <li key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border-gray bg-seabreeze-white/50">
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <strong className="text-lg font-heading text-slate-dark">{item.dish.name}</strong>
                                                {item.restaurantName && (
                                                    <span className="text-sm font-medium text-slate-light bg-border-gray/50 px-2 py-0.5 rounded-md">
                                                        {item.restaurantName}
                                                    </span>
                                                )}
                                            </div>
                                            {extras.length > 0 && (
                                                <div className="text-sm text-slate-light mt-2 flex flex-wrap gap-1">
                                                    {extras.map((e, idx) => (
                                                        <span key={idx} className="bg-pure-white border border-border-gray px-2 py-1 rounded text-xs">
                                                            {e.label} {e.price != null ? `(+${e.price.toFixed(1)} €)` : ""}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-right">
                                            <div className="text-slate-light font-medium bg-pure-white px-3 py-1 rounded-lg border border-border-gray">
                                                Qty: {item.quantity}
                                            </div>
                                            <div className="text-lg font-bold text-ocean-blue w-20">
                                                {item.dish.price != null ? `${(item.dish.price * item.quantity).toFixed(2)} €` : "N/A"}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="flex items-center justify-between border-t border-border-gray pt-6 mt-2">
                            <span className="text-xl font-heading font-medium text-slate-dark">Total</span>
                            <span className="text-3xl font-heading font-bold text-sunset-coral">
                                {totalPrice.toFixed(2)} €
                            </span>
                        </div>
                    </Card>

                    <Card className="lg:col-span-5 flex flex-col gap-6 shadow-lg border-border-gray/50 bg-ocean-blue/5">
                        <div className="border-b border-border-gray/50 pb-4">
                            <h3 className="text-2xl font-heading font-bold text-deep-sea-navy">Delivery Details</h3>
                        </div>

                        {loading && (
                            <div className="py-8 flex flex-col items-center justify-center gap-4">
                                <div className="w-8 h-8 border-4 border-ocean-blue border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-slate-light font-medium animate-pulse">Loading delivery options…</p>
                            </div>
                        )}
                        
                        {error && (
                            <div className="bg-crimson-alert/10 text-crimson-alert p-4 rounded-xl border border-crimson-alert/20 font-medium">
                                {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                {availableLocations.length === 0 || availableSlots.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-slate-light font-medium bg-pure-white p-4 rounded-xl border border-border-gray">
                                            No delivery options available yet for this cart. Try changing the restaurant or dishes.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-dark uppercase tracking-wide">
                                                Delivery Location
                                            </label>
                                            <select
                                                value={selectedAddress}
                                                onChange={(e) => setSelectedAddress(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-pure-white text-slate-dark font-medium focus:border-ocean-blue focus:ring-0 outline-none transition-colors shadow-sm"
                                            >
                                                <option value="" disabled>-- Select location --</option>
                                                {availableLocations.map((loc, idx) => (
                                                    <option key={`${loc}-${idx}`} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-dark uppercase tracking-wide">
                                                Delivery Time Slot
                                            </label>
                                            <select
                                                value={selectedSlot}
                                                onChange={(e) => setSelectedSlot(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-pure-white text-slate-dark font-medium focus:border-ocean-blue focus:ring-0 outline-none transition-colors shadow-sm"
                                            >
                                                <option value="" disabled>-- Select time --</option>
                                                {availableSlots.map((slot, idx) => (
                                                    <option key={`${slot}-${idx}`} value={slot}>{slot}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-slate-light font-medium flex items-start gap-1.5 mt-2">
                                                <span className="text-ocean-blue">ℹ️</span> 
                                                Time slots are calculated based on restaurant opening hours and existing order volumes.
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="primary"
                                            className="w-full mt-4 py-4 text-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
                                            disabled={!selectedAddress || !selectedSlot}
                                            onClick={handleProceed}
                                        >
                                            Proceed to Payment
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
>>>>>>> 973a4b5ee0724c8af2a79148676bd95c2cbe45ed
