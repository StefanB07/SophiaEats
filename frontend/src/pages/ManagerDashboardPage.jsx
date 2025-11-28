import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";

const CATALOG_API_BASE =
    import.meta.env.VITE_CATALOG_API_BASE || "http://localhost:8080";

const CATEGORIES = ["STARTER", "MAIN_COURSE", "DESSERT", "DRINK"];

export default function ManagerDashboardPage() {
    const { currentUser } = useUser();

    const [restaurants, setRestaurants] = useState([]);
    const [loadingRestaurants, setLoadingRestaurants] = useState(true);
    const [restaurantsError, setRestaurantsError] = useState("");

    const [selectedRestaurant, setSelectedRestaurant] = useState("");
    const [menu, setMenu] = useState([]);
    const [loadingMenu, setLoadingMenu] = useState(false);
    const [menuError, setMenuError] = useState("");

    // form state (add / edit)
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("MAIN_COURSE");
    const [type, setType] = useState("");
    const [dietaryInfo, setDietaryInfo] = useState("");

    const [editingDishName, setEditingDishName] = useState(null);
    const [status, setStatus] = useState(null); // {type:"success"|"error", msg:string}
    const [submitting, setSubmitting] = useState(false);

    // 1) Load all restaurants on mount
    useEffect(() => {
        async function loadRestaurants() {
            setLoadingRestaurants(true);
            setRestaurantsError("");
            try {
                if (!CATALOG_API_BASE) {
                    throw new Error("VITE_CATALOG_API_BASE is not defined");
                }
                const resp = await fetch(`${CATALOG_API_BASE}/restaurants`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                setRestaurants(data);
                if (data.length > 0) {
                    setSelectedRestaurant(data[0].name);
                }
            } catch (e) {
                console.error("Failed to load restaurants for manager:", e);
                setRestaurantsError(
                    e instanceof Error ? e.message : "Unknown error loading restaurants"
                );
            } finally {
                setLoadingRestaurants(false);
            }
        }

        loadRestaurants();
    }, []);

    // Helper for loading menu
    async function loadMenuForRestaurant(restaurantName) {
        if (!restaurantName) return;
        try {
            setLoadingMenu(true);
            setMenuError("");
            const url = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                restaurantName
            )}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            const menuFromBackend = Array.isArray(data.menu) ? data.menu : [];
            setMenu(menuFromBackend);
        } catch (e) {
            console.error("Failed to load menu for manager:", e);
            setMenuError(
                e instanceof Error ? e.message : "Unknown error loading menu"
            );
            setMenu([]);
        } finally {
            setLoadingMenu(false);
        }
    }

    // 2) Load menu when selectedRestaurant changes
    useEffect(() => {
        if (!selectedRestaurant) return;
        setEditingDishName(null);
        resetForm();
        void loadMenuForRestaurant(selectedRestaurant);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRestaurant]);

    function resetForm() {
        setName("");
        setDescription("");
        setPrice("");
        setCategory("MAIN_COURSE");
        setType("");
        setDietaryInfo("");
        setEditingDishName(null);
        setStatus(null);
    }

    function startEdit(dish) {
        setEditingDishName(dish.name); // save the old name for PUT URL
        setName(dish.name || "");
        setDescription(dish.description || "");
        setPrice(dish.price != null ? String(dish.price) : "");
        setCategory(dish.category || "MAIN_COURSE");
        setType(dish.type || "");

        const infoFromTags =
            Array.isArray(dish.dietaryTags) && dish.dietaryTags.length > 0
                ? dish.dietaryTags.join(", ")
                : (dish.dietaryInfo || "");
        setDietaryInfo(infoFromTags);

        setStatus(null);
    }

    async function handleDelete(dishName) {
        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant first." });
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete dish "${dishName}" from "${selectedRestaurant}"?`
        );
        if (!confirmed) return;

        try {
            setSubmitting(true);
            setStatus(null);

            const baseUrl = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                selectedRestaurant
            )}/dishes/${encodeURIComponent(dishName)}`;

            const resp = await fetch(baseUrl, {
                method: "DELETE",
                headers: { Accept: "application/json" },
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            setStatus({
                type: "success",
                msg: `Dish "${dishName}" was deleted.`,
            });

            await loadMenuForRestaurant(selectedRestaurant);
            resetForm();
        } catch (e) {
            console.error("Failed to delete dish", e);
            setStatus({
                type: "error",
                msg: e instanceof Error ? e.message : "Could not delete dish.",
            });
        } finally {
            setSubmitting(false);
        }
    }


    async function handleSubmit(e) {
        e.preventDefault();
        setStatus(null);

        if (!selectedRestaurant) {
            setStatus({ type: "error", msg: "Please select a restaurant." });
            return;
        }
        if (!name.trim()) {
            setStatus({ type: "error", msg: "Dish name is required." });
            return;
        }
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum <= 0) {
            setStatus({ type: "error", msg: "Price must be a positive number." });
            return;
        }

        setSubmitting(true);
        try {
            const baseUrl = `${CATALOG_API_BASE}/restaurants/${encodeURIComponent(
                selectedRestaurant
            )}/dishes`;

            const payload = {
                name: name.trim(),
                description: description.trim(),
                price: priceNum,
                category,
                type: type.trim(),
                dietaryInfo: dietaryInfo.trim(),
            };

            let url = baseUrl;
            let method = "POST";

            // If we want to edit -> PUT /restaurants/{rest}/dishes/{old_name}
            if (editingDishName) {
                url = `${baseUrl}/${encodeURIComponent(editingDishName)}`;
                method = "PUT";
            }

            const resp = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Backend error (${resp.status}): ${text}`);
            }

            const result = await resp.json();
            console.log("Dish saved:", result);

            setStatus({
                type: "success",
                msg: editingDishName
                    ? `Dish "${editingDishName}" was updated.`
                    : `Dish "${result.name}" was added to ${selectedRestaurant}.`,
            });

            // Reîncarc meniul ca să văd modificările reale (inclusiv din DataSeeder)
            // Reload the menu to reflect changes
            await loadMenuForRestaurant(selectedRestaurant);

            // după succes, goliți formularul sau rămâneți în modul edit – alegem să îl resetăm
            resetForm();
        } catch (e) {
            console.error("Failed to save dish", e);
            setStatus({
                type: "error",
                msg: e instanceof Error ? e.message : "Could not save dish.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h2>Manager dashboard</h2>
            <p>
                Logged in as manager with user ID:{" "}
                <strong>{currentUser || "(none)"}</strong>
            </p>

            <p style={{ marginTop: "0.5rem" }}>
                From here you can manage restaurant dishes (requirement{" "}
                <strong>R2</strong>).
            </p>

            {/* Restaurant selector */}
            {loadingRestaurants && <p>Loading restaurants...</p>}
            {restaurantsError && (
                <p style={{ color: "red" }}>Error: {restaurantsError}</p>
            )}

            {!loadingRestaurants && !restaurantsError && restaurants.length === 0 && (
                <p>No restaurants available.</p>
            )}

            {!loadingRestaurants && restaurants.length > 0 && (
                <>
                    <div
                        style={{
                            marginTop: "1rem",
                            padding: "0.75rem 1rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                            backgroundColor: "#fafafa",
                        }}
                    >
                        <label>
                            Managing restaurant:{" "}
                            <select
                                value={selectedRestaurant}
                                onChange={(e) => setSelectedRestaurant(e.target.value)}
                                style={{ marginLeft: "0.5rem", minWidth: "200px" }}
                            >
                                {restaurants.map((r) => (
                                    <option key={r.name} value={r.name}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {/* Menu list */}
                    <section style={{ marginTop: "1.5rem" }}>
                        <h3>Current menu</h3>
                        {loadingMenu && <p>Loading menu...</p>}
                        {menuError && (
                            <p style={{ color: "red" }}>Error: {menuError}</p>
                        )}

                        {!loadingMenu && !menuError && menu.length === 0 && (
                            <p>No dishes defined yet for this restaurant.</p>
                        )}

                        {!loadingMenu && !menuError && menu.length > 0 && (
                            <div
                                style={{
                                    display: "grid",
                                    gap: "0.75rem",
                                    marginTop: "0.75rem",
                                }}
                            >
                                {menu.map((dish) => (
                                    <div
                                        key={dish.name}
                                        style={{
                                            border: "1px solid #ddd",
                                            borderRadius: "8px",
                                            padding: "0.75rem 1rem",
                                            backgroundColor: "#fff",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div>
                                                <strong>{dish.name}</strong>{" "}
                                                {dish.price != null && (
                                                    <span>– {dish.price} €</span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(dish)}
                                                    disabled={submitting}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(dish.name)}
                                                    disabled={submitting}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {dish.description && (
                                            <p style={{ marginTop: "0.35rem" }}>
                                                {dish.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Form add / edit */}
                    <section style={{ marginTop: "2rem" }}>
                        <h3>
                            {editingDishName
                                ? `Edit dish: ${editingDishName}`
                                : "Add a new dish"}
                        </h3>

                        <form
                            onSubmit={handleSubmit}
                            style={{
                                display: "grid",
                                gap: "0.75rem",
                                maxWidth: "520px",
                                padding: "1rem",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                backgroundColor: "#fafafa",
                            }}
                        >
                            <label>
                                Name*:
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{ width: "100%" }}
                                />
                            </label>

                            <label>
                                Description:
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    style={{ width: "100%" }}
                                />
                            </label>

                            <label>
                                Price (€)*:
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    style={{ width: "100%" }}
                                />
                            </label>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "1rem",
                                    flexWrap: "wrap",
                                }}
                            >
                                <label>
                                    Category:
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        style={{ marginLeft: "0.5rem" }}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label>
                                    Type:
                                    <input
                                        type="text"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        placeholder="Pasta, Pizza, Meat..."
                                        style={{ marginLeft: "0.5rem" }}
                                    />
                                </label>
                            </div>

                            <label>
                                Dietary / composition info:
                                <input
                                    type="text"
                                    value={dietaryInfo}
                                    onChange={(e) => setDietaryInfo(e.target.value)}
                                    placeholder="gluten-free, contains lactose..."
                                    style={{ width: "100%" }}
                                />
                            </label>

                            <div style={{ marginTop: "0.5rem" }}>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{ marginRight: "0.5rem" }}
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingDishName
                                            ? "Save changes"
                                            : "Add dish"}
                                </button>
                                {editingDishName && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        disabled={submitting}
                                    >
                                        Cancel edit
                                    </button>
                                )}
                            </div>

                            {status && (
                                <p
                                    style={{
                                        color:
                                            status.type === "error" ? "red" : "green",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    {status.msg}
                                </p>
                            )}

                            <p
                                style={{
                                    fontSize: "0.8rem",
                                    color: "#666",
                                    marginTop: "0.5rem",
                                }}
                            >
                                Existing dishes from the data seeder can be edited by
                                clicking &quot;Edit&quot; in the list above. Changes are
                                kept in memory for the current server session.
                            </p>
                        </form>
                    </section>
                </>
            )}
        </div>
    );
}
