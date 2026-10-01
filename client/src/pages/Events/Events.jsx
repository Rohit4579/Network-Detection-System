import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Filter,
    Plus,
    RefreshCw,
    Search,
    ShieldAlert,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import {
    createSecurityEvent,
    subscribeToSecurityEvents,
} from "../../services/securityEvents";

import "./Events.css";


function Events() {
    const { user } = useAuth();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [severityFilter, setSeverityFilter] =
        useState("ALL");
    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [refreshKey, setRefreshKey] = useState(0);


    /* =========================================================
       FIRESTORE REAL-TIME LISTENER
    ========================================================= */

    useEffect(() => {
        const unsubscribe =
            subscribeToSecurityEvents(
                (data) => {
                    setEvents(data);
                    setLoading(false);
                },
                (listenerError) => {
                    console.error(
                        "Events listener error:",
                        listenerError
                    );

                    setError(
                        listenerError?.code === "permission-denied"
                            ? "Your account cannot read security events. Deploy the Firestore rules and sign in again."
                            : "Failed to load security events."
                    );

                    setLoading(false);
                }
            );

        return () => {
            unsubscribe();
        };
    }, [refreshKey]);


    /* =========================================================
       SUMMARY DATA
    ========================================================= */

    const totalEvents = events.length;

    const criticalEvents = events.filter(
        (event) =>
            event.severity === "CRITICAL"
    ).length;

    const highEvents = events.filter(
        (event) =>
            event.severity === "HIGH"
    ).length;

    const openEvents = events.filter(
        (event) =>
            event.status === "OPEN"
    ).length;


    /* =========================================================
       FILTER EVENTS
    ========================================================= */

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                !search ||
                event.sourceIp
                    ?.toLowerCase()
                    .includes(search) ||
                event.destinationIp
                    ?.toLowerCase()
                    .includes(search) ||
                event.eventType
                    ?.toLowerCase()
                    .includes(search) ||
                event.protocol
                    ?.toLowerCase()
                    .includes(search);


            const matchesSeverity =
                severityFilter === "ALL" ||
                event.severity ===
                    severityFilter;


            const matchesStatus =
                statusFilter === "ALL" ||
                event.status ===
                    statusFilter;


            return (
                matchesSearch &&
                matchesSeverity &&
                matchesStatus
            );
        });
    }, [
        events,
        searchTerm,
        severityFilter,
        statusFilter,
    ]);


    /* =========================================================
       GENERATE TEST EVENT
    ========================================================= */

    const handleGenerateEvent =
        async () => {

            if (!user?.uid) {
                setError(
                    "You must be logged in to create an event."
                );

                return;
            }

            setCreating(true);
            setError("");


            const testEvents = [
                {
                    sourceIp:
                        "192.168.1.25",

                    destinationIp:
                        "192.168.1.10",

                    eventType:
                        "PORT_SCAN",

                    protocol:
                        "TCP",

                    severity:
                        "HIGH",

                    status:
                        "OPEN",

                    description:
                        "Multiple connection attempts detected from a single source IP.",
                },

                {
                    sourceIp:
                        "10.0.0.45",

                    destinationIp:
                        "10.0.0.1",

                    eventType:
                        "SUSPICIOUS_TRAFFIC",

                    protocol:
                        "TCP",

                    severity:
                        "MEDIUM",

                    status:
                        "OPEN",

                    description:
                        "Unusual network traffic pattern detected.",
                },

                {
                    sourceIp:
                        "172.16.0.20",

                    destinationIp:
                        "172.16.0.5",

                    eventType:
                        "BRUTE_FORCE",

                    protocol:
                        "TCP",

                    severity:
                        "CRITICAL",

                    status:
                        "OPEN",

                    description:
                        "Repeated authentication attempts detected.",
                },
            ];


            const randomEvent =
                testEvents[
                    Math.floor(
                        Math.random() *
                            testEvents.length
                    )
                ];


            const result =
                await createSecurityEvent({
                    ...randomEvent,
                    source:
                        "Detection Engine",
                    createdBy:
                        user.uid,
                });


            if (!result.success) {
                setError(
                    "Failed to create test security event."
                );
            }


            setCreating(false);
        };


    /* =========================================================
       CLEAR FILTERS
    ========================================================= */

    const clearFilters = () => {
        setSearchTerm("");
        setSeverityFilter("ALL");
        setStatusFilter("ALL");
    };


    /* =========================================================
       REFRESH
    ========================================================= */

    const handleRefresh = () => {
        setRefreshKey(
            (previous) =>
                previous + 1
        );
    };


    /* =========================================================
       FORMAT TIME
    ========================================================= */

    const formatTime = (timestamp) => {
        if (!timestamp) {
            return "Just now";
        }

        try {
            return timestamp
                .toDate()
                .toLocaleString();
        } catch {
            return "Unknown";
        }
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="events-page">

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="events-summary">

                <div className="event-summary-card">

                    <div className="event-summary-icon blue">
                        <ShieldAlert
                            size={19}
                        />
                    </div>

                    <div>
                        <span>
                            TOTAL EVENTS
                        </span>

                        <strong>
                            {totalEvents}
                        </strong>
                    </div>

                </div>


                <div className="event-summary-card">

                    <div className="event-summary-icon red">
                        <AlertTriangle
                            size={19}
                        />
                    </div>

                    <div>
                        <span>
                            CRITICAL
                        </span>

                        <strong>
                            {criticalEvents}
                        </strong>
                    </div>

                </div>


                <div className="event-summary-card">

                    <div className="event-summary-icon orange">
                        <AlertTriangle
                            size={19}
                        />
                    </div>

                    <div>
                        <span>
                            HIGH SEVERITY
                        </span>

                        <strong>
                            {highEvents}
                        </strong>
                    </div>

                </div>


                <div className="event-summary-card">

                    <div className="event-summary-icon green">
                        <CheckCircle
                            size={19}
                        />
                    </div>

                    <div>
                        <span>
                            OPEN EVENTS
                        </span>

                        <strong>
                            {openEvents}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="events-toolbar">

                <div className="events-search">

                    <Search size={15} />

                    <input
                        type="text"
                        placeholder="Search IP, event type or protocol..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>


                <div className="events-filters">

                    <div className="filter-control">

                        <Filter size={14} />

                        <select
                            value={
                                severityFilter
                            }
                            onChange={(event) =>
                                setSeverityFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Severity
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                        </select>

                    </div>


                    <div className="filter-control">

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="OPEN">
                                Open
                            </option>

                            <option value="INVESTIGATING">
                                Investigating
                            </option>

                            <option value="RESOLVED">
                                Resolved
                            </option>

                        </select>

                    </div>


                    <button
                        className="clear-filter-button"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>


                    <button
                        className="event-refresh-button"
                        onClick={handleRefresh}
                        title="Refresh events"
                    >
                        <RefreshCw
                            size={15}
                        />
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="events-error">

                    <AlertTriangle
                        size={16}
                    />

                    {error}

                </div>
            )}


            {/* =================================================
                ACTION BAR
            ================================================= */}

            <div className="events-action-bar">

                <div>

                    <strong>
                        Detection Engine
                    </strong>

                    <span>
                        Generate a test network security
                        event to verify the monitoring pipeline.
                    </span>

                </div>


                <button
                    className="events-generate-button"
                    onClick={
                        handleGenerateEvent
                    }
                    disabled={creating}
                >

                    <Plus
                        size={15}
                    />

                    {creating
                        ? "Creating..."
                        : "Generate Test Event"}

                </button>

            </div>


            {/* =================================================
                EVENTS PANEL
            ================================================= */}

            <div className="events-page-panel">

                <div className="events-page-panel-header">

                    <div>

                        <h3>
                            Live Security Events
                        </h3>

                        <span>
                            Showing{" "}
                            {filteredEvents.length}{" "}
                            of{" "}
                            {events.length}{" "}
                            events
                        </span>

                    </div>


                    <div className="live-indicator">

                        <span></span>

                        Live

                    </div>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading ? (

                    <div className="events-loading">

                        <RefreshCw
                            size={25}
                            className="button-spinner"
                        />

                        <p>
                            Loading security events...
                        </p>

                    </div>

                ) : filteredEvents.length === 0 ? (

                    /* =================================================
                       EMPTY
                    ================================================= */

                    <div className="events-empty">

                        <ShieldAlert
                            size={36}
                        />

                        <strong>
                            No security events found
                        </strong>

                        <span>
                            Try changing your filters
                            or generate a test event.
                        </span>

                    </div>

                ) : (

                    /* =================================================
                       TABLE
                    ================================================= */

                    <div className="events-page-table-wrapper">

                        <table className="events-page-table">

                            <thead>

                                <tr>

                                    <th>
                                        TIME
                                    </th>

                                    <th>
                                        SOURCE IP
                                    </th>

                                    <th>
                                        DESTINATION IP
                                    </th>

                                    <th>
                                        EVENT
                                    </th>

                                    <th>
                                        PROTOCOL
                                    </th>

                                    <th>
                                        SEVERITY
                                    </th>

                                    <th>
                                        STATUS
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredEvents.map(
                                    (event) => {

                                        const severity =
                                            event.severity
                                                ?.toLowerCase() ||
                                            "low";

                                        const status =
                                            event.status
                                                ?.toLowerCase() ||
                                            "open";


                                        return (
                                            <tr
                                                key={
                                                    event.id
                                                }
                                            >

                                                <td>

                                                    <span className="events-time">

                                                        <Clock
                                                            size={13}
                                                        />

                                                        {formatTime(
                                                            event.createdAt
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="events-ip">
                                                        {
                                                            event.sourceIp ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span className="events-ip">
                                                        {
                                                            event.destinationIp ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <div className="event-name-cell">

                                                        <strong>
                                                            {
                                                                event.eventType ||
                                                                "UNKNOWN"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                event.description ||
                                                                "No description available."
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span className="events-protocol">
                                                        {
                                                            event.protocol ||
                                                            "Unknown"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`events-severity-badge ${severity}`}
                                                    >

                                                        {
                                                            event.severity ||
                                                            "LOW"
                                                        }

                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={`events-status-badge ${status}`}
                                                    >

                                                        {
                                                            event.status ||
                                                            "OPEN"
                                                        }

                                                    </span>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}


export default Events;