<<<<<<< HEAD
// import { useNavigate } from "react-router-dom";
// import { useUser } from "../context/UserContext.jsx";
//
// export default function RoleSelectionPage() {
//     const { role, setRole, currentUser, users, loading, setCurrentUser } = useUser();
//     const navigate = useNavigate();
//
//     function ensureUserSelected() {
//         // if no user is selected, select the first one
//         if (!currentUser && Array.isArray(users) && users.length > 0) {
//             setCurrentUser(users[0].id);
//         }
//     }
//
//     const handleChooseCustomer = () => {
//         setRole("customer");
//         ensureUserSelected();
//         navigate("/restaurants");
//     };
//
//     const handleChooseManager = () => {
//         setRole("manager");
//         ensureUserSelected();
//         navigate("/manager");
//     };
//
//     if (loading) {
//         return (
//             <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 <p>Loading users...</p>
//             </div>
//         );
//     }
//
//     return (
//         <div
//             style={{
//                 minHeight: "60vh",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "1.5rem",
//             }}
//         >
//             <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Welcome to Sophia Tech Eats 👋</h2>
//             <p style={{ maxWidth: "480px", textAlign: "center" }}>
//                 Choose how you want to use the application. You can browse restaurants and place orders as a customer,
//                 or manage a restaurant&apos;s dishes and capacity as a manager.
//             </p>
//
//             <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
//                 <button
//                     onClick={handleChooseCustomer}
//                     style={{
//                         padding: "0.8rem 1.5rem",
//                         borderRadius: "999px",
//                         border: "1px solid #ccc",
//                         fontSize: "1rem",
//                         cursor: "pointer",
//                     }}
//                 >
//                     I am a customer 🏠
//                 </button>
//
//                 <button
//                     onClick={handleChooseManager}
//                     style={{
//                         padding: "0.8rem 1.5rem",
//                         borderRadius: "999px",
//                         border: "1px solid #ccc",
//                         fontSize: "1rem",
//                         cursor: "pointer",
//                     }}
//                 >
//                     I am a manager 🧑‍🍳
//                 </button>
//             </div>
//
//             {role && (
//                 <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
//                     Current role: <strong>{role}</strong>
//                 </p>
//             )}
//         </div>
//     );
// }


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

export default function RoleSelectionPage() {
    const { role, setRole, currentUser, users, loading, setCurrentUser } = useUser();
    const navigate = useNavigate();

    const [selectedUserId, setSelectedUserId] = useState("");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (loading) return;
        if (!Array.isArray(users) || users.length === 0) return;

        const initial = currentUser || users[0].id;
        setSelectedUserId(initial);
        // eslint-disable-next-line react-hooks/set-state-in-effect

    }, [loading, users, currentUser]);

    const handleCustomerChange = (e) => {
        const id = e.target.value;
        setSelectedUserId(id);
        // aici DOAR selectăm user-ul în dropdown
    };

    const handleCustomerContinue = () => {
        if (!selectedUserId) return;
        setCurrentUser(selectedUserId);
        setRole("customer");
        navigate("/restaurants");
    };


    const handleChooseManager = () => {
        // pentru simplificare: un singur manager, nu alegem user
        setRole("manager");
        navigate("/manager");
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <p>Loading users...</p>
            </div>
        );
    }

    const hasUsers = Array.isArray(users) && users.length > 0;

    return (
        <div
            style={{
                minHeight: "60vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.5rem",
            }}
        >
            <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                Welcome to Sophia Tech Eats 👋
            </h2>
            <p style={{ maxWidth: "480px", textAlign: "center" }}>
                Choose how you want to use the application. You can browse restaurants and
                place orders as a customer, or manage a restaurant&apos;s dishes and
                capacity as a manager.
            </p>

            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "1rem",
                    alignItems: "center",
                }}
            >
                {/* CUSTOMER = dropdown în loc de buton */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <span>Continue as customer:</span>
                    <select
                        value={selectedUserId}
                        onChange={handleCustomerChange}
                        disabled={!hasUsers}
                        style={{
                            padding: "0.8rem 1.5rem",
                            borderRadius: "999px",
                            border: "1px solid #ccc",
                            fontSize: "1rem",
                            cursor: hasUsers ? "pointer" : "not-allowed",
                            minWidth: "200px",
                            textAlign: "center",
                        }}
                    >
                        {!hasUsers && <option value="">No users available</option>}
                        {hasUsers &&
                            users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                    </select>

                    {/*   buton separat care chiar „pornește” aplicația ca și customer */}
                    <button
                        type="button"
                        onClick={handleCustomerContinue}
                        disabled={!selectedUserId}
                        style={{
                            padding: "0.6rem 1.5rem",
                            borderRadius: "999px",
                            border: "1px solid #2563eb",
                            backgroundColor: "#2563eb",
                            color: "white",
                            fontSize: "0.95rem",
                            cursor: selectedUserId ? "pointer" : "not-allowed",
                        }}
                    >
                        Continue as customer
                    </button>
                </div>


                {/* MANAGER = buton simplu */}
                <button
                    onClick={handleChooseManager}
                    style={{
                        padding: "0.8rem 1.5rem",
                        borderRadius: "999px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                        cursor: "pointer",
                    }}
                >
                    I am a manager 🧑‍🍳
                </button>
            </div>

            {role && (
                <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>
                    Current role: <strong>{role}</strong>
                </p>
            )}
        </div>
    );
}
=======
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import Button from "../components/Button.jsx";

export default function RoleSelectionPage() {
    const { role, setRole, currentUser, users, loading, setCurrentUser } = useUser();
    const navigate = useNavigate();

    const [selectedUserId, setSelectedUserId] = useState("");

    useEffect(() => {
        if (loading) return;
        if (!Array.isArray(users) || users.length === 0) return;
        const initial = currentUser || users[0].id;
        setSelectedUserId(initial);
    }, [loading, users, currentUser]);

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
                <p className="text-slate-light font-medium text-lg animate-pulse">Loading users...</p>
            </div>
        );
    }

    const hasUsers = Array.isArray(users) && users.length > 0;

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 py-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-deep-sea-navy">
                    Welcome to SophiaTech Eats <span className="inline-block animate-bounce">👋</span>
                </h2>
                <p className="max-w-xl mx-auto text-slate-light text-lg">
                    Choose how you want to use the application. You can browse restaurants and
                    place orders as a customer, or manage operations as a manager.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 items-center mt-8 w-full max-w-4xl justify-center">
                <div className="flex flex-col items-center gap-6 bg-pure-white p-8 rounded-2xl shadow-xl border border-border-gray w-full sm:w-96 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-ocean-blue/30">
                    <div className="w-16 h-16 bg-ocean-blue/10 text-ocean-blue rounded-full flex items-center justify-center text-3xl mb-2">
                        🏠
                    </div>
                    <span className="font-heading font-bold text-slate-dark text-2xl">Customer</span>
                    
                    <div className="w-full space-y-3">
                        <select
                            value={selectedUserId}
                            onChange={handleCustomerChange}
                            disabled={!hasUsers}
                            className={`w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-seabreeze-white text-slate-dark font-medium focus:border-ocean-blue focus:ring-0 outline-none transition-colors ${hasUsers ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                        >
                            {!hasUsers && <option value="">No users available</option>}
                            {hasUsers && users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        <Button
                            type="button"
                            onClick={handleCustomerContinue}
                            disabled={!selectedUserId}
                            variant="primary"
                            className="w-full py-3 text-lg shadow-md hover:shadow-lg"
                        >
                            Login as Customer
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 bg-pure-white p-8 rounded-2xl shadow-xl border border-border-gray w-full sm:w-96 transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-ocean-blue/30">
                    <div className="w-16 h-16 bg-ocean-blue/10 text-ocean-blue rounded-full flex items-center justify-center text-3xl mb-2">
                        🧑‍🍳
                    </div>
                    <span className="font-heading font-bold text-slate-dark text-2xl">Manager</span>
                    
                    <div className="w-full h-full flex flex-col justify-end space-y-3 mt-auto pt-6">
                        <Button
                            onClick={handleChooseManager}
                            variant="outline"
                            className="w-full py-3 text-lg border-2"
                        >
                            Login as Manager
                        </Button>
                    </div>
                </div>
            </div>

            {role && (
                <p className="mt-8 text-sm text-slate-light bg-border-gray/50 px-5 py-2.5 rounded-full border border-border-gray">
                    Current role: <strong className="text-slate-dark capitalize ml-1">{role}</strong>
                </p>
            )}
        </div>
    );
}
>>>>>>> 973a4b5ee0724c8af2a79148676bd95c2cbe45ed
