import { Routes, Route, Link } from "react-router-dom";
import RestaurantListPage from "./pages/RestaurantListPage.jsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.jsx";
import CartAndDeliveryPage from "./pages/CartAndDeliveryPage.jsx";
import PaymentAndConfirmationPage from "./pages/PaymentAndConfirmationPage.jsx";
import { useUser } from "./context/UserContext.jsx";

function AppLayout({ children }) {
    const { currentUser, setCurrentUser, users } = useUser();

    const hasUsers = Array.isArray(users) && users.length > 0;

    function handleUserChange(e) {
        setCurrentUser(e.target.value);
    }

    return (
        <div className="app">
            <div className="app-shell">
                <header className="app-header">
                    <div className="app-header-top">
                        <div>
                            <div className="app-title">Sophia Tech Eats</div>
                            <nav className="app-nav">
                                <Link className="nav-link" to="/">
                                    Home
                                </Link>
                                <Link className="nav-link" to="/cart">
                                    Cart
                                </Link>
                            </nav>
                        </div>
                        <div className="app-user">
                            <label>
                                Current user:{" "}
                                <select
                                    className="select"
                                    value={currentUser || ""}
                                    onChange={handleUserChange}
                                    disabled={!hasUsers}
                                >
                                    {!hasUsers && (
                                        <option value="">(no users loaded)</option>
                                    )}
                                    {hasUsers &&
                                        users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name}
                                            </option>
                                        ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </header>

                <main className="app-main">{children}</main>

                <footer className="app-footer">
                    <span>© 2025 – Sophia Tech Eats</span>
                </footer>
            </div>
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
                <Route path="/payment" element={<PaymentAndConfirmationPage />} />
                <Route
                    path="/order/confirmation/:orderId"
                    element={<PaymentAndConfirmationPage />}
                />
            </Routes>
        </AppLayout>
    );
}
