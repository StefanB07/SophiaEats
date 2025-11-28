import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";

const ORDERS_KEY_PREFIX = "orders:";

export default function OrderHistory() {
    const { currentUser, loading: userLoading } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading || !currentUser) return;
        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        const visible = list.filter((o) => o.status === "PAID" || o.status === "DELIVERED");
        setOrders(visible);
        setLoading(false);
    }, [currentUser, userLoading]);

    if (userLoading || loading) return <div>Loading orders...</div>;
    if (!orders.length) return <div>No past orders found.</div>;

    return (
        <div>
            <h2>My Orders</h2>
            <ul>
                {orders.map((order) => (
                    <li key={order.id} style={{ marginBottom: "12px" }}>
                        <div><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                        <div><b>Status:</b> {order.status}</div>
                        <div><b>Delivery place:</b> {order.deliveryPlace}</div>
                        <div><b>Delivery time:</b> {order.deliveryTime}</div>
                        <div><b>Total:</b> {Number(order.total).toFixed(2)} €</div>
                        <div><b>Items:</b></div>
                        <ul>
                            {(order.items || []).map((it, idx) => (
                                <li key={idx}>{it.name} × {it.qty}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
}