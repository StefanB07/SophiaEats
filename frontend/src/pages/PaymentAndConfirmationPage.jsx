import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";

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

    useEffect(() => {
        if (!orderId) return;
        try {
            const stored = localStorage.getItem(`${CLIENT_RECAP_PREFIX}${orderId}`);
            if (stored) {
                setClientRecap(JSON.parse(stored));
            }
        } catch {
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

                    try {
                        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
                        const existing = JSON.parse(localStorage.getItem(key) || "[]");
                        const deduped = [data, ...existing.filter((o) => o.id !== data.id)];
                        localStorage.setItem(key, JSON.stringify(deduped));
                    } catch {
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

            const firstPart = deliveryOptions.slot.split("-")[0];
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            const deliveryTimeStr = `${dateStr} ${firstPart}`;
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

            try {
                const recapItems = items.map((i) => {
                    const extras = (i.dish && i.dish.selectedExtras) || i.selectedExtras || i.extraOptions || [];
                    const unitPrice = typeof i.dish?.price === "number" ? i.dish.price : 0;
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
                    recapItems.reduce((sum, it) => sum + (it.lineTotal || 0), 0).toFixed(2)
                );

                const recapPayload = {
                    id: data.id,
                    items: recapItems,
                    total: recapTotal,
                    deliveryPlace,
                    deliveryTime: deliveryTimeStr,
                };

                localStorage.setItem(`${CLIENT_RECAP_PREFIX}${data.id}`, JSON.stringify(recapPayload));
                setClientRecap(recapPayload);
            } catch {
            }

            clearCart();
            navigate(`/order/confirmation/${data.id}`);
        } catch (e) {
            console.error(e);
            setError(e.message || "Could not place order");
        } finally {
            setPlacing(false);
        }
    }

    if (!orderId) {
        return (
            <div className="py-8 space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-4xl font-heading font-bold text-deep-sea-navy mb-2">Confirm & Payment</h2>
                        <p className="text-slate-light text-lg">Review your order details and complete the payment.</p>
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 text-ocean-blue hover:text-deep-sea-navy font-semibold transition-colors bg-ocean-blue/10 px-4 py-2 rounded-lg hover:bg-ocean-blue/20"
                        onClick={() => navigate("/cart")}
                    >
                        ← Back to Cart
                    </button>
                </div>

                {items.length === 0 && (
                    <Card className="text-center py-16 border-dashed border-2">
                        <div className="text-5xl mb-4">💳</div>
                        <p className="text-xl font-heading font-bold text-slate-dark mb-6">Your cart is empty.</p>
                        <Button variant="primary" onClick={() => navigate("/restaurants")}>
                            Browse restaurants
                        </Button>
                    </Card>
                )}
                {items.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="flex flex-col gap-6 shadow-lg border-border-gray/50">
                            <h3 className="text-2xl font-heading font-bold text-deep-sea-navy border-b border-border-gray pb-4">Order Summary</h3>
                            <ul className="flex flex-col gap-4">
                                {items.map((i) => {
                                    const extras = (i.dish && i.dish.selectedExtras) || i.selectedExtras || i.extraOptions || [];

                                    return (
                                        <li key={i.key} className="flex flex-col gap-1 pb-4 border-b border-border-gray/30 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-start">
                                                <strong className="text-lg font-heading text-slate-dark">{i.dish.name} <span className="text-slate-light font-normal">× {i.quantity}</span></strong>
                                                <span className="font-bold text-ocean-blue">
                                                    {i.dish.price != null ? `${(i.dish.price * i.quantity).toFixed(2)} €` : "N/A"}
                                                </span>
                                            </div>
                                            {extras.length > 0 && (
                                                <div className="text-sm text-slate-light flex flex-wrap gap-1 mt-1">
                                                    {extras.map((e, idx) => (
                                                        <span key={idx} className="bg-seabreeze-white border border-border-gray/50 px-2 py-0.5 rounded text-xs">
                                                            {e.label} {e.price != null ? `(+${e.price.toFixed(1)} €)` : ""}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="bg-seabreeze-white p-4 rounded-xl border border-border-gray/50 mt-2 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-light font-medium uppercase tracking-wide">Delivery Location</span>
                                    <span className="font-semibold text-slate-dark">{deliveryOptions.address || "(none)"}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-light font-medium uppercase tracking-wide">Time Slot</span>
                                    <span className="font-semibold text-slate-dark">{deliveryOptions.slot || "(none)"}</span>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card className="flex flex-col gap-6 shadow-lg border-border-gray/50 bg-pure-white">
                                <h3 className="text-2xl font-heading font-bold text-deep-sea-navy border-b border-border-gray pb-4">Payment Method</h3>
                                <div className="flex flex-col gap-4">
                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "STUDENT_CREDIT" ? "border-ocean-blue bg-ocean-blue/5 shadow-md" : "border-border-gray hover:border-ocean-blue/50"}`}>
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="STUDENT_CREDIT"
                                                checked={paymentMethod === "STUDENT_CREDIT"}
                                                onChange={() => setPaymentMethod("STUDENT_CREDIT")}
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-light rounded-full checked:border-ocean-blue transition-colors cursor-pointer"
                                            />
                                            <div className="absolute w-2.5 h-2.5 bg-ocean-blue rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-dark font-semibold text-lg">Student Credit</span>
                                            <span className="text-slate-light text-sm">Pay using your university balance</span>
                                        </div>
                                    </label>

                                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "EXTERNAL" ? "border-ocean-blue bg-ocean-blue/5 shadow-md" : "border-border-gray hover:border-ocean-blue/50"}`}>
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="EXTERNAL"
                                                checked={paymentMethod === "EXTERNAL"}
                                                onChange={() => setPaymentMethod("EXTERNAL")}
                                                className="peer appearance-none w-5 h-5 border-2 border-slate-light rounded-full checked:border-ocean-blue transition-colors cursor-pointer"
                                            />
                                            <div className="absolute w-2.5 h-2.5 bg-ocean-blue rounded-full opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-dark font-semibold text-lg">Credit / Debit Card</span>
                                            <span className="text-slate-light text-sm">External payment gateway</span>
                                        </div>
                                    </label>
                                </div>
                            </Card>

                            {error && (
                                <div className="bg-crimson-alert/10 text-crimson-alert p-4 rounded-xl border border-crimson-alert/20 font-medium">
                                    {error}
                                </div>
                            )}

                            <Button
                                disabled={placing || items.length === 0 || !deliveryOptions.address || !deliveryOptions.slot}
                                onClick={handlePlaceOrder}
                                variant="primary"
                                className="w-full py-4 text-xl shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 relative overflow-hidden group"
                            >
                                <span className="relative z-10">{placing ? "Processing Payment..." : "Confirm & Pay"}</span>
                                {!placing && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const recapSource = clientRecap || order;
    const recapItems = (recapSource && recapSource.items) || [];
    const recapTotal = recapSource && typeof recapSource.total === "number" ? recapSource.total : order?.total;
    const recapPlace = recapSource?.deliveryPlace || order?.deliveryPlace || "";
    const recapTime = (recapSource?.deliveryTime || order?.deliveryTime || "").replace("T", " ");

    return (
        <div className="py-12 max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
            <Card className="text-center p-8 md:p-12 shadow-2xl border-none ring-1 ring-border-gray/50 bg-pure-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mint-green to-ocean-blue"></div>
                
                <div className="w-24 h-24 bg-mint-green/20 text-mint-green rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
                    ✓
                </div>
                
                <h2 className="text-4xl font-heading font-bold text-deep-sea-navy mb-4">Order Confirmed!</h2>
                
                {error && <p className="text-crimson-alert font-medium bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm mt-4">{error}</p>}
                {!error && !order && !clientRecap && (
                    <p className="text-slate-light animate-pulse mt-4">Loading order details...</p>
                )}
                
                {(order || clientRecap) && (
                    <div className="mt-8 text-left space-y-8">
                        <p className="text-slate-light text-center text-lg">
                            Your order <strong className="text-slate-dark bg-seabreeze-white px-2 py-1 rounded border border-border-gray">#{order?.id || clientRecap?.id || orderId}</strong> has been placed successfully and is being prepared.
                        </p>
                        
                        <div className="bg-seabreeze-white p-6 rounded-2xl border border-border-gray/50">
                            <h3 className="text-2xl font-heading font-bold text-deep-sea-navy mb-4 border-b border-border-gray/50 pb-2">Order Recap</h3>
                            <ul className="space-y-4">
                                {recapItems.map((it, idx) => {
                                    const extras = it.extras || [];
                                    return (
                                        <li key={idx} className="flex flex-col">
                                            <div className="flex justify-between items-start font-semibold text-slate-dark">
                                                <span>{it.name} <span className="text-slate-light font-normal text-sm">× {it.qty}</span></span>
                                                <span className="text-ocean-blue">{it.lineTotal.toFixed(2)} €</span>
                                            </div>
                                            {extras.length > 0 && (
                                                <div className="text-sm text-slate-light mt-1 pl-2 border-l-2 border-border-gray">
                                                    {extras.map((e) => e.price != null ? `${e.label} (+${e.price.toFixed(1)} €)` : e.label).join(", ")}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            
                            <div className="mt-6 pt-4 border-t-2 border-dashed border-border-gray flex justify-between items-center">
                                <span className="text-lg font-heading font-bold text-slate-dark">Total Paid</span>
                                <span className="text-2xl font-heading font-bold text-sunset-coral">{recapTotal?.toFixed(2)} €</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-pure-white p-4 rounded-xl border border-border-gray flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-light uppercase tracking-wider">Delivery Location</span>
                                <span className="font-semibold text-slate-dark">{recapPlace}</span>
                            </div>
                            <div className="bg-pure-white p-4 rounded-xl border border-border-gray flex flex-col gap-1">
                                <span className="text-xs font-semibold text-slate-light uppercase tracking-wider">Estimated Time</span>
                                <span className="font-semibold text-slate-dark">{recapTime}</span>
                            </div>
                        </div>

                        <div className="pt-4 text-center">
                            <Button onClick={() => navigate("/orders")} variant="outline" className="w-full sm:w-auto">
                                View Order History
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
