import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

export default function Header() {
    const { role } = useUser();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isHome = location.pathname === "/";

    const isActive = (path) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="w-full bg-deep-sea-surface border-b border-luminescent-line sticky top-0 z-50">
            <div className={`w-full max-w-7xl mx-auto px-4 h-20 flex items-center ${isHome ? 'justify-center' : 'justify-between'}`}>
                <Link to="/" className="text-2xl font-heading font-bold text-starlight-white tracking-wide z-50 relative">
                    SophiaTech Eats
                </Link>

                {!isHome && role === "customer" && (
                    <button 
                        onClick={toggleMenu} 
                        className="md:hidden text-starlight-white p-2 z-50 relative focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                )}

                {!isHome && role === "manager" && (
                    <span className="px-2 py-0.5 text-xs md:text-base md:px-4 md:py-1.5 rounded-full font-medium bg-amber-warning/20 text-amber-warning border border-amber-warning/30 flex items-center gap-1.5 md:gap-2 ml-auto z-50 relative whitespace-nowrap">
                        <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-warning animate-pulse flex-shrink-0"></span>
                        Manager Mode
                    </span>
                )}

                {!isHome && (
                    <nav className="hidden md:flex items-center gap-4">
                        {role === "customer" && (
                            <>
                                <Link className={`px-4 py-2 rounded-full font-medium transition-all ${isActive("/restaurants") ? "bg-wave-crest-blue/20 text-wave-crest-blue" : "text-starlight-white/80 hover:bg-wave-crest-blue/10 hover:text-wave-crest-blue"}`} to="/restaurants">
                                    Restaurants
                                </Link>
                                <Link className={`px-4 py-2 rounded-full font-medium transition-all ${isActive("/orders") ? "bg-wave-crest-blue/20 text-wave-crest-blue" : "text-starlight-white/80 hover:bg-wave-crest-blue/10 hover:text-wave-crest-blue"}`} to="/orders">
                                    My Orders
                                </Link>
                                <Link to="/cart" className="ml-2 inline-flex items-center gap-2 bg-starlight-white text-midnight-navy px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                    <span className="text-lg">🛒</span>
                                    Cart
                                </Link>
                            </>
                        )}
                    </nav>
                )}

                {!isHome && role === "customer" && (
                    <div className={`md:hidden fixed inset-0 bg-midnight-navy/95 backdrop-blur-sm z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <nav className="flex flex-col items-center justify-center h-full gap-6 p-4">
                            <Link onClick={toggleMenu} className={`text-xl font-medium ${isActive("/restaurants") ? "text-wave-crest-blue" : "text-starlight-white"}`} to="/restaurants">
                                Restaurants
                            </Link>
                            <Link onClick={toggleMenu} className={`text-xl font-medium ${isActive("/orders") ? "text-wave-crest-blue" : "text-starlight-white"}`} to="/orders">
                                My Orders
                            </Link>
                            <Link onClick={toggleMenu} to="/cart" className="mt-4 inline-flex items-center gap-2 bg-starlight-white text-midnight-navy px-8 py-3 rounded-full font-bold shadow-lg">
                                <span className="text-xl">🛒</span>
                                 Cart
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
