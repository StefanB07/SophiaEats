import { useCart } from "../context/CartContext.jsx";

export default function CartAndDeliveryPage() {
    const { items, clearCart } = useCart();

    const totalPrice = items.reduce((sum, item) => {
        const price = item.dish.price ?? 0;
        return sum + price * item.quantity;
    }, 0);

    return (
        <div>
            <h2>Cart & Delivery</h2>

            {items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <ul>
                        {items.map((item) => (
                            <li key={item.key}>
                                <strong>{item.dish.name}</strong> ({item.restaurantName}) –{" "}
                                {item.quantity} ×{" "}
                                {item.dish.price != null ? `${item.dish.price} €` : "N/A"}
                            </li>
                        ))}
                    </ul>
                    <p>
                        <strong>Total:</strong> {totalPrice.toFixed(2)} €
                    </p>
                    <button type="button" onClick={clearCart}>
                        Clear cart
                    </button>
                </>
            )}

            <hr style={{ margin: "1.5rem 0" }} />

            {/* TODO here, later, you will add address selector and delivery time */}
            <p>(Delivery options will be implemented later.)</p>
        </div>
    );
}
