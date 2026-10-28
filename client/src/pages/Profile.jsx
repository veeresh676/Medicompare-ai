import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { API_BASE_URL as API_URL } from "../config";

function Profile() {

    const navigate = useNavigate();


    const [profile, setProfile] = useState({
        id: null,
        name: "",
        email: "",
        role: "",
        enabled: true
    });


    const [name, setName] = useState("");


    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);


    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    useEffect(() => {

        loadProfile();

    }, []);


    async function loadProfile() {

        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("userToken");


        if (!token) {

            navigate(
                "/login",
                {
                    replace: true
                }
            );

            return;
        }


        try {

            setLoading(true);
            setError("");


            const response =
                await fetch(
                    `${API_URL}/api/user/me`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearUserSession();

                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to load your profile."
                );
            }


            const user = {
                id: data.id,
                name: data.name || "",
                email: data.email || "",
                role: data.role || "USER",
                enabled:
                    data.enabled !== false
            };


            setProfile(user);
            setName(user.name);


            /*
             * Keep local session information
             * synchronized with the database.
             */
            localStorage.setItem(
                "name",
                user.name
            );

            localStorage.setItem(
                "email",
                user.email
            );

            localStorage.setItem(
                "role",
                user.role
            );


            /*
             * Also keep the older user-prefixed
             * keys synchronized if they exist.
             */
            localStorage.setItem(
                "userName",
                user.name
            );

            localStorage.setItem(
                "userEmail",
                user.email
            );

            localStorage.setItem(
                "userRole",
                user.role
            );


        } catch (err) {

            console.error(
                "Failed to load profile:",
                err
            );


            /*
             * If the backend request fails for a temporary
             * reason, use the authenticated session values
             * so the page does not become completely empty.
             */
            const cachedName =
                localStorage.getItem("name") ||
                localStorage.getItem("userName") ||
                "";

            const cachedEmail =
                localStorage.getItem("email") ||
                localStorage.getItem("userEmail") ||
                "";

            const cachedRole =
                localStorage.getItem("role") ||
                localStorage.getItem("userRole") ||
                "USER";


            if (
                cachedName ||
                cachedEmail
            ) {

                setProfile({
                    id: null,
                    name: cachedName,
                    email: cachedEmail,
                    role: cachedRole,
                    enabled: true
                });

                setName(cachedName);

                setError(
                    "We couldn't refresh your profile from the server. Showing your saved account information."
                );

            } else {

                setError(
                    err.message ||
                    "Unable to load your profile."
                );

            }

        } finally {

            setLoading(false);

        }
    }


    async function saveProfile(event) {

        event.preventDefault();


        setError("");
        setSuccess("");


        const trimmedName =
            name.trim();


        if (!trimmedName) {

            setError(
                "Name cannot be empty."
            );

            return;
        }


        if (trimmedName.length < 2) {

            setError(
                "Name must contain at least 2 characters."
            );

            return;
        }


        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("userToken");


        if (!token) {

            navigate(
                "/login",
                {
                    replace: true
                }
            );

            return;
        }


        try {

            setSaving(true);


            const response =
                await fetch(
                    `${API_URL}/api/user/me`,
                    {
                        method: "PUT",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: trimmedName
                        })
                    }
                );


            const data =
                await response
                    .json()
                    .catch(() => ({}));


            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearUserSession();

                navigate(
                    "/login",
                    {
                        replace: true
                    }
                );

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to save profile."
                );
            }


            const updatedProfile = {
                id: data.id,
                name: data.name || trimmedName,
                email:
                    data.email ||
                    profile.email,
                role:
                    data.role ||
                    profile.role ||
                    "USER",
                enabled:
                    data.enabled !== false
            };


            setProfile(
                updatedProfile
            );

            setName(
                updatedProfile.name
            );


            /*
             * Synchronize local storage after
             * successful database update.
             */
            localStorage.setItem(
                "name",
                updatedProfile.name
            );

            localStorage.setItem(
                "email",
                updatedProfile.email
            );

            localStorage.setItem(
                "role",
                updatedProfile.role
            );

            localStorage.setItem(
                "userName",
                updatedProfile.name
            );

            localStorage.setItem(
                "userEmail",
                updatedProfile.email
            );

            localStorage.setItem(
                "userRole",
                updatedProfile.role
            );


            setSuccess(
                "Your profile has been updated successfully."
            );


        } catch (err) {

            console.error(
                "Failed to update profile:",
                err
            );

            setError(
                err.message ||
                "Unable to save your profile."
            );

        } finally {

            setSaving(false);

        }
    }


    function clearUserSession() {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "name"
        );

        localStorage.removeItem(
            "email"
        );

        localStorage.removeItem(
            "role"
        );

        localStorage.removeItem(
            "userToken"
        );

        localStorage.removeItem(
            "userName"
        );

        localStorage.removeItem(
            "userEmail"
        );

        localStorage.removeItem(
            "userRole"
        );
    }


    function handleLogout() {

        clearUserSession();

        navigate(
            "/login",
            {
                replace: true
            }
        );
    }


    function getInitial() {

        const value =
            profile.name ||
            profile.email ||
            "U";

        return value
            .trim()
            .charAt(0)
            .toUpperCase();
    }


    function getRoleLabel() {

        if (
            profile.role?.toUpperCase() ===
            "ADMIN"
        ) {
            return "Administrator";
        }

        return "User";
    }


    if (loading) {

        return (
            <div className="min-h-screen bg-[#faf9f7] text-ink-900">

                <Navbar />

                <main className="mx-auto max-w-7xl px-6 py-10">

                    <div className="mb-8">

                        <div className="h-4 w-20 animate-pulse rounded bg-ink-100" />

                        <div className="mt-3 h-10 w-56 animate-pulse rounded bg-ink-100" />

                    </div>


                    <section className="rounded-3xl border border-ink-200 bg-white p-8 shadow-sm">

                        <div className="h-20 w-20 animate-pulse rounded-full bg-ink-100" />

                        <div className="mt-8 grid gap-6 md:grid-cols-2">

                            <div className="h-14 animate-pulse rounded-xl bg-ink-100" />

                            <div className="h-14 animate-pulse rounded-xl bg-ink-100" />

                            <div className="h-14 animate-pulse rounded-xl bg-ink-100" />

                            <div className="h-14 animate-pulse rounded-xl bg-ink-100" />

                        </div>

                    </section>

                </main>

            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#faf9f7] text-ink-900">

            <Navbar />


            <main className="mx-auto max-w-7xl px-6 py-10">


                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <section className="mb-8">

                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

                        <div>

                            <span className="text-sm font-semibold text-brand-600">
                                Account
                            </span>

                            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink-900">
                                My profile
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">
                                Manage your MediCompare account information.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 transition hover:border-ink-300 hover:bg-ink-50"
                        >
                            Log out
                        </button>

                    </div>

                </section>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (

                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
                        {error}
                    </div>

                )}


                {success && (

                    <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm leading-6 text-green-700">
                        {success}
                    </div>

                )}


                {/* =================================================
                    PROFILE CARD
                ================================================= */}

                <section className="rounded-3xl border border-ink-200 bg-white p-7 shadow-sm sm:p-9">


                    {/* PROFILE HEADER */}

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-ink-900 text-2xl font-bold text-white">
                            {getInitial()}
                        </div>


                        <div>

                            <h2 className="text-2xl font-bold tracking-tight text-ink-900">
                                {profile.name ||
                                    "Your account"}
                            </h2>

                            <p className="mt-1 text-sm text-ink-500">
                                {profile.email ||
                                    "Email unavailable"}
                            </p>


                            <div className="mt-3 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                                {getRoleLabel()}
                            </div>

                        </div>

                    </div>


                    {/* FORM */}

                    <form
                        onSubmit={saveProfile}
                        className="mt-10"
                    >

                        <div className="grid gap-6 md:grid-cols-2">


                            {/* NAME */}

                            <div>

                                <label
                                    htmlFor="profile-name"
                                    className="mb-2 block text-sm font-semibold text-ink-900"
                                >
                                    Name
                                </label>

                                <input
                                    id="profile-name"
                                    type="text"
                                    value={name}
                                    onChange={(event) =>
                                        setName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your name"
                                    className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                />

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label
                                    htmlFor="profile-email"
                                    className="mb-2 block text-sm font-semibold text-ink-900"
                                >
                                    Email
                                </label>

                                <input
                                    id="profile-email"
                                    type="email"
                                    value={
                                        profile.email
                                    }
                                    readOnly
                                    className="h-14 w-full cursor-not-allowed rounded-xl border border-ink-200 bg-ink-50 px-4 text-sm text-ink-600 outline-none"
                                />

                                <p className="mt-2 text-xs text-ink-400">
                                    Email is linked to your account
                                    and cannot be changed here.
                                </p>

                            </div>


                            {/* ROLE */}

                            <div>

                                <label
                                    htmlFor="profile-role"
                                    className="mb-2 block text-sm font-semibold text-ink-900"
                                >
                                    Account role
                                </label>

                                <input
                                    id="profile-role"
                                    type="text"
                                    value={
                                        getRoleLabel()
                                    }
                                    readOnly
                                    className="h-14 w-full cursor-not-allowed rounded-xl border border-ink-200 bg-ink-50 px-4 text-sm text-ink-600 outline-none"
                                />

                            </div>


                            {/* ACCOUNT STATUS */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-ink-900">
                                    Account status
                                </label>

                                <div className="flex h-14 items-center rounded-xl border border-ink-200 bg-ink-50 px-4">

                                    <span
                                        className={`mr-3 h-2.5 w-2.5 rounded-full ${
                                            profile.enabled
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                        }`}
                                    />

                                    <span className="text-sm font-semibold text-ink-700">
                                        {profile.enabled
                                            ? "Active"
                                            : "Disabled"}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* SAVE */}

                        <div className="mt-8 flex justify-end">

                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    !profile.enabled
                                }
                                className="rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save changes"}
                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================================
                    ACCOUNT INFORMATION
                ================================================= */}

                <section className="mt-6 grid gap-5 md:grid-cols-3">

                    <InfoCard
                        icon="👤"
                        title="Account"
                        value={
                            profile.role?.toUpperCase() ===
                            "ADMIN"
                                ? "Administrator account"
                                : "Standard user account"
                        }
                    />

                    <InfoCard
                        icon="📧"
                        title="Email"
                        value={
                            profile.email ||
                            "Not available"
                        }
                    />

                    <InfoCard
                        icon="🔐"
                        title="Security"
                        value="Protected by JWT authentication"
                    />

                </section>

            </main>

        </div>
    );
}


/* =====================================================
   INFO CARD
===================================================== */

function InfoCard({
    icon,
    title,
    value
}) {

    return (
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                    {icon}
                </div>

                <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                        {title}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-ink-800">
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}


export default Profile;