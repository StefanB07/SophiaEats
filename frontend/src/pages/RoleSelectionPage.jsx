import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import Button from "../components/Button.jsx";

const FOOD_EMOJIS = ["🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🥗", "🥪", "🌮", "🍣"];

export default function RoleSelectionPage() {
    const { role, setRole, currentUser, users, loading, setCurrentUser } = useUser();
    const navigate = useNavigate();

    const [selectedUserId, setSelectedUserId] = useState("");
    const [emojiIndex, setEmojiIndex] = useState(0);

    useEffect(() => {
        if (loading) return;
        if (!Array.isArray(users) || users.length === 0) return;
        const initial = currentUser || users[0].id;
        setSelectedUserId(initial);
    }, [loading, users, currentUser]);

    useEffect(() => {
        const interval = setInterval(() => {
            setEmojiIndex((prev) => (prev + 1) % FOOD_EMOJIS.length);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCustomerChange = (e) => {
        setSelectedUserId(e.target.value);
    };

    const handleCustomerContinue = () => {
        if (!selectedUserId) return;
        setCurrentUser(selectedUserId);
        setRole("customer");
        navigate("/restaurants");
    };

    const handleChooseManager = () => {
        setRole("manager");
        navigate("/manager");
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-fog-gray font-medium text-lg animate-pulse">Loading users...</p>
            </div>
        );
    }

    const hasUsers = Array.isArray(users) && users.length > 0;

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 py-12 px-4">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-starlight-white flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 leading-tight">
                    <span>Welcome to SophiaTech Eats</span>
                    <span 
                        key={emojiIndex} 
                        className="inline-block animate-bounce"
                        style={{ animationDuration: '1s' }}
                    >
                        {FOOD_EMOJIS[emojiIndex]}
                    </span>
                </h2>
                <p className="max-w-xl mx-auto text-fog-gray text-lg">
                    Choose how you want to use the application. You can browse restaurants and
                    place orders as a customer, or manage operations as a manager.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 items-stretch mt-8 w-full max-w-4xl justify-center">
                <div className="flex flex-col items-center gap-6 bg-deep-sea-surface p-8 rounded-2xl shadow-xl border border-luminescent-line flex-1 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-wave-crest-blue/50">
                    <div className="w-16 h-16 bg-midnight-navy border border-luminescent-line rounded-full flex items-center justify-center text-3xl mb-2 shadow-inner">
                        🍔
                    </div>
                    <span className="font-heading font-bold text-starlight-white text-2xl">Customer</span>

                    <div className="w-full flex flex-col justify-end flex-1 space-y-4 mt-auto pt-4">
                        <select
                            value={selectedUserId}
                            onChange={handleCustomerChange}
                            disabled={!hasUsers}
                            className={`appearance-none w-full px-4 pr-12 py-3 rounded-xl border-2 border-luminescent-line bg-midnight-navy text-starlight-white font-medium focus:border-wave-crest-blue focus:ring-0 outline-none transition-colors ${hasUsers ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F8FAFC' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 1.25rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em'
                            }}
                        >
                            {!hasUsers && <option value="">No users available</option>}
                            {hasUsers && users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleCustomerContinue}
                            disabled={!selectedUserId}
                            className="w-full py-3.5 px-6 bg-sunset-coral text-midnight-navy font-bold text-lg rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            Login as Customer
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 bg-deep-sea-surface p-8 rounded-2xl shadow-xl border border-luminescent-line flex-1 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-neon-gold/50">
                    <div className="w-16 h-16 bg-midnight-navy border border-luminescent-line rounded-full flex items-center justify-center text-3xl mb-2 shadow-inner">
                        📋
                    </div>
                    <span className="font-heading font-bold text-starlight-white text-2xl">Manager</span>

                    <div className="w-full flex flex-col justify-end flex-1 space-y-4 mt-auto pt-4">
                        <button
                            type="button"
                            onClick={handleChooseManager}
                            className="w-full py-3.5 px-6 bg-transparent border-2 border-neon-gold text-neon-gold font-bold text-lg rounded-xl shadow-md hover:bg-neon-gold/10 transition-all hover:-translate-y-0.5"
                        >
                            Login as Manager
                        </button>
                    </div>
                </div>
            </div>

            {role && (
                <p className="mt-8 text-sm text-fog-gray bg-deep-sea-surface px-5 py-2.5 rounded-full border border-luminescent-line shadow-sm">
                    Current role: <strong className="text-starlight-white capitalize ml-1">{role}</strong>
                </p>
            )}
        </div>
    );
}
