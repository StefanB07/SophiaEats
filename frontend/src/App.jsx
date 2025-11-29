import {
    Routes,
    Route,
    Link,
    Navigate,
    useLocation,
} from "react-router-dom";

import RestaurantListPage from "./pages/RestaurantListPage.jsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.jsx";
import CartAndDeliveryPage from "./pages/CartAndDeliveryPage.jsx";
import PaymentAndConfirmationPage from "./pages/PaymentAndConfirmationPage.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import RoleSelectionPage from "./pages/RoleSelectionPage.jsx";
import ManagerDashboardPage from "./pages/ManagerDashboardPage.jsx";
import { useUser } from "./context/UserContext.jsx";

function AppLayout({ children }) {
    const { role } = useUser();
    const location = useLocation();
    const isHome = location.pathname === "/"; // pagina de Role Selection

    return (
        <div className="app">
            <div className="app-shell">
                <header className="app-header">
                    <div className="app-header-top">
                        <div>
                            <div className="app-title">Sophia Tech Eats</div>

                            {/* Pe home (role selection) nu arătăm nav-ul */}
                            {!isHome && (
                                <nav className="app-nav">
                                    <Link className="nav-link" to="/">
                                        Home
                                    </Link>

                                    {role === "customer" && (
                                        <>
                                            <Link
                                                className="nav-link"
                                                to="/restaurants"
                                            >
                                                Restaurants
                                            </Link>
                                            <Link
                                                className="nav-link"
                                                to="/cart"
                                            >
                                                Cart
                                            </Link>
                                            {/* NEW: My Orders link (customer-only) */}
                                            <Link className="nav-link" to="/orders">
                                                My Orders
                                            </Link>
                                        </>
                                    )}

                                    {role === "manager" && (
                                        <Link
                                            className="nav-link"
                                            to="/manager"
                                        >
                                            Manager
                                        </Link>
                                    )}
                                </nav>
                            )}
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
                {/* NEW: Order history route (customer-only) */}
                <Route
                    path="/orders"
                    element={
                        <CustomerRoute>
                            <OrderHistory />
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