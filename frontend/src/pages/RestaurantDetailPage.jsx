import { useParams } from "react-router-dom";

export default function RestaurantDetailPage() {
    const { name } = useParams();

    return (
        <div>
            <h2>Restaurant details</h2>
            <p>Selected restaurant: <strong>{name}</strong></p>
            <p>Here we will show the menu and Add to cart buttons.</p>
        </div>
    );
}
