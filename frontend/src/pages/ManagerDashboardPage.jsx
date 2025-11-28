import { useUser } from "../context/UserContext.jsx";

export default function ManagerDashboardPage() {
    const { currentUser } = useUser();

    return (
        <div>
            <h2>Manager dashboard</h2>
            <p>
                Logged in as manager with user ID: <strong>{currentUser || "(none)"} </strong>
            </p>

            <p style={{ marginTop: "1rem" }}>
                From here, a restaurant manager will be able to:
            </p>
            <ul>
                <li>Register and update dishes (name, description, category, type, toppings, tags).</li>
                <li>Configure opening hours and capacity per 30-minute slot.</li>
            </ul>

            <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
                We will later connect this page to the backend endpoints for dishes and schedule (R2 & R5).
            </p>
        </div>
    );
}
