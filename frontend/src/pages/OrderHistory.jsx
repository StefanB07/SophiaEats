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

    useEffect(() => {
        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            setOrders(data);
        } catch {
            setOrders([]);
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
