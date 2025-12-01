import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // NEW: role state (customer | manager)
    const [role, setRole] = useState(() => {
        try {
            return localStorage.getItem("currentRole") || null;
        } catch {
            return null;
        }
    });

    const apiBase = import.meta.env.VITE_CATALOG_API_BASE || "http://localhost:8080";

    // 1. Fetch users from backend once
    useEffect(() => {
        async function loadUsers() {
            try {
                const resp = await fetch(`${apiBase}/users`, {
                    headers: { Accept: "application/json" },
                });
                if (!resp.ok) throw new Error("HTTP " + resp.status);
                const data = await resp.json();
                setUsers(data);
            } catch (e) {
                console.error("Failed to load users, falling back to defaults", e);
                // fallback
                setUsers([
                    { id: "alice", name: "Alice" },
                    { id: "bob", name: "Bob" },
                ]);
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, [apiBase]);

    // 2. Initialize currentUser after users are loaded
    useEffect(() => {
        if (loading || users.length === 0) return;
        try {
            const saved = localStorage.getItem("currentUserId");
            const found = users.find((u) => u.id === saved);
            setCurrentUser(found ? found.id : users[0].id);
        } catch {
            setCurrentUser(users[0].id);
        }
    }, [loading, users]);

    // 3. Persist currentUser
    useEffect(() => {
        if (!currentUser) return;
        try {
            localStorage.setItem("currentUserId", currentUser);
        } catch {}
    }, [currentUser]);

    // NEW: persist role
    useEffect(() => {
        if (!role) return;
        try {
            localStorage.setItem("currentRole", role);
        } catch {}
    }, [role]);

    function setUserById(id) {
        if (!users.find((u) => u.id === id)) return;
        setCurrentUser(id);
    }

    return (
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser: setUserById,
                users, loading,
                role, setRole
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
}
