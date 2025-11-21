import { Routes, Route, Link } from "react-router-dom";
import RestaurantListPage from "./pages/RestaurantListPage.jsx";
import RestaurantDetailPage from "./pages/RestaurantDetailPage.jsx";
import CartAndDeliveryPage from "./pages/CartAndDeliveryPage.jsx";
import PaymentAndConfirmationPage from "./pages/PaymentAndConfirmationPage.jsx";

function AppLayout({ children }) {
    return (
        <div className="app">
            <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
                <h1>Food Ordering App</h1>
                <nav style={{ marginTop: "0.5rem" }}>
                    <Link to="/" style={{ marginRight: "1rem" }}>
                        Home
                    </Link>
                    <Link to="/cart">Cart</Link>
                </nav>
                {/* aici vom pune user selector + health indicator mai târziu */}
            </header>

            <main style={{ padding: "1rem" }}>{children}</main>

            <footer
                style={{
                    padding: "1rem",
                    borderTop: "1px solid #ddd",
                    marginTop: "2rem",
                }}
            >
                <small>© 2025 – Student project</small>
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


// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
//
// function App() {
//   const [count, setCount] = useState(0)
//
//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }
//
// export default App

