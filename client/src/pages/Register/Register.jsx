import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
    deleteUser,
} from "firebase/auth";

import {
    doc,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";

import {
    Shield,
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

import { auth, db } from "../../services/firebase";

import "./Register.css";


function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };


    const validateForm = () => {
        const name = formData.name.trim();
        const email = formData.email.trim();

        if (!name) {
            setError("Full name is required.");
            return false;
        }

        if (name.length < 2) {
            setError("Name must contain at least 2 characters.");
            return false;
        }

        if (!email) {
            setError("Email address is required.");
            return false;
        }

        if (!email.includes("@")) {
            setError("Please enter a valid email address.");
            return false;
        }

        if (!formData.password) {
            setError("Password is required.");
            return false;
        }

        if (formData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
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
        setSuccess("");

        let firebaseUser = null;

        try {
            const email = formData.email.trim();
            const name = formData.name.trim();

            /*
             * STEP 1
             * Create Firebase Authentication account.
             */
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    formData.password
                );

            firebaseUser = userCredential.user;


            /*
             * STEP 2
             * Save display name in Firebase Authentication.
             */
            await updateProfile(firebaseUser, {
                displayName: name,
            });


            /*
             * STEP 3
             * Create Firestore profile.
             *
             * IMPORTANT:
             * Public registration can ONLY create
             * an analyst account.
             *
             * The browser never receives an option
             * to choose admin.
             */
            await setDoc(
                doc(db, "users", firebaseUser.uid),
                {
                    uid: firebaseUser.uid,
                    name: name,
                    email: firebaseUser.email,

                    role: "analyst",

                    status: "active",

                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                }
            );


            /*
             * STEP 4
             * Registration completed.
             *
             * Firebase automatically signs the new
             * account in, so sign it out and send the
             * user to Login.
             */
            await signOut(auth);

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            /*
             * If Auth account was created but the
             * Firestore profile failed, clean up
             * the incomplete Auth account.
             */
            if (firebaseUser) {

                try {

                    /*
                     * Only attempt delete if this user
                     * is still the current Firebase user.
                     */
                    if (auth.currentUser?.uid === firebaseUser.uid) {

                        await deleteUser(firebaseUser);

                        console.log(
                            "Incomplete Firebase Auth account removed."
                        );

                    } else {

                        console.warn(
                            "Firebase user is no longer current. " +
                            "The incomplete account may need manual cleanup."
                        );

                    }

                } catch (deleteError) {

                    console.error(
                        "Could not remove incomplete Auth account:",
                        deleteError
                    );

                    /*
                     * Make sure the browser is not left
                     * inside the incomplete account.
                     */
                    try {
                        await signOut(auth);
                    } catch (signOutError) {
                        console.error(
                            "Cleanup sign out failed:",
                            signOutError
                        );
                    }
                }
            }


            /*
             * Firebase Authentication errors
             * and Firestore errors.
             */
            switch (error.code) {

                case "auth/email-already-in-use":

                    setError(
                        "An account with this email already exists. Please sign in or use another email."
                    );

                    break;


                case "auth/invalid-email":

                    setError(
                        "Please enter a valid email address."
                    );

                    break;


                case "auth/weak-password":

                    setError(
                        "Password is too weak. Use at least 8 characters."
                    );

                    break;


                case "auth/network-request-failed":

                    setError(
                        "Network error. Please check your internet connection."
                    );

                    break;


                case "auth/operation-not-allowed":

                    setError(
                        "Email/password registration is disabled in Firebase Authentication."
                    );

                    break;


                case "permission-denied":
                    // falls through
                case "firestore/permission-denied":

                    setError(
                        "Registration was blocked by Firestore security rules."
                    );

                    break;


                default:

                    setError(
                        error.message ||
                        "Unable to create account. Please try again."
                    );
            }

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="register-page">

            <div className="register-background-grid"></div>


            <div className="register-container">


                {/* =========================
                    LEFT INFORMATION PANEL
                ========================== */}

                <section className="register-info">

                    <div className="register-brand">

                        <div className="register-brand-icon">
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


                    <div className="register-info-content">

                        <div className="system-status">

                            <span className="status-dot"></span>

                            Secure Registration

                        </div>


                        <h1>
                            Join the
                            <span>
                                {" "}security platform.
                            </span>
                        </h1>


                        <p>
                            Create your analyst account to monitor
                            security events, investigate threats and
                            analyze network activity.
                        </p>


                        <div className="registration-points">

                            <div className="registration-point">

                                <CheckCircle size={18} />

                                <span>
                                    Secure Firebase authentication
                                </span>

                            </div>


                            <div className="registration-point">

                                <CheckCircle size={18} />

                                <span>
                                    Personal analyst account
                                </span>

                            </div>


                            <div className="registration-point">

                                <CheckCircle size={18} />

                                <span>
                                    Protected security dashboard
                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="register-footer-text">

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


                {/* =========================
                    REGISTER FORM
                ========================== */}

                <section className="register-card-wrapper">

                    <div className="register-card">


                        {/* MOBILE BRAND */}

                        <div className="mobile-register-logo">

                            <div className="register-brand-icon">
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

                        <div className="register-heading">

                            <h1>
                                Create account
                            </h1>

                            <p>
                                Register as a security analyst.
                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (
                            <div className="register-error">

                                <AlertCircle size={18} />

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}


                        {/* SUCCESS */}

                        {success && (
                            <div className="register-success">

                                <CheckCircle size={18} />

                                <span>
                                    {success}
                                </span>

                            </div>
                        )}


                        <form onSubmit={handleSubmit}>


                            {/* NAME */}

                            <div className="register-input-group">

                                <label htmlFor="name">
                                    Full Name
                                </label>

                                <div className="register-input-wrapper">

                                    <User size={19} />

                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        disabled={loading}
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="register-input-group">

                                <label htmlFor="email">
                                    Email Address
                                </label>

                                <div className="register-input-wrapper">

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

                            <div className="register-input-group">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="register-input-wrapper">

                                    <Lock size={19} />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
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


                            {/* CONFIRM PASSWORD */}

                            <div className="register-input-group">

                                <label htmlFor="confirmPassword">
                                    Confirm Password
                                </label>

                                <div className="register-input-wrapper">

                                    <Lock size={19} />

                                    <input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        placeholder="Confirm your password"
                                        value={
                                            formData.confirmPassword
                                        }
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {showConfirmPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* REGISTER BUTTON */}

                            <button
                                type="submit"
                                className="register-submit"
                                disabled={loading}
                            >

                                {loading ? (
                                    <>
                                        <span className="register-spinner"></span>

                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create Account

                                        <ArrowRight size={19} />
                                    </>
                                )}

                            </button>

                        </form>


                        <div className="register-divider">

                            <span>
                                SECURE ACCESS
                            </span>

                        </div>


                        <div className="register-security-note">

                            <Shield size={16} />

                            <span>
                                New registrations are automatically
                                assigned the Analyst role. Administrator
                                accounts are created separately.
                            </span>

                        </div>


                        <div className="register-login">

                            <span>
                                Already have an account?
                            </span>

                            <Link to="/login">
                                Sign in
                            </Link>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}


export default Register;