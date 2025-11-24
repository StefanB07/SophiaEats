import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useUser } from "../context/UserContext.jsx";
import { useEffect, useState } from "react";

export default function PaymentAndConfirmationPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { items, clearCart, deliveryOptions } = useCart();
    const { currentUser } = useUser();

    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);

    // If we already have an order id (confirmation route), fetch order details for recap
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

            // Derive YYYY-MM-DD HH:mm from slot label like "12:00-12:30"
            const firstPart = deliveryOptions.slot.split('-')[0]; // HH:mm
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const deliveryTimeStr = `${dateStr} ${firstPart}`; // matches backend pattern yyyy-MM-dd HH:mm
            const deliveryPlace = deliveryOptions.address.trim();
            const body = `${deliveryPlace}|${deliveryTimeStr}`;
            const resp = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'X-User-Id': String(currentUser), 'Content-Type': 'text/plain' },
                body
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }
            const data = await resp.json();
            // data.id should exist; navigate to confirmation route
            clearCart(); // empty local cart after successful order (backend also clears)
            navigate(`/order/confirmation/${data.id}`);
        } catch (e) {
            console.error('Order placement failed', e);
            setError(e.message || 'Could not place order');
        } finally {
            setPlacing(false);
        }
    }

    // If we are on the payment step (no orderId yet)
    if (!orderId) {
        return (
            <div>
                <h2>Confirm & Place Order</h2>
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
                        <button
                            disabled={placing || items.length === 0 || !deliveryOptions.address || !deliveryOptions.slot}
                            onClick={handlePlaceOrder}
                            style={{ padding: '0.6rem 1rem', background: '#2196F3', color: '#fff', border: 'none', cursor: 'pointer' }}
                        >{placing ? 'Placing...' : 'Confirm & place order'}</button>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                    </>
                )}
            </div>
        );
    }

    // Confirmation view with recap
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
