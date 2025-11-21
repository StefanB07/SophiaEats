import { Routes, Route, Link } from "react-router-dom";
import RestaurantListPage from "./pages/RestaurantListPage.jsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.jsx";
import CartAndDeliveryPage from "./pages/CartAndDeliveryPage.jsx";
import PaymentAndConfirmationPage from "./pages/PaymentAndConfirmationPage.jsx";
import { useUser } from "./context/UserContext.jsx";

function AppLayout({ children }) {
    const { currentUser, setCurrentUser, seededUsers } = useUser();

    function handleUserChange(e) {
        setCurrentUser(e.target.value);
    }

    return (
        <div className="app">
            <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
                <h1>Sophia Tech Eats</h1>
                <nav style={{ marginTop: "0.5rem" }}>
                    <Link to="/" style={{ marginRight: "1rem" }}>
                        Home
                    </Link>
                    <Link to="/cart">Cart</Link>
                </nav>

                {/* Current user selector (US4) */}
                <div style={{ marginTop: "0.5rem" }}>
                    <label>
                        Current user:{" "}
                        <select
                            value={currentUser}
                            onChange={handleUserChange}
                            style={{ marginLeft: "0.5rem" }}
                        >
                            {seededUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </header>

            <main style={{ padding: "1rem" }}>{children}</main>

            <footer
                style={{
                    padding: "1rem",
                    borderTop: "1px solid #ddd",
                    marginTop: "2rem",
                }}
            >
                <small>© 2025 – Sophia Tech Eats</small>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<RestaurantListPage />} />
                <Route path="/restaurants/:name" element={<RestaurantDetailPage />} />
                <Route path="/cart" element={<CartAndDeliveryPage />} />
                <Route
                    path="/order/confirmation/:orderId"
                    element={<PaymentAndConfirmationPage />}
                />
            </Routes>
        </AppLayout>
    );
}
