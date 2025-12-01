import { useEffect, useState } from "react";

const DAYS = [
    { key: "MONDAY", label: "Monday" },
    { key: "TUESDAY", label: "Tuesday" },
    { key: "WEDNESDAY", label: "Wednesday" },
    { key: "THURSDAY", label: "Thursday" },
    { key: "FRIDAY", label: "Friday" },
    { key: "SATURDAY", label: "Saturday" },
    { key: "SUNDAY", label: "Sunday" },
];

function emptyDaySchedule() {
    return [];
}

export default function ManagerSchedulePanel({ restaurantName }) {
    // scheduleByRestaurant = { [restaurantName]: { [dayKey]: [slots] } }
    const [scheduleByRestaurant, setScheduleByRestaurant] = useState({});
    const [selectedDay, setSelectedDay] = useState("MONDAY");
    const [statusMessage, setStatusMessage] = useState("");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        setScheduleByRestaurant((prev) => {
            if (prev[restaurantName]) return prev;
            const empty = {};
            for (const d of DAYS) empty[d.key] = emptyDaySchedule();
            return { ...prev, [restaurantName]: empty };
        });
        setStatusMessage("");
    }, [restaurantName]);

    const currentRestaurantSchedule =
        scheduleByRestaurant[restaurantName] ||
        DAYS.reduce((acc, d) => ({ ...acc, [d.key]: emptyDaySchedule() }), {});
    const slotsForDay = currentRestaurantSchedule[selectedDay] || [];

    function updateDaySlots(dayKey, newSlots) {
        setScheduleByRestaurant((prev) => {
            const restSched =
                prev[restaurantName] ||
                DAYS.reduce(
                    (acc, d) => ({ ...acc, [d.key]: emptyDaySchedule() }),
                    {}
                );
            return {
                ...prev,
                [restaurantName]: {
                    ...restSched,
                    [dayKey]: newSlots,
                },
            };
        });
        setStatusMessage("");
    }

    function handleAddSlot() {
        const newSlot = {
            start: "11:00",
            end: "11:30",
            capacity: 0,
        };
        updateDaySlots(selectedDay, [...slotsForDay, newSlot]);
    }

    function handleSlotChange(index, field, value) {
        const updated = slotsForDay.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
        );
        updateDaySlots(selectedDay, updated);
    }

    function handleDeleteSlot(index) {
        const updated = slotsForDay.filter((_, i) => i !== index);
        updateDaySlots(selectedDay, updated);
    }

    function handleSaveSchedule() {
        const scheduleToSave = scheduleByRestaurant[restaurantName];

        console.log("Saving schedule for", restaurantName, scheduleToSave);
        setStatusMessage(
            "Schedule saved locally. TODO: send to backend (one request per restaurant)."
        );

        // TODO:
        //  - Transform scheduleToSave into the format expected by backend
        //  - POST/PUT it to something like:
        //    PUT /manager/restaurants/{id}/capacity-schedule
    }

    return (
        <div>
            <h3>Opening hours & capacity for {restaurantName}</h3>
            <p>
                Configure the maximum number of orders that can be accepted for each
                30-minute interval.
            </p>

            {/* Day selector */}
            <div style={{ margin: "1rem 0" }}>
                <label>
                    Day:{" "}
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                    >
                        {DAYS.map((d) => (
                            <option key={d.key} value={d.key}>
                                {d.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Slots for the selected day */}
            <div>
                <button type="button" onClick={handleAddSlot}>
                    + Add 30-min slot
                </button>
            </div>

            {slotsForDay.length === 0 ? (
                <p style={{ marginTop: "0.75rem" }}>
                    No slots defined yet for {DAYS.find((d) => d.key === selectedDay)?.label}.
                    Use &quot;Add 30-min slot&quot; to start.
                </p>
            ) : (
                <table
                    style={{
                        marginTop: "0.75rem",
                        borderCollapse: "collapse",
                        minWidth: "400px",
                    }}
                >
                    <thead>
                    <tr>
                        <th
                            style={{
                                borderBottom: "1px solid #ccc",
                                textAlign: "left",
                                padding: "0.25rem 0.5rem",
                            }}
                        >
                            Start
                        </th>
                        <th
                            style={{
                                borderBottom: "1px solid #ccc",
                                textAlign: "left",
                                padding: "0.25rem 0.5rem",
                            }}
                        >
                            End
                        </th>
                        <th
                            style={{
                                borderBottom: "1px solid #ccc",
                                textAlign: "left",
                                padding: "0.25rem 0.5rem",
                            }}
                        >
                            Capacity (orders)
                        </th>
                        <th
                            style={{
                                borderBottom: "1px solid #ccc",
                                padding: "0.25rem 0.5rem",
                            }}
                        >
                            Actions
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {slotsForDay.map((slot, idx) => (
                        <tr key={idx}>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                                <input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) =>
                                        handleSlotChange(idx, "start", e.target.value)
                                    }
                                />
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                                <input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) =>
                                        handleSlotChange(idx, "end", e.target.value)
                                    }
                                />
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                                <input
                                    type="number"
                                    min="0"
                                    value={slot.capacity}
                                    onChange={(e) =>
                                        handleSlotChange(
                                            idx,
                                            "capacity",
                                            Number(e.target.value)
                                        )
                                    }
                                    style={{ width: "80px" }}
                                />
                            </td>
                            <td style={{ padding: "0.25rem 0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteSlot(idx)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: "1rem" }}>
                <button type="button" onClick={handleSaveSchedule}>
                    Save schedule
                </button>
            </div>

            {statusMessage && (
                <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#555" }}>
                    {statusMessage}
                </p>
            )}

            <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#555" }}>
                <strong>Example (R5):</strong> Jeanne specifies:
                <ul>
                    <li>11:00–11:30 → capacity 5</li>
                    <li>11:30–12:00 → capacity 10</li>
                    <li>12:00–14:00 → capacity 30 orders per half hour</li>
                </ul>
                You can represent that by adding consecutive 30-min slots with the desired
                capacities.
            </div>
        </div>
    );
}
