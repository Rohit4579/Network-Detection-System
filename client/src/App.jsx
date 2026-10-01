import {
    Navigate,
    Outlet,
    Route,
    Routes,
} from "react-router-dom";

import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";

import Dashboard from "./pages/Dashboard/Dashboard";
import Events from "./pages/Events/Events";
import Alerts from "./pages/Alerts/Alerts";
import Users from "./pages/Users/Users";
import Operations from "./pages/Operations/Operations";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";


function AdminRoute() {

    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#0b1120",
                    color: "#ffffff",
                    fontSize: "18px",
                }}
            >
                Loading Security System...
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (user.role !== "admin") {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    return <Outlet />;
}


function App() {

    return (
        <Routes>

            {/* PUBLIC */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* PROTECTED */}

            <Route element={<ProtectedRoute />}>

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* KEEP EVENTS EXACTLY AS BEFORE */}

                <Route
                    path="/events"
                    element={
                        <Dashboard>
                            <Events />
                        </Dashboard>
                    }
                />

                {/* ALERTS */}

                <Route
                    path="/alerts"
                    element={
                        <Dashboard>
                            <Alerts />
                        </Dashboard>
                    }
                />

                {/* TEMPORARY */}

                <Route
                    path="/analytics"
                    element={
                        <Dashboard>
                            <Operations />
                        </Dashboard>
                    }
                />

                <Route
                    path="/logs"
                    element={
                        <Dashboard>
                            <Operations />
                        </Dashboard>
                    }
                />

            </Route>


            {/* ADMIN ONLY */}

            <Route element={<AdminRoute />}>

                <Route
                    path="/rules"
                    element={
                        <Dashboard>
                            <Operations />
                        </Dashboard>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <Dashboard>
                            <Users />
                        </Dashboard>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <Dashboard>
                            <Operations />
                        </Dashboard>
                    }
                />

            </Route>


            {/* DEFAULT */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>
    );
}


export default App;