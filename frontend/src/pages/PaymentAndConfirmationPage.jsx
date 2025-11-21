import { useParams } from "react-router-dom";

export default function PaymentAndConfirmationPage() {
    const { orderId } = useParams();

    return (
        <div>
            <h2>Order confirmation</h2>
            {orderId ? (
                <p>Your order <strong>{orderId}</strong> has been placed (simulated).</p>
            ) : (
                <p>No order id provided yet.</p>
            )}
        </div>
    );
}
