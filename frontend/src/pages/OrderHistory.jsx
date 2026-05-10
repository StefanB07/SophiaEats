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
                <h2 className="text-4xl font-heading font-bold text-starlight-white mb-2">My Orders</h2>
                <p className="text-fog-gray text-lg">View your past orders and their status.</p>
            </div>

            {orders.length === 0 ? (
                <Card className="text-center py-20 border-dashed border-2 border-luminescent-line bg-transparent shadow-none">
                    <div className="text-5xl mb-4">🧾</div>
                    <p className="text-xl font-heading font-bold text-starlight-white mb-2">No orders yet.</p>
                    <p className="text-fog-gray">When you place an order, it will appear here.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders.map((o) => (
                        <Card key={o.id} className="flex flex-col p-0 overflow-hidden shadow-md hover:shadow-xl transition-shadow border-luminescent-line">
                            <div className="bg-midnight-navy px-6 py-4 border-b border-luminescent-line flex justify-between items-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-semibold text-fog-gray uppercase tracking-wider">Order</span>
                                    <span className="font-heading font-bold text-lg text-starlight-white">#{o.id}</span>
                                </div>
                                <Badge variant={getStatusVariant(o.status || "PAID")} className="shadow-sm">
                                    {String(o.status || "PAID").toUpperCase()}
                                </Badge>
                            </div>

                            <div className="p-6 flex flex-col flex-1 gap-6 bg-deep-sea-surface">
                                <ul className="flex flex-col gap-3">
                                    {(o.items || []).map((it, idx) => (
                                        <li key={idx} className="flex justify-between items-start border-b border-luminescent-line pb-3 last:border-0 last:pb-0">
                                            <span className="font-semibold text-starlight-white">{it.name} <span className="text-fog-gray font-normal text-sm">× {it.qty ?? 1}</span></span>
                                            <span className="font-medium text-wave-crest-blue">{it.lineTotal?.toFixed(2) || "0.00"} €</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="grid grid-cols-2 gap-4 bg-midnight-navy p-4 rounded-xl mt-auto border border-luminescent-line">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold text-fog-gray uppercase tracking-wider">Location</span>
                                        <span className="font-medium text-starlight-white text-sm">{o.deliveryPlace || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold text-fog-gray uppercase tracking-wider">Time</span>
                                        <span className="font-medium text-starlight-white text-sm">{(o.deliveryTime || "").replace("T", " ") || "N/A"}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 col-span-2">
                                        <span className="text-xs font-semibold text-fog-gray uppercase tracking-wider">Payment Method</span>
                                        <span className="font-medium text-starlight-white text-sm">{formatPayment(o.payment?.method || o.paymentMethod)}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-luminescent-line">
                                    <span className="text-lg font-heading font-medium text-starlight-white">Total</span>
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
