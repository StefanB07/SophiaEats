import { Routes, Route, Navigate } from "react-router-dom";
import RestaurantListPage from "./pages/RestaurantListPage.jsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.jsx";
import CartAndDeliveryPage from "./pages/CartAndDeliveryPage.jsx";
import PaymentAndConfirmationPage from "./pages/PaymentAndConfirmationPage.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import RoleSelectionPage from "./pages/RoleSelectionPage.jsx";
import ManagerDashboardPage from "./pages/ManagerDashboardPage.jsx";
import { useUser } from "./context/UserContext.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-midnight-navy bg-waves text-starlight-white font-sans flex flex-col">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
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
