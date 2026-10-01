/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

import {
    doc,
    getDoc,
} from "firebase/firestore";

import {
    auth,
    db,
} from "../services/firebase";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            async (firebaseUser) => {

                console.log(
                    "AUTH USER:",
                    firebaseUser
                );


                /*
                 * No Firebase Authentication user
                 */
                if (!firebaseUser) {

                    console.log(
                        "No Firebase user."
                    );

                    setUser(null);

                    setLoading(false);

                    return;
                }


                try {

                    /*
                     * Firebase Authentication information
                     */
                    console.log(
                        "Firebase UID:",
                        firebaseUser.uid
                    );

                    console.log(
                        "Firebase Email:",
                        firebaseUser.email
                    );


                    /*
                     * Firestore user document
                     *
                     * users/{firebaseUser.uid}
                     */
                    const userRef = doc(
                        db,
                        "users",
                        firebaseUser.uid
                    );


                    console.log(
                        "Firestore path:",
                        `users/${firebaseUser.uid}`
                    );


                    /*
                     * Get user profile
                     */
                    const userSnapshot =
                        await getDoc(userRef);


                    console.log(
                        "Firestore document exists:",
                        userSnapshot.exists()
                    );


                    /*
                     * Firestore profile doesn't exist
                     */
                    if (!userSnapshot.exists()) {

                        console.error(
                            "NO FIRESTORE PROFILE FOUND"
                        );

                        console.error(
                            "Expected document:",
                            `users/${firebaseUser.uid}`
                        );

                        setUser(null);

                        setLoading(false);

                        return;
                    }


                    /*
                     * Get complete Firestore profile
                     */
                    const profile =
                        userSnapshot.data();


                    /*
                     * DETAILED DEBUGGING
                     */
                    console.log(
                        "========== PROFILE DEBUG =========="
                    );

                    console.log(
                        "Firebase UID:",
                        firebaseUser.uid
                    );

                    console.log(
                        "Firestore document ID:",
                        userSnapshot.id
                    );

                    console.log(
                        "Complete Firestore data:",
                        profile
                    );

                    console.log(
                        "Profile UID:",
                        profile.uid
                    );

                    console.log(
                        "Profile Email:",
                        profile.email
                    );

                    console.log(
                        "Profile Name:",
                        profile.name
                    );

                    console.log(
                        "Profile Role:",
                        profile.role
                    );

                    console.log(
                        "Profile Status:",
                        profile.status
                    );

                    console.log(
                        "==================================="
                    );


                    /*
                     * Verify Firestore UID
                     */
                    if (
                        profile.uid &&
                        profile.uid !== firebaseUser.uid
                    ) {

                        console.error(
                            "UID MISMATCH"
                        );

                        console.error(
                            "Firebase UID:",
                            firebaseUser.uid
                        );

                        console.error(
                            "Firestore UID:",
                            profile.uid
                        );

                        setUser(null);

                        setLoading(false);

                        return;
                    }


                    /*
                     * Check account status
                     *
                     * IMPORTANT:
                     * We are NOT signing out here while
                     * debugging the profile problem.
                     */
                    if (
                        profile.status !== "active"
                    ) {

                        console.error(
                            "USER PROFILE DOES NOT HAVE ACTIVE STATUS"
                        );

                        console.error(
                            "Actual status:",
                            profile.status
                        );

                        console.error(
                            "Complete profile:",
                            profile
                        );

                        setUser(null);

                        setLoading(false);

                        return;
                    }


                    /*
                     * Everything is correct.
                     *
                     * Create application user.
                     */
                    const applicationUser = {

                        uid:
                            firebaseUser.uid,

                        email:
                            firebaseUser.email,

                        displayName:
                            firebaseUser.displayName ||
                            profile.name ||
                            "",

                        ...profile,
                    };


                    console.log(
                        "AUTHENTICATED USER:",
                        applicationUser
                    );


                    /*
                     * Save authenticated user
                     */
                    setUser(
                        applicationUser
                    );


                } catch (error) {

                    console.error(
                        "FAILED TO LOAD USER PROFILE:",
                        error
                    );

                    setUser(null);

                } finally {

                    setLoading(false);

                }
            }
        );


        /*
         * Cleanup listener
         */
        return () => unsubscribe();

    }, []);


    /*
     * Logout
     */
    const logout = async () => {

        try {

            await signOut(auth);

            setUser(null);

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        }
    };


    /*
     * Authentication information
     */
    const value = {

        user,

        loading,

        logout,

        isAdmin:
            user?.role === "admin",

        isAnalyst:
            user?.role === "analyst",

    };


    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );
}


/*
 * useAuth hook
 */
export function useAuth() {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }


    return context;
}