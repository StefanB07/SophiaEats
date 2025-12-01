import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState } from "react";

const ORDERS_KEY_PREFIX = "orders:";
const ORDER_CLIENT_RECAP_PREFIX = "orderClientRecap:";

export default function PaymentAndConfirmationPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { items, clearCart, deliveryOptions } = useCart();
    const { currentUser } = useUser();

    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("STUDENT_CREDIT");

    // recap calculat pe client (cu extra options)
    const [clientRecap, setClientRecap] = useState(null);

    // încărcăm recap-ul calculat pe client (dacă există) pentru orderId-ul curent
    useEffect(() => {
        if (!orderId) return;
        try {
            const raw = localStorage.getItem(`${ORDER_CLIENT_RECAP_PREFIX}${orderId}`);
            if (raw) {
                setClientRecap(JSON.parse(raw));
            }
        } catch {
            // ignorăm; recap-ul client este opțional
        }
    }, [orderId]);

    useEffect(() => {
        async function fetchOrder() {
            if (!orderId) return;
            try {
                const resp = await fetch(`/api/orders/${orderId}`, {
                    headers: { "X-User-Id": String(currentUser) },
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setOrder(data);

                    // salvăm în "My Orders" varianta de la backend (nu stricăm logica existentă)
                    try {
                        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
                        const existing = JSON.parse(localStorage.getItem(key) || "[]");
                        const deduped = [data, ...existing.filter((o) => o.id !== data.id)];
                        localStorage.setItem(key, JSON.stringify(deduped));
                    } catch {
                        // ignore
                    }
                } else {
                    setError(`Failed to load order recap (HTTP ${resp.status})`);
                }
            } catch {
                setError("Failed to load order recap");
            }
        }
        fetchOrder();
    }, [orderId, currentUser]);

    async function handlePlaceOrder() {
        setError(null);
        setPlacing(true);
        try {
            if (!currentUser) throw new Error("No user id");
            if (items.length === 0) throw new Error("Cart is empty");
            if (!deliveryOptions.address || !deliveryOptions.slot) {
                throw new Error("Missing delivery information");
            }

            const firstPart = deliveryOptions.slot.split("-")[0]; // HH:mm
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(
                now.getMonth() + 1
            ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const deliveryTimeStr = `${dateStr} ${firstPart}`; // yyyy-MM-dd HH:mm
            const deliveryPlace = deliveryOptions.address.trim();

            const payload = {
                deliveryPlace,
                deliveryTime: deliveryTimeStr,
                paymentMethod,
            };

            const resp = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "X-User-Id": String(currentUser),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            const data = await resp.json();

            //  1) Construim un "client recap" cu prețurile care includ extra options
            try {
                const clientItems = items.map((i) => {
                    const qty = i.quantity ?? 1;
                    const extras =
                        (i.dish && i.dish.selectedExtras) ||
                        i.selectedExtras ||
                        i.extraOptions ||
                        [];

                    const basePrice = i.dish?.price ?? 0;
                    const extrasTotal = extras.reduce(
                        (sum, e) => sum + (e.price || 0),
                        0
                    );
                    const unitPriceWithExtras = basePrice + extrasTotal;
                    const lineTotal = unitPriceWithExtras * qty;

                    return {
                        key: i.key,
                        name: i.dish?.name || "Unknown dish",
                        qty,
                        basePrice,
                        extras,
                        unitPriceWithExtras,
                        lineTotal,
                    };
                });

                const clientTotal = clientItems.reduce(
                    (sum, it) => sum + it.lineTotal,
                    0
                );

                const clientRecapToStore = {
                    orderId: data.id,
                    items: clientItems,
                    total: clientTotal,
                };

                localStorage.setItem(
                    `${ORDER_CLIENT_RECAP_PREFIX}${data.id}`,
                    JSON.stringify(clientRecapToStore)
                );
            } catch {
                // dacă nu reușește, nu stricăm flow-ul; doar recap-ul client nu va exista
            }

            // 2) Golește coșul și mergi la pagina de confirmare
            clearCart();
            navigate(`/order/confirmation/${data.id}`);
        } catch (e) {
            console.error("Order placement failed", e);
            setError(e.message || "Could not place order");
        } finally {
            setPlacing(false);
        }
    }

    // ─────────────────────────────
    // VARIANTA FĂRĂ orderId: ecranul Confirm & Payment (înainte de POST)
    // ─────────────────────────────
    if (!orderId) {
        return (
            <div>
                <h2>Confirm &amp; Payment</h2>
                {items.length === 0 && (
                    <p>Your cart is empty. Go back to add dishes.</p>
                )}
                {items.length > 0 && (
                    <>
                        <h3>Order Summary</h3>
                        <ul>
                            {items.map((i) => {
                                const extras =
                                    (i.dish && i.dish.selectedExtras) ||
                                    i.selectedExtras ||
                                    i.extraOptions ||
                                    [];

                                return (
                                    <li key={i.key} style={{ marginBottom: "0.5rem" }}>
                                        <div>
                                            {i.dish.name} × {i.quantity}
                                        </div>
                                        {extras.length > 0 && (
                                            <div
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "#6b7280",
                                                }}
                                            >
                                                Extras:{" "}
                                                {extras
                                                    .map((e) =>
                                                        e.price != null
                                                            ? `${e.label} (+${e.price.toFixed(
                                                                1
                                                            )} €)`
                                                            : e.label
                                                    )
                                                    .join(", ")}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>

                        <p>
                            <strong>Delivery:</strong>{" "}
                            {deliveryOptions.address || "(none)"} –{" "}
                            {deliveryOptions.slot || "(none)"}
                        </p>

                        <h3>Payment method</h3>
                        <div style={{ marginBottom: "0.5rem" }}>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="STUDENT_CREDIT"
                                    checked={paymentMethod === "STUDENT_CREDIT"}
                                    onChange={() =>
                                        setPaymentMethod("STUDENT_CREDIT")
                                    }
                                />{" "}
                                Student credit
                            </label>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="EXTERNAL"
                                    checked={paymentMethod === "EXTERNAL"}
                                    onChange={() =>
                                        setPaymentMethod("EXTERNAL")
                                    }
                                />{" "}
                                External payment
                            </label>
                        </div>

                        <button
                            disabled={
                                placing ||
                                items.length === 0 ||
                                !deliveryOptions.address ||
                                !deliveryOptions.slot
                            }
                            onClick={handlePlaceOrder}
                            style={{
                                padding: "0.6rem 1rem",
                                background: "#2196F3",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            {placing ? "Placing..." : "Confirm & pay"}
                        </button>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </>
                )}
            </div>
        );
    }

    // ─────────────────────────────
    // VARIANTA CU orderId: ecranul Order confirmation
    // ─────────────────────────────
    const recapItems =
        clientRecap?.items ||
        (order?.items || []).map((it) => ({
            name: it.name,
            qty: it.qty,
            lineTotal: it.lineTotal,
            extras: [],
        }));

    const recapTotal =
        clientRecap?.total != null
            ? clientRecap.total
            : order?.total != null
                ? order.total
                : 0;

    return (
        <div>
            <h2>Order confirmation</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!error && !order && <p>Loading order details...</p>}
            {order && (
                <>
                    <p>
                        Your order <strong>{order.id}</strong> has been placed
                        successfully.
                    </p>
                    <h3>Recap</h3>
                    <ul>
                        {recapItems.map((it, idx) => (
                            <li key={idx} style={{ marginBottom: "0.5rem" }}>
                                <div>
                                    {it.name} × {it.qty} –{" "}
                                    {it.lineTotal.toFixed(2)} €
                                </div>
                                {it.extras && it.extras.length > 0 && (
                                    <ul
                                        style={{
                                            marginTop: "0.25rem",
                                            marginLeft: "1rem",
                                            fontSize: "0.85rem",
                                            color: "#6b7280",
                                        }}
                                    >
                                        {it.extras.map((ex) => (
                                            <li key={ex.id}>
                                                + {ex.label} (
                                                {ex.price.toFixed(2)} €)
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                    <p>
                        <strong>Total:</strong> {recapTotal.toFixed(2)} €
                    </p>
                    <p>
                        <strong>Delivery place:</strong>{" "}
                        {order.deliveryPlace}
                    </p>
                    <p>
                        <strong>Delivery time:</strong>{" "}
                        {(order.deliveryTime || "").replace("T", " ")}
                    </p>
                </>
            )}
        </div>
    );
}
