import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import RestaurantListPage from "./pages/RestaurantListPage.jsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.jsx";
import CartAndDeliveryPage from "./pages/CartAndDeliveryPage.jsx";
import PaymentAndConfirmationPage from "./pages/PaymentAndConfirmationPage.jsx";
import RoleSelectionPage from "./pages/RoleSelectionPage.jsx";
import ManagerDashboardPage from "./pages/ManagerDashboardPage.jsx";
import { useUser } from "./context/UserContext.jsx";

function AppLayout({ children }) {
    const { role } = useUser();
    const location = useLocation();
    const isHome = location.pathname === "/"; // pagina de Role Selection

    return (
        <div className="app">
            <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
                <h1>Sophia Tech Eats</h1>

                {/* Pe home NU arătăm nav-ul */}
                {!isHome && (
                    <nav style={{ marginTop: "0.5rem" }}>
                        <Link to="/" style={{ marginRight: "1rem" }}>
                            Home
                        </Link>

                        {role === "customer" && (
                            <>
                                <Link to="/restaurants" style={{ marginRight: "1rem" }}>
                                    Restaurants
                                </Link>
                                <Link to="/cart" style={{ marginRight: "1rem" }}>
                                    Cart
                                </Link>
                            </>
                        )}

                        {role === "manager" && (
                            <Link to="/manager">
                                Manager
                            </Link>
                        )}
                    </nav>
                )}
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

// Ruta protejată pentru CUSTOMER
function CustomerRoute({ children }) {
    const { role } = useUser();
    if (role !== "customer") {
        return <Navigate to="/" replace />;
    }
    return children;
}

// Ruta protejată pentru MANAGER
function ManagerRoute({ children }) {
    const { role } = useUser();
    if (role !== "manager") {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default function App() {
    return (
        <AppLayout>
            <Routes>
                {/* Landing / Role selection */}
                <Route path="/" element={<RoleSelectionPage />} />

                {/* CUSTOMER flow (doar pentru role === "customer") */}
                <Route
                    path="/restaurants"
                    element={
                        <CustomerRoute>
                            <RestaurantListPage />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/restaurants/:name"
                    element={
                        <CustomerRoute>
                            <RestaurantDetailPage />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/cart"
                    element={
                        <CustomerRoute>
                            <CartAndDeliveryPage />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/payment"
                    element={
                        <CustomerRoute>
                            <PaymentAndConfirmationPage />
                        </CustomerRoute>
                    }
                />
                <Route
                    path="/order/confirmation/:orderId"
                    element={
                        <CustomerRoute>
                            <PaymentAndConfirmationPage />
                        </CustomerRoute>
                    }
                />

                {/* MANAGER flow (doar pentru role === "manager") */}
                <Route
                    path="/manager"
                    element={
                        <ManagerRoute>
                            <ManagerDashboardPage />
                        </ManagerRoute>
                    }
                />
            </Routes>
        </AppLayout>
    );
}
