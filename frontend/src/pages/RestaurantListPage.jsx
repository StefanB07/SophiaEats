import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card.jsx";
import Badge from "../components/Badge.jsx";

const CATALOG_API_BASE = import.meta.env.VITE_CATALOG_API_BASE;

const restaurantImages = {
    "Restaurant A": "/images/restaurant-a.jpg",
    "Second Place": "/images/second-place.png",
    "Green Garden": "/images/green-garden.jpeg",
    "Burger Hub": "/images/burger-hub.png",
};

const OPENING_HOURS = {
    "Second Place": { open: 11, close: 22 },
    "Green Garden": { open: 10, close: 20 },
    "Restaurant A": { open: 11, close: 21 },
    "Burger Hub": { open: 12, close: 23 },
};

function isOpenNow(restaurant) {
    const hours = OPENING_HOURS[restaurant.name];
    if (!hours) return true;
    const now = new Date();
    const h = now.getHours();
    return h >= hours.open && h < hours.close;
}

function hasVegetarianOptions(restaurant) {
    if (restaurant.cuisineType && restaurant.cuisineType.toLowerCase().includes("vegetarian")) {
        return true;
    }
    if (restaurant.name && restaurant.name.toLowerCase().includes("green")) {
        return true;
    }
    return false;
}

export default function RestaurantListPage() {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchText, setSearchText] = useState("");
    const [showOnlyOpen, setShowOnlyOpen] = useState(false);
    const [showOnlyVegetarian, setShowOnlyVegetarian] = useState(false);

    useEffect(() => {
        async function loadRestaurants() {
            try {
                if (!CATALOG_API_BASE) {
                    throw new Error("VITE_CATALOG_API_BASE is not defined");
                }

                const response = await fetch(`${CATALOG_API_BASE}/restaurants`);
                if (!response.ok) {
                    throw new Error(`Backend responded with status ${response.status}`);
                }

                const data = await response.json();
                setRestaurants(data);
                setError("");
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        void loadRestaurants();
    }, []);

    if (loading) {
        return (
            <div className="py-8">
                <h2 className="text-3xl font-heading font-bold text-deep-sea-navy mb-2">Restaurants</h2>
                <p className="text-slate-light animate-pulse">Loading restaurants…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8">
                <h2 className="text-3xl font-heading font-bold text-deep-sea-navy mb-2">Restaurants</h2>
                <p className="text-crimson-alert font-medium bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">Could not load restaurants: {error}</p>
            </div>
        );
    }

    const filteredRestaurants = restaurants.filter((r) => {
        if (showOnlyOpen && !isOpenNow(r)) return false;
        if (showOnlyVegetarian && !hasVegetarianOptions(r)) return false;
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            const nameMatch = r.name && r.name.toLowerCase().includes(q);
            const cuisineMatch = r.cuisineType && r.cuisineType.toLowerCase().includes(q);
            if (!nameMatch && !cuisineMatch) return false;
        }
        return true;
    });

    return (
        <div className="py-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-4xl font-heading font-bold text-deep-sea-navy mb-3">Restaurants</h2>
                <p className="text-slate-light text-lg">
                    Choose a restaurant to browse its menu and place an order.
                </p>
            </div>

            <Card className="flex flex-col md:flex-row gap-6 items-center justify-between bg-pure-white/80 backdrop-blur-md shadow-lg border-none ring-1 ring-border-gray/50">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search by name or cuisine…"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border-2 border-border-gray bg-seabreeze-white text-slate-dark focus:border-ocean-blue focus:ring-0 outline-none transition-colors"
                    />
                </div>

                <div className="flex flex-wrap gap-6 items-center w-full md:w-auto">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={showOnlyOpen}
                                onChange={(e) => setShowOnlyOpen(e.target.checked)}
                                className="peer appearance-none w-6 h-6 border-2 border-border-gray rounded-md checked:bg-ocean-blue checked:border-ocean-blue transition-colors cursor-pointer"
                            />
                            <svg className="absolute w-4 h-4 text-pure-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="text-slate-dark font-medium group-hover:text-ocean-blue transition-colors">Open now</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={showOnlyVegetarian}
                                onChange={(e) => setShowOnlyVegetarian(e.target.checked)}
                                className="peer appearance-none w-6 h-6 border-2 border-border-gray rounded-md checked:bg-mint-green checked:border-mint-green transition-colors cursor-pointer"
                            />
                            <svg className="absolute w-4 h-4 text-pure-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="text-slate-dark font-medium group-hover:text-mint-green transition-colors">Vegetarian options</span>
                    </label>
                </div>
            </Card>

            {filteredRestaurants.length === 0 ? (
                <div className="text-center py-20 bg-pure-white rounded-3xl border-2 border-dashed border-border-gray shadow-sm">
                    <div className="text-4xl mb-4">🍽️</div>
                    <p className="text-xl text-slate-dark font-heading font-medium">No restaurants match your filters.</p>
                    <p className="text-slate-light mt-2">Try adjusting your search criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredRestaurants.map((r) => {
                        const imgSrc = restaurantImages[r.name] || "/images/restaurant-placeholder.jpg";
                        const open = isOpenNow(r);

                        return (
                            <Link key={r.name} to={`/restaurants/${encodeURIComponent(r.name)}`} className="group outline-none block h-full">
                                <Card className="h-full flex flex-col p-0 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-transparent hover:border-ocean-blue/30 group-focus:ring-4 ring-ocean-blue/20">
                                    <div className="relative h-56 overflow-hidden bg-seabreeze-white">
                                        <img
                                            src={imgSrc}
                                            alt={r.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/600x400/E2E8F0/475569?text=Restaurant';
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 z-10">
                                            {open ? (
                                                <Badge variant="success" className="shadow-md px-3 py-1.5 backdrop-blur-sm bg-mint-green/90">Open</Badge>
                                            ) : (
                                                <Badge variant="neutral" className="shadow-md px-3 py-1.5 backdrop-blur-sm bg-border-gray/90">Closed</Badge>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-6 flex flex-col flex-1 bg-pure-white relative z-20">
                                        <h3 className="text-2xl font-heading font-bold text-deep-sea-navy mb-3 group-hover:text-ocean-blue transition-colors line-clamp-1">{r.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {r.cuisineType && (
                                                <span className="px-3 py-1 bg-seabreeze-white text-slate-dark text-xs font-semibold rounded-lg border border-border-gray shadow-sm">
                                                    {r.cuisineType}
                                                </span>
                                            )}
                                            {r.priceRange && (
                                                <span className="px-3 py-1 bg-sandstone-gold/10 text-sandstone-gold text-xs font-bold rounded-lg border border-sandstone-gold/20 shadow-sm">
                                                    {r.priceRange}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-ocean-blue font-semibold text-sm border-t border-border-gray/50">
                                            <span className="flex items-center gap-2">View menu</span>
                                            <span className="group-hover:translate-x-2 transition-transform duration-300 bg-ocean-blue/10 p-1.5 rounded-full">→</span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
