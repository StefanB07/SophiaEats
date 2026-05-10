import { createContext, useContext, useEffect, useState } from "react";
import { handleApiError } from "../utils/apiUtils.js";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    const [role, setRole] = useState(() => {
        try {
            return localStorage.getItem("currentRole") || null;
        } catch {
            return null;
        }
    });

    const apiBase = import.meta.env.VITE_CATALOG_API_BASE || "http://localhost:8080";

    useEffect(() => {
        async function loadUsers() {
            try {
                const resp = await fetch(`${apiBase}/users`, {
                    headers: { Accept: "application/json" },
                });
                if (!resp.ok) await handleApiError(resp);
                const data = await resp.json();
                setUsers(data);
            } catch (e) {
                console.error("Failed to load users, falling back to defaults", e);
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

    useEffect(() => {
        if (!currentUser) return;
        try {
            localStorage.setItem("currentUserId", currentUser);
        } catch (err) {
            console.warn("Failed to persist currentUserId", err);
        }
    }, [currentUser]);

    useEffect(() => {
        if (!role) return;
        try {
            localStorage.setItem("currentRole", role);
        } catch (err) {
            console.warn("Failed to persist currentRole", err);
        }
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
                users,
                loading,
                role,
                setRole,
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
