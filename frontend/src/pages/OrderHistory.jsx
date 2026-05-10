<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";

function formatPayment(v) {
    if (!v) return "Unknown";
    const s = String(v).toLowerCase().replace(/_/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const ORDERS_KEY_PREFIX = "orders:";

export default function OrderHistory() {
    const { currentUser } = useUser();
    const [orders, setOrders] = useState([]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            setOrders(data);
        } catch {
            setOrders([]);
        }
    }, [currentUser]);

    function statusBadge(status) {
        const s = String(status || "SUCCESS").toUpperCase();
        const cls =
            s === "SUCCESS" ? "badge badge-success" :
                s === "PENDING" ? "badge badge-pending" :
                    "badge badge-failed";
        return <span className={cls}>{s}</span>;
    }

    return (
        <div className="order-history">
            <div className="order-history-header">
                <div className="page-title">My Orders</div>
            </div>

            {orders.length === 0 && (
                <div className="order-empty">
                    <p>No orders yet.</p>
                </div>
            )}

            {orders.length > 0 && (
                <div className="order-grid">
                    {orders.map((o) => (
                        <div key={o.id} className="order-card">
                            <div className="order-card-header">
                                <span className="order-id"><strong>Order</strong> #{o.id}</span>
                                {statusBadge(o.status || "PAID")}
                            </div>

                            <div className="order-card-body">
                                <ul className="order-card-list">
                                    {(o.items || []).map((it, idx) => (
                                        <li key={idx}>
                                            <span>{it.name} x {it.qty ?? 1}</span>
                                            <span> - {it.lineTotal} €</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="order-meta">
                                    <div><strong>Place:</strong> {o.deliveryPlace}</div>
                                    <div><strong>Time:</strong> {(o.deliveryTime || "").replace("T", " ")}</div>
                                    <div><strong>Payment:</strong> {formatPayment(o.payment?.method || o.paymentMethod)}</div>
                                </div>

                                <div className="order-total"><strong>Total:</strong> {o.total} €</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
=======
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";

function formatPayment(v) {
    if (!v) return "Unknown";
    const s = String(v).toLowerCase().replace(/_/g, " ");
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const ORDERS_KEY_PREFIX = "orders:";

export default function OrderHistory() {
    const { currentUser } = useUser();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            setOrders(data);
        } catch {
            setOrders([]);
        }
    }, [currentUser]);

    function getStatusVariant(status) {
        const s = String(status || "SUCCESS").toUpperCase();
        if (s === "SUCCESS" || s === "CONFIRMED" || s === "DELIVERED" || s === "PAID") return "success";
        if (s === "PENDING" || s === "DRAFT") return "warning";
        if (s === "CANCELLED" || s === "FAILED") return "danger";
        return "neutral";
    }

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-4xl font-heading font-bold text-deep-sea-navy mb-2">My Orders</h2>
                <p className="text-slate-light text-lg">View your past orders and their status.</p>
            </div>

            {orders.length === 0 ? (
                <Card className="text-center py-20 border-dashed border-2">
                    <div className="text-5xl mb-4">🧾</div>
                    <p className="text-xl font-heading font-bold text-slate-dark mb-2">No orders yet.</p>
                    <p className="text-slate-light">When you place an order, it will appear here.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders.map((o) => (
                        <Card key={o.id} className="flex flex-col p-0 overflow-hidden shadow-md hover:shadow-xl transition-shadow border-border-gray/60">
                            <div className="bg-seabreeze-white px-6 py-4 border-b border-border-gray/50 flex justify-between items-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-semibold text-slate-light uppercase tracking-wider">Order</span>
                                    <span className="font-heading font-bold text-lg text-deep-sea-navy">#{o.id}</span>
                                </div>
                                <Badge variant={getStatusVariant(o.status || "PAID")} className="shadow-sm">
                                    {String(o.status || "PAID").toUpperCase()}
                                </Badge>
                            </div>

                            <div className="p-6 flex flex-col flex-1 gap-6">
                                <ul className="flex flex-col gap-3">
                                    {(o.items || []).map((it, idx) => (
                                        <li key={idx} className="flex justify-between items-start border-b border-border-gray/30 pb-3 last:border-0 last:pb-0">
                                            <span className="font-semibold text-slate-dark">{it.name} <span className="text-slate-light font-normal text-sm">× {it.qty ?? 1}</span></span>
                                            <span className="font-medium text-ocean-blue">{it.lineTotal?.toFixed(2) || "0.00"} €</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="grid grid-cols-2 gap-4 bg-ocean-blue/5 p-4 rounded-xl mt-auto">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold text-slate-light uppercase tracking-wider">Location</span>
                                        <span className="font-medium text-slate-dark text-sm">{o.deliveryPlace || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold text-slate-light uppercase tracking-wider">Time</span>
                                        <span className="font-medium text-slate-dark text-sm">{(o.deliveryTime || "").replace("T", " ") || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 col-span-2">
                                        <span className="text-xs font-semibold text-slate-light uppercase tracking-wider">Payment Method</span>
                                        <span className="font-medium text-slate-dark text-sm">{formatPayment(o.payment?.method || o.paymentMethod)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-border-gray">
                                    <span className="text-lg font-heading font-medium text-slate-dark">Total</span>
                                    <span className="text-2xl font-heading font-bold text-sunset-coral">{Number(o.total || 0).toFixed(2)} €</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
>>>>>>> 973a4b5ee0724c8af2a79148676bd95c2cbe45ed
