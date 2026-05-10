<<<<<<< HEAD
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
=======
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
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
    const isActive = (path) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-seabreeze-white text-slate-dark font-sans flex flex-col">
            <header className="w-full max-w-7xl mx-auto px-4 py-6">
                <div className="bg-gradient-to-r from-deep-sea-navy to-ocean-blue text-pure-white rounded-2xl p-4 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-8">
                        <div className="text-2xl font-heading font-bold tracking-wide">SophiaTech Eats</div>
                        {!isHome && (
                            <nav className="flex gap-2">
                                <Link
                                    className={`px-4 py-2 rounded-full font-medium transition-all ${isActive("/") ? "bg-pure-white/20 text-pure-white" : "text-pure-white/80 hover:bg-pure-white/10"}`}
                                    to="/"
                                >
                                    Home
                                </Link>
                                {role === "customer" && (
                                    <>
                                        <Link
                                            className={`px-4 py-2 rounded-full font-medium transition-all ${isActive("/restaurants") ? "bg-pure-white/20 text-pure-white" : "text-pure-white/80 hover:bg-pure-white/10"}`}
                                            to="/restaurants"
                                        >
                                            Restaurants
                                        </Link>
                                        <Link
                                            className={`px-4 py-2 rounded-full font-medium transition-all ${isActive("/orders") ? "bg-pure-white/20 text-pure-white" : "text-pure-white/80 hover:bg-pure-white/10"}`}
                                            to="/orders"
                                        >
                                            My Orders
                                        </Link>
                                    </>
                                )}
                                {role === "manager" && (
                                    <Link
                                        className={`px-4 py-2 rounded-full font-medium transition-all ${isActive("/manager") ? "bg-pure-white/20 text-pure-white" : "text-pure-white/80 hover:bg-pure-white/10"}`}
                                        to="/manager"
                                    >
                                        Manager
                                    </Link>
                                )}
                            </nav>
                        )}
                    </div>
                    {!isHome && role === "customer" && (
                        <div className="flex items-center">
                            <Link to="/cart" className="inline-flex items-center gap-2 bg-pure-white text-slate-dark px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                <span className="text-lg">🛒</span>
                                Cart
                            </Link>
                        </div>
                    )}
                </div>
            </header>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-12">
                {children}
            </main>
            <footer className="text-center py-6 text-slate-light font-medium">
                <span>© 2025 – SophiaTech Eats</span>
            </footer>
        </div>
    );
}

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
                <Route path="/" element={<RoleSelectionPage />} />
                <Route path="/restaurants" element={<CustomerRoute><RestaurantListPage /></CustomerRoute>} />
                <Route path="/restaurants/:name" element={<CustomerRoute><RestaurantDetailPage /></CustomerRoute>} />
                <Route path="/cart" element={<CustomerRoute><CartAndDeliveryPage /></CustomerRoute>} />
                <Route path="/payment" element={<CustomerRoute><PaymentAndConfirmationPage /></CustomerRoute>} />
                <Route path="/order/confirmation/:orderId" element={<CustomerRoute><PaymentAndConfirmationPage /></CustomerRoute>} />
                <Route path="/orders" element={<CustomerRoute><OrderHistory /></CustomerRoute>} />
                <Route path="/manager" element={<ManagerRoute><ManagerDashboardPage /></ManagerRoute>} />
            </Routes>
        </AppLayout>
    );
}
>>>>>>> 973a4b5ee0724c8af2a79148676bd95c2cbe45ed
