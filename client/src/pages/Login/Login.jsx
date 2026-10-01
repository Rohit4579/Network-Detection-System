import { useState } from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    signInWithEmailAndPassword,
} from "firebase/auth";

import {
    Shield,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    Activity,
} from "lucide-react";

import { auth } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

import "./Login.css";


function Login() {

    const navigate = useNavigate();

    const {
        user,
        loading: authLoading,
    } = useAuth();


    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });


    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;


        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));


        if (error) {
            setError("");
        }
    };


    const validateForm = () => {

        const email =
            formData.email.trim();


        if (!email) {

            setError(
                "Email address is required."
            );

            return false;
        }


        if (!email.includes("@")) {

            setError(
                "Please enter a valid email address."
            );

            return false;
        }


        if (!formData.password) {

            setError(
                "Password is required."
            );

            return false;
        }


        return true;
    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!validateForm()) {
            return;
        }


        setLoading(true);

        setError("");


        try {

            await signInWithEmailAndPassword(
                auth,
                formData.email.trim(),
                formData.password
            );


            /*
             * AuthContext will load the Firestore
             * profile and ProtectedRoute will allow
             * access when the profile is valid.
             */
            navigate("/dashboard");

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            switch (error.code) {

                case "auth/invalid-credential":
                    // falls through
                case "auth/wrong-password":
                    // falls through
                case "auth/user-not-found":
                    // falls through
                case "auth/invalid-login-credentials":

                    setError(
                        "Invalid email or password."
                    );

                    break;


                case "auth/too-many-requests":

                    setError(
                        "Too many login attempts. Please try again later."
                    );

                    break;


                case "auth/network-request-failed":

                    setError(
                        "Network error. Please check your internet connection."
                    );

                    break;


                case "auth/user-disabled":

                    setError(
                        "This Firebase account has been disabled."
                    );

                    break;


                case "auth/operation-not-allowed":

                    setError(
                        "Email/password authentication is disabled."
                    );

                    break;


                default:

                    setError(
                        "Unable to sign in. Please try again."
                    );
            }

        } finally {

            setLoading(false);

        }
    };


    /*
     * Do not redirect while AuthContext is still
     * determining the current user.
     */
    if (authLoading) {

        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#070c16",
                    color: "#ffffff",
                    fontSize: "16px",
                }}
            >
                Loading Security System...
            </div>
        );
    }


    if (user) {

        navigate("/dashboard");

        return null;
    }


    return (

        <div className="login-page">

            <div className="login-background-grid"></div>


            <div className="login-container">


                {/* LEFT INFORMATION SECTION */}

                <section className="login-info">


                    <div className="login-brand">

                        <div className="login-brand-icon">

                            <Shield size={25} />

                        </div>


                        <div>

                            <h2>
                                Network Sentinel
                            </h2>

                            <span>
                                Intrusion Detection System
                            </span>

                        </div>

                    </div>


                    <div className="login-info-content">


                        <div className="system-status">

                            <span className="status-dot"></span>

                            Detection Engine Online

                        </div>


                        <h1>

                            Secure your

                            <span>
                                network infrastructure.
                            </span>

                        </h1>


                        <p>

                            Monitor security events, identify
                            suspicious activity, and analyze
                            network threats from one centralized
                            security dashboard.

                        </p>


                        <div className="security-features">


                            <div className="security-feature">

                                <div className="feature-icon">

                                    <Activity size={19} />

                                </div>


                                <div>

                                    <strong>
                                        Real-time Monitoring
                                    </strong>

                                    <span>
                                        Track incoming security events
                                    </span>

                                </div>

                            </div>


                            <div className="security-feature">

                                <div className="feature-icon">

                                    <Shield size={19} />

                                </div>


                                <div>

                                    <strong>
                                        Threat Detection
                                    </strong>

                                    <span>
                                        Detect suspicious network activity
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div className="login-footer-text">

                        <span>
                            Protected Security Environment
                        </span>

                        <span>
                            •
                        </span>

                        <span>
                            IDS v1.0
                        </span>

                    </div>

                </section>


                {/* LOGIN CARD */}

                <section className="login-card-wrapper">


                    <div className="login-card">


                        {/* MOBILE LOGO */}

                        <div className="mobile-login-logo">

                            <div className="login-brand-icon">

                                <Shield size={23} />

                            </div>


                            <div>

                                <h2>
                                    Network Sentinel
                                </h2>

                                <span>
                                    IDS Platform
                                </span>

                            </div>

                        </div>


                        {/* HEADING */}

                        <div className="login-heading">

                            <h1>
                                Welcome back
                            </h1>

                            <p>
                                Sign in to access the security
                                monitoring console.
                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (

                            <div className="login-error">

                                <AlertCircle size={18} />

                                <span>
                                    {error}
                                </span>

                            </div>

                        )}


                        {/* FORM */}

                        <form onSubmit={handleSubmit}>


                            {/* EMAIL */}

                            <div className="input-group">

                                <label htmlFor="email">
                                    Email Address
                                </label>


                                <div className="input-wrapper">

                                    <Mail size={19} />


                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="analyst@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        disabled={loading}
                                    />

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="input-group">


                                <div className="password-label-row">

                                    <label htmlFor="password">
                                        Password
                                    </label>


                                    <button
                                        type="button"
                                        className="forgot-password"
                                        onClick={() =>
                                            setError(
                                                "Password reset can be added with Firebase Password Reset."
                                            )
                                        }
                                    >
                                        Forgot password?
                                    </button>

                                </div>


                                <div className="input-wrapper">

                                    <Lock size={19} />


                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="current-password"
                                        disabled={loading}
                                    />


                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="login-submit"
                                disabled={loading}
                            >

                                {loading ? (

                                    <>

                                        <span className="login-spinner"></span>

                                        Authenticating...

                                    </>

                                ) : (

                                    <>

                                        Sign In

                                        <ArrowRight size={19} />

                                    </>

                                )}

                            </button>

                        </form>


                        {/* DIVIDER */}

                        <div className="login-divider">

                            <span>
                                SECURE ACCESS
                            </span>

                        </div>


                        {/* SECURITY MESSAGE */}

                        <div className="login-security-note">

                            <Shield size={16} />

                            <span>
                                Authentication is securely handled
                                by Firebase Authentication.
                            </span>

                        </div>


                        {/* REGISTER */}

                        <div className="login-register">

                            <span>
                                New analyst?
                            </span>

                            <Link to="/register">
                                Create account
                            </Link>

                        </div>


                        {/* ADMIN MESSAGE */}

                        <div className="login-admin-note">

                            <span className="admin-note-dot"></span>

                            <span>
                                Administrator accounts are
                                provisioned separately.
                            </span>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}


export default Login;