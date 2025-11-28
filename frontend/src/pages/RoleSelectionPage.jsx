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

    // după ce avem users, alegem implicit currentUser sau primul
    useEffect(() => {
        if (loading) return;
        if (!Array.isArray(users) || users.length === 0) return;

        const initial = currentUser || users[0].id;
        setSelectedUserId(initial);
    }, [loading, users, currentUser]);

    const handleCustomerChange = (e) => {
        const id = e.target.value;
        setSelectedUserId(id);
        if (!id) return;

        // setăm userul și rolul, apoi mergem la flow-ul de customer
        setCurrentUser(id);
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
