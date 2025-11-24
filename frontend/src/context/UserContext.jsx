import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    // seeded users (must match DataSeeder names)
    const seededUsers = [
        { name: "Alice", id: "alice" },
        { name: "Bob", id: "bob" }
    ];

    // default user id = "alice" but hydrate from localStorage if present
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem("currentUserId");
            if (saved && seededUsers.find(u => u.id === saved)) return saved;
        } catch (e) { /* ignore */ }
        return seededUsers[0].id;
    });

    useEffect(() => {
        try { localStorage.setItem("currentUserId", currentUser); } catch (e) { /* ignore */ }
    }, [currentUser]);

    function setUserById(userId) {
        const found = seededUsers.find(u => u.id === userId);
        if (!found) {
            setCurrentUser(seededUsers[0].id);
            return;
        }
        setCurrentUser(found.id);
    }

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser: setUserById, seededUsers }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return ctx;
}
