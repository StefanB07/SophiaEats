<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> origin/db_mare_fail
import { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";

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
    const [scheduleByRestaurant, setScheduleByRestaurant] = useState({});
    const [selectedDay, setSelectedDay] = useState("MONDAY");
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        setScheduleByRestaurant((prev) => {
            if (prev[restaurantName]) return prev;
            const empty = {};
            for (const d of DAYS) empty[d.key] = emptyDaySchedule();
            return { ...prev, [restaurantName]: empty };
        });
        setStatusMessage("");
    }, [restaurantName]);

    const currentRestaurantSchedule = scheduleByRestaurant[restaurantName] || DAYS.reduce((acc, d) => ({ ...acc, [d.key]: emptyDaySchedule() }), {});
    const slotsForDay = currentRestaurantSchedule[selectedDay] || [];

    function updateDaySlots(dayKey, newSlots) {
        setScheduleByRestaurant((prev) => {
            const restSched = prev[restaurantName] || DAYS.reduce((acc, d) => ({ ...acc, [d.key]: emptyDaySchedule() }), {});
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
        const newSlot = { start: "11:00", end: "11:30", capacity: 0 };
        updateDaySlots(selectedDay, [...slotsForDay, newSlot]);
    }

    function handleSlotChange(index, field, value) {
        const updated = slotsForDay.map((slot, i) => i === index ? { ...slot, [field]: value } : slot);
        updateDaySlots(selectedDay, updated);
    }

    function handleDeleteSlot(index) {
        const updated = slotsForDay.filter((_, i) => i !== index);
        updateDaySlots(selectedDay, updated);
    }

    function handleSaveSchedule() {
        console.log("Saving schedule for", restaurantName, scheduleByRestaurant[restaurantName]);
        setStatusMessage("Schedule saved locally. Sync with backend later.");
    }

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-heading font-bold text-deep-sea-navy border-b border-border-gray pb-2">Opening hours & capacity for {restaurantName}</h3>
            <p className="text-slate-light">Configure the maximum number of orders that can be accepted for each 30-minute interval.</p>

            <Card className="bg-ocean-blue/5 border-none shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="font-semibold text-slate-dark uppercase tracking-wide text-sm">Select Day:</label>
                <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors">
                    {DAYS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
                <Button onClick={handleAddSlot} variant="primary" className="sm:ml-auto">
                    + Add 30-min slot
                </Button>
            </Card>

            <Card className="border-border-gray/50 shadow-md">
                <div className="flex items-center justify-between mb-4 border-b border-border-gray pb-4">
                    <h4 className="text-xl font-heading font-bold text-slate-dark">Schedule for {DAYS.find((d) => d.key === selectedDay)?.label}</h4>
                </div>
                
                {slotsForDay.length === 0 ? (
                    <div className="text-center py-12 border-dashed border-2 rounded-xl">
                        <p className="text-slate-light font-medium">No slots defined yet for {DAYS.find((d) => d.key === selectedDay)?.label}.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-border-gray/50 rounded-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-seabreeze-white border-b border-border-gray/50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-dark uppercase tracking-wider">Start Time</th>
                                    <th className="px-4 py-3 font-semibold text-slate-dark uppercase tracking-wider">End Time</th>
                                    <th className="px-4 py-3 font-semibold text-slate-dark uppercase tracking-wider">Capacity</th>
                                    <th className="px-4 py-3 font-semibold text-slate-dark uppercase tracking-wider w-20">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slotsForDay.map((slot, idx) => (
                                    <tr key={idx} className="border-b border-border-gray/20 last:border-0 hover:bg-seabreeze-white/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <input type="time" value={slot.start} onChange={(e) => handleSlotChange(idx, "start", e.target.value)} className="px-3 py-1.5 rounded-lg border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input type="time" value={slot.end} onChange={(e) => handleSlotChange(idx, "end", e.target.value)} className="px-3 py-1.5 rounded-lg border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input type="number" min="0" value={slot.capacity} onChange={(e) => handleSlotChange(idx, "capacity", Number(e.target.value))} className="w-24 px-3 py-1.5 rounded-lg border border-border-gray bg-pure-white text-slate-dark focus:border-ocean-blue outline-none transition-colors" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <button type="button" onClick={() => handleDeleteSlot(idx)} className="text-crimson-alert hover:text-red-700 bg-crimson-alert/10 px-2 py-1.5 rounded transition-colors text-xs font-bold uppercase tracking-wider">Del</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                    <Button onClick={handleSaveSchedule} variant="primary" className="w-full sm:w-auto">
                        Save Schedule
                    </Button>
                    {statusMessage && <span className="text-mint-green font-medium text-sm">{statusMessage}</span>}
                </div>
            </Card>

            <div className="bg-sandstone-gold/10 border border-sandstone-gold/20 p-4 rounded-xl text-sm text-slate-dark">
                <strong className="text-sandstone-gold font-bold uppercase tracking-wide">Example Info:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-light">
                    <li>11:00–11:30 → capacity 5</li>
                    <li>11:30–12:00 → capacity 10</li>
                    <li>12:00–14:00 → capacity 30 orders per half hour</li>
                </ul>
            </div>
        </div>
    );
}
<<<<<<< HEAD
>>>>>>> 973a4b5ee0724c8af2a79148676bd95c2cbe45ed
=======
>>>>>>> origin/db_mare_fail
