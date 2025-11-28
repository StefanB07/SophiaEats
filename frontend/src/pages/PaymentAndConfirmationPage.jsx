import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState } from "react";

const ORDERS_KEY_PREFIX = "orders:";
const LAST_ORDER_KEY = "lastConfirmedOrderId";

export default function PaymentAndConfirmationPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { items, clearCart, deliveryOptions } = useCart();
    const { currentUser } = useUser();

    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("STUDENT_CREDIT");

    useEffect(() => {
        async function fetchOrder() {
            if (!orderId) return;
            try {
                const resp = await fetch(`/api/orders/${orderId}`, {
                    headers: { 'X-User-Id': String(currentUser) }
                });
                if (resp.ok) {
                    const data = await resp.json();
                    setOrder(data);

                    // Pass order recap to "My Orders" (persist without altering UI logic)
                    try {
                        const key = `${ORDERS_KEY_PREFIX}${currentUser}`;
                        const existing = JSON.parse(localStorage.getItem(key) || "[]");
                        const deduped = [data, ...existing.filter((o) => o.id !== data.id)];
                        localStorage.setItem(key, JSON.stringify(deduped));
                        localStorage.setItem(LAST_ORDER_KEY, data.id);
                    } catch {}
                } else {
                    setError(`Failed to load order recap (HTTP ${resp.status})`);
                }
            } catch (e) {
                setError('Failed to load order recap');
            }
        }
        fetchOrder();
    }, [orderId, currentUser]);

    async function handlePlaceOrder() {
        setError(null);
        setPlacing(true);
        try {
            if (!currentUser) throw new Error('No user id');
            if (items.length === 0) throw new Error('Cart is empty');
            if (!deliveryOptions.address || !deliveryOptions.slot) throw new Error('Missing delivery information');

            const firstPart = deliveryOptions.slot.split('-')[0]; // HH:mm
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const deliveryTimeStr = `${dateStr} ${firstPart}`; // yyyy-MM-dd HH:mm
            const deliveryPlace = deliveryOptions.address.trim();

            const payload = { deliveryPlace, deliveryTime: deliveryTimeStr, paymentMethod };

            const resp = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'X-User-Id': String(currentUser),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }
            const data = await resp.json();
            clearCart();
            navigate(`/order/confirmation/${data.id}`);
        } catch (e) {
            console.error('Order placement failed', e);
            setError(e.message || 'Could not place order');
        } finally {
            setPlacing(false);
        }
    }

    if (!orderId) {
        return (
            <div>
                <h2>Confirm & Payment</h2>
                {items.length === 0 && <p>Your cart is empty. Go back to add dishes.</p>}
                {items.length > 0 && (
                    <>
                        <h3>Order Summary</h3>
                        <ul>
                            {items.map(i => (
                                <li key={i.key}>{i.dish.name} × {i.quantity}</li>
                            ))}
                        </ul>
                        <p><strong>Delivery:</strong> {deliveryOptions.address || '(none)'} – {deliveryOptions.slot || '(none)'}</p>

                        <h3>Payment method</h3>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="STUDENT_CREDIT"
                                    checked={paymentMethod === 'STUDENT_CREDIT'}
                                    onChange={() => setPaymentMethod('STUDENT_CREDIT')}
                                />{' '}
                                Student credit
                            </label>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="EXTERNAL"
                                    checked={paymentMethod === 'EXTERNAL'}
                                    onChange={() => setPaymentMethod('EXTERNAL')}
                                />{' '}
                                External payment
                            </label>
                        </div>

                        <button
                            disabled={placing || items.length === 0 || !deliveryOptions.address || !deliveryOptions.slot}
                            onClick={handlePlaceOrder}
                            style={{ padding: '0.6rem 1rem', background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer' }}
                        >{placing ? 'Placing...' : 'Confirm & pay'}</button>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </>
                )}
            </div>
        );
    }

    return (
        <div>
            <h2>Order confirmation</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!error && !order && <p>Loading order details...</p>}
            {order && (
                <>
                    <p>Your order <strong>{order.id}</strong> has been placed successfully.</p>
                    <h3>Recap</h3>
                    <ul>
                        {order.items && order.items.map((it, idx) => (
                            <li key={idx}>{it.name} × {it.qty} – {it.lineTotal} €</li>
                        ))}
                    </ul>
                    <p><strong>Total:</strong> {order.total} €</p>
                    <p><strong>Delivery place:</strong> {order.deliveryPlace}</p>
                    <p><strong>Delivery time:</strong> {order.deliveryTime}</p>
                </>
            )}
        </div>
    );
}