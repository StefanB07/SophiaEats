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

    const isHome = location.pathname === "/";

    // ajută la highlight pentru link activ
    const isActive = (path) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <div className="app">
            <div className="app-shell">

                {/* HEADER */}
                <header className="app-header">
                    <div className="header-container">

                        {/* LEFT: LOGO + NAV */}
                        <div className="header-left">
                            <div className="app-title">Sophia Tech Eats</div>

                            {!isHome && (
                                <nav className="app-nav">

                                    <Link
                                        className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}
                                        to="/"
                                    >
                                        Home
                                    </Link>

                                    {role === "customer" && (
                                        <>
                                            <Link
                                                className={`nav-link ${isActive("/restaurants") ? "nav-link-active" : ""}`}
                                                to="/restaurants"
                                            >
                                                Restaurants
                                            </Link>

                                            <Link
                                                className={`nav-link ${isActive("/orders") ? "nav-link-active" : ""}`}
                                                to="/orders"
                                            >
                                                My Orders
                                            </Link>
                                        </>
                                    )}

                                    {role === "manager" && (
                                        <Link
                                            className={`nav-link ${isActive("/manager") ? "nav-link-active" : ""}`}
                                            to="/manager"
                                        >
                                            Manager
                                        </Link>
                                    )}
                                </nav>
                            )}
                        </div>

                        {/* RIGHT: CART BUTTON */}
                        {!isHome && role === "customer" && (
                            <div className="header-right">
                                <Link to="/cart" className="btn-cart-white">
                                    <span className="cart-icon-black">🛒</span>
                                    Cart
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="app-main">{children}</main>

                {/* FOOTER */}
                <footer className="app-footer">
                    <span>© 2025 – Sophia Tech Eats</span>
                </footer>

            </div>
        </div>
    );
}

/* Protected routes */

function CustomerRoute({ children }) {
    const { role } = useUser();
    if (role !== "customer") return <Navigate to="/" replace />;
    return children;
}

function ManagerRoute({ children }) {
    const { role } = useUser();
    if (role !== "manager") return <Navigate to="/" replace />;
    return children;
}

export default function App() {
    return (
        <AppLayout>
            <Routes>

                {/* Landing */}
                <Route path="/" element={<RoleSelectionPage />} />

                {/* CUSTOMER ROUTES */}
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

                <Route
                    path="/orders"
                    element={
                        <CustomerRoute>
                            <OrderHistory />
                        </CustomerRoute>
                    }
                />

                {/* MANAGER ROUTES */}
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
