import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
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
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;