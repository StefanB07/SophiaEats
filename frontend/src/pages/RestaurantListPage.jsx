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
                <h2 className="text-3xl font-heading font-bold text-starlight-white mb-2">Restaurants</h2>
                <p className="text-fog-gray animate-pulse">Loading restaurants…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-8">
                <h2 className="text-3xl font-heading font-bold text-starlight-white mb-2">Restaurants</h2>
                <p className="text-crimson-alert font-medium bg-deep-sea-surface p-4 rounded-lg border border-luminescent-line shadow-sm">Could not load restaurants: {error}</p>
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
                <h2 className="text-4xl font-heading font-bold text-starlight-white mb-3">Restaurants</h2>
                <p className="text-fog-gray text-lg">
                    Choose a restaurant to browse its menu and place an order.
                </p>
            </div>

            <Card className="flex flex-col md:flex-row gap-6 items-center justify-between bg-deep-sea-surface backdrop-blur-md shadow-lg border-none ring-1 ring-luminescent-line">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search by name or cuisine…"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border-2 border-luminescent-line bg-midnight-navy text-starlight-white focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors placeholder:text-fog-gray"
                    />
                </div>

                <div className="flex flex-wrap gap-6 items-center w-full md:w-auto">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={showOnlyOpen}
                                onChange={(e) => setShowOnlyOpen(e.target.checked)}
                                className="peer appearance-none w-6 h-6 border-2 border-luminescent-line bg-midnight-navy rounded-md checked:bg-wave-crest-blue checked:border-wave-crest-blue transition-colors cursor-pointer"
                            />
                            <svg className="absolute w-4 h-4 text-midnight-navy opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-starlight-white font-medium group-hover:text-wave-crest-blue transition-colors">Open now</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={showOnlyVegetarian}
                                onChange={(e) => setShowOnlyVegetarian(e.target.checked)}
                                className="peer appearance-none w-6 h-6 border-2 border-luminescent-line bg-midnight-navy rounded-md checked:bg-mint-glow checked:border-mint-glow transition-colors cursor-pointer"
                            />
                            <svg className="absolute w-4 h-4 text-midnight-navy opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-starlight-white font-medium group-hover:text-mint-glow transition-colors">Vegetarian options</span>
                    </label>
                </div>
            </Card>

            {filteredRestaurants.length === 0 ? (
                <div className="text-center py-20 bg-deep-sea-surface rounded-3xl border-2 border-dashed border-luminescent-line shadow-sm">
                    <div className="text-4xl mb-4">🍽️</div>
                    <p className="text-xl text-starlight-white font-heading font-medium">No restaurants match your filters.</p>
                    <p className="text-fog-gray mt-2">Try adjusting your search criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredRestaurants.map((r) => {
                        const imgSrc = restaurantImages[r.name] || "/images/restaurant-placeholder.jpg";
                        const open = isOpenNow(r);

                        return (
                            <Link key={r.name} to={`/restaurants/${encodeURIComponent(r.name)}`} className="group outline-none block h-full">
                                <Card className="h-full flex flex-col p-0 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-wave-crest-blue/50 group-focus:ring-4 ring-wave-crest-blue/20 bg-deep-sea-surface">
                                    <div className="relative h-56 overflow-hidden bg-midnight-navy">
                                        <img
                                            src={imgSrc}
                                            alt={r.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/600x400/0B132B/F8FAFC?text=Restaurant';
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 z-10">
                                            {open ? (
                                                <Badge className="shadow-md px-3 py-1.5 backdrop-blur-sm bg-mint-glow/90 text-midnight-navy font-bold border-none">Open</Badge>
                                            ) : (
                                                <Badge className="shadow-md px-3 py-1.5 backdrop-blur-sm bg-luminescent-line/90 text-starlight-white font-bold border-none">Closed</Badge>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-deep-sea-surface via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                    <div className="p-6 flex flex-col flex-1 relative z-20">
                                        <h3 className="text-2xl font-heading font-bold text-starlight-white mb-3 group-hover:text-wave-crest-blue transition-colors line-clamp-1">{r.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {r.cuisineType && (
                                                <span className="px-3 py-1 bg-midnight-navy text-starlight-white text-xs font-semibold rounded-lg border border-luminescent-line shadow-sm">
                                                    {r.cuisineType}
                                                </span>
                                            )}
                                            {r.priceRange && (
                                                <span className="px-3 py-1 bg-neon-gold/10 text-neon-gold text-xs font-bold rounded-lg border border-neon-gold/20 shadow-sm">
                                                    {r.priceRange}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-auto pt-4 flex items-center justify-between text-wave-crest-blue font-semibold text-sm border-t border-luminescent-line">
                                            <span className="flex items-center gap-2">View menu</span>
                                            <span className="group-hover:translate-x-2 transition-transform duration-300 bg-wave-crest-blue/10 p-1.5 rounded-full">→</span>
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
