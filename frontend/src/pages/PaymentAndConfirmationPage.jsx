import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState } from "react";

const ORDERS_KEY_PREFIX = "orders:";
const CLIENT_RECAP_PREFIX = "order-client-recap:";

export default function PaymentAndConfirmationPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { items, clearCart, deliveryOptions } = useCart();
    const { currentUser } = useUser();

    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("STUDENT_CREDIT");
    const [clientRecap, setClientRecap] = useState(null);

    // Încarc recap-ul clientului
    useEffect(() => {
        if (!orderId) return;
        try {
            const stored = localStorage.getItem(`${CLIENT_RECAP_PREFIX}${orderId}`);
            if (stored) {
                setClientRecap(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
    }, [orderId]);

    // Fetch recap din backend
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

                    // salvăm recap-ul pentru My Orders (OrderHistory)
                    try {
                        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
                        const existing = JSON.parse(localStorage.getItem(key) || "[]");
                        const deduped = [data, ...existing.filter((o) => o.id !== data.id)];
                        localStorage.setItem(key, JSON.stringify(deduped));
                    } catch {
                        /* ignore */
                    }
                } else {
                    setError(`Failed to load order recap (HTTP ${resp.status})`);
                }
            } catch (e) {
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
            if (!deliveryOptions.address || !deliveryOptions.slot)
                throw new Error("Missing delivery information");

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

            //  Snapshot client-side (exact cum ai văzut în coș)
            try {
                const recapItems = items.map((i) => {
                    const extras =
                        (i.dish && i.dish.selectedExtras) ||
                        i.selectedExtras ||
                        i.extraOptions ||
                        [];

                    const unitPrice =
                        typeof i.dish?.price === "number" ? i.dish.price : 0;
                    const qty = typeof i.quantity === "number" ? i.quantity : 1;
                    const lineTotal = Number((unitPrice * qty).toFixed(2));

                    return {
                        name: i.dish?.name || "",
                        qty,
                        lineTotal,
                        extras: extras.map((e) => ({
                            label: e.label,
                            price: e.price,
                        })),
                    };
                });

                const recapTotal = Number(
                    recapItems
                        .reduce((sum, it) => sum + (it.lineTotal || 0), 0)
                        .toFixed(2)
                );

                const recapPayload = {
                    id: data.id,
                    items: recapItems,
                    total: recapTotal,
                    deliveryPlace,
                    deliveryTime: deliveryTimeStr,
                };

                localStorage.setItem(
                    `${CLIENT_RECAP_PREFIX}${data.id}`,
                    JSON.stringify(recapPayload)
                );
                setClientRecap(recapPayload);
            } catch {
                // dacă ceva e în neregulă cu localStorage, nu blocăm fluxul
            }

            clearCart();
            navigate(`/order/confirmation/${data.id}`);
        } catch (e) {
            console.error("Order placement failed", e);
            setError(e.message || "Could not place order");
        } finally {
            setPlacing(false);
        }
    }

    // === Ramura fără orderId: pagina de Confirm & Pay ===
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
                                    <li key={i.key}>
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
                                    checked={
                                        paymentMethod === "STUDENT_CREDIT"
                                    }
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
                        {error && (
                            <p style={{ color: "red" }}>{error}</p>
                        )}
                    </>
                )}
            </div>
        );
    }

    // === Ramura cu orderId: pagina Order confirmation ===
    const recapSource = clientRecap || order;
    const recapItems = (recapSource && recapSource.items) || [];
    const recapTotal =
        recapSource && typeof recapSource.total === "number"
            ? recapSource.total
            : order?.total;
    const recapPlace =
        recapSource?.deliveryPlace || order?.deliveryPlace || "";
    const recapTime =
        (recapSource?.deliveryTime || order?.deliveryTime || "").replace(
            "T",
            " "
        );

    return (
        <div>
            <h2>Order confirmation</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {!error && !order && !clientRecap && (
                <p>Loading order details.</p>
            )}
            {(order || clientRecap) && (
                <>
                    <p>
                        Your order{" "}
                        <strong>
                            {order?.id || clientRecap?.id || orderId}
                        </strong>{" "}
                        has been placed successfully.
                    </p>
                    <h3>Recap</h3>
                    <ul>
                        {recapItems.map((it, idx) => {
                            const extras = it.extras || [];
                            return (
                                <li key={idx}>
                                    <div>
                                        {it.name} × {it.qty} –{" "}
                                        {it.lineTotal} €
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
                        <strong>Total:</strong> {recapTotal} €
                    </p>
                    <p>
                        <strong>Delivery place:</strong> {recapPlace}
                    </p>
                    <p>
                        <strong>Delivery time:</strong> {recapTime}
                    </p>
                </>
            )}
        </div>
    );
}
