import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
    // seeded users (must match DataSeeder names)
    const seededUsers = [
        { name: "Alice", id: "alice" },
        { name: "Bob", id: "bob" }
    ];

    // default user id = "alice"s
    const [currentUser, setCurrentUser] = useState(seededUsers[0].id);

    function setUserById(userId) {
        const found = seededUsers.find(u => u.id === userId);
        if (!found) {
            // if unknown id, fallback to first user
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
