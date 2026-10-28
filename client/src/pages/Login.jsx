import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL as API_URL } from "../config";
import { fetchWithRetry, wakeBackend } from "../utils/fetchWithRetry";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const mountedRef = useRef(true);

    useEffect(() => {
        wakeBackend();
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    function clearOldSessions() {

        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminName");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminRole");

        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userRefreshToken");
        localStorage.removeItem("adminRefreshToken");
    }

    function storeSession(data, role) {

        const token = data.token;
        const name = data.name || "";
        const accountEmail = data.email || email.trim();

        clearOldSessions();

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("email", accountEmail);

        if (name) {
            localStorage.setItem("name", name);
        }

        if (data.refreshToken || data.refresh_token) {
            localStorage.setItem(
                "refreshToken",
                data.refreshToken || data.refresh_token
            );
        }

        if (role === "ADMIN") {
            localStorage.setItem("adminToken", token);
            localStorage.setItem("adminRole", "ADMIN");
            localStorage.setItem("adminEmail", accountEmail);

            if (name) {
                localStorage.setItem("adminName", name);
            }
        } else {
            localStorage.setItem("userToken", token);
            localStorage.setItem("userRole", "USER");
            localStorage.setItem("userEmail", accountEmail);

            if (name) {
                localStorage.setItem("userName", name);
            }
        }
    }

    async function handleSubmit(event) {

        event.preventDefault();

        setMessage("");
        setMessageType("");

        if (!email.trim()) {
            setMessage("Please enter your email address.");
            setMessageType("error");
            return;
        }

        if (!password) {
            setMessage("Please enter your password.");
            setMessageType("error");
            return;
        }

        // Single-flight guard: ignore double submits while a request is in flight.
        if (loading) return;

        let slowTimer = null;

        try {

            setLoading(true);
            setMessage(
                "Signing you in — this can take up to a minute if the server is waking up. Please wait..."
            );
            setMessageType("success");

            slowTimer = setTimeout(() => {
                if (mountedRef.current) {
                    setMessage(
                        "Still working — the server is taking longer than usual. Please keep waiting, do not press Sign in again..."
                    );
                    setMessageType("success");
                }
            }, 15000);

            // NOTE: retries: 0 on purpose (login is non-idempotent for UX:
            // a slow first attempt must not fire a confusing duplicate).
            const response = await fetchWithRetry(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                },
                { retries: 0, timeout: 90000 }
            );

            const data =
                await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    data.detail ||
                    "Invalid email or password."
                );
            }

            const token =
                data.token ||
                data.accessToken ||
                data.access_token;

            if (!token) {
                throw new Error(
                    "Login succeeded but no authentication token was returned."
                );
            }

            const role =
                (data.role || "USER").toUpperCase();

            storeSession({ ...data, token }, role);

            if (role === "ADMIN") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/hospitals", { replace: true });
            }

        } catch (error) {

            console.error("Login failed:", error);

            if (!mountedRef.current) return;

            const messageText = error?.message || "";
            const isNetworkError =
                error?.name === "TimeoutError" ||
                error?.name === "AbortError" ||
                messageText.includes("Failed to fetch") ||
                messageText.includes("timed out");

            if (isNetworkError) {
                setMessage(
                    "The request timed out (the free-tier server can take ~60s to wake). Please wait a few seconds and press Sign in once more."
                );
            } else {
                setMessage(
                    messageText ||
                        "Unable to sign in. Please try again."
                );
            }

            setMessageType("error");

        } finally {

            if (slowTimer) clearTimeout(slowTimer);
            if (mountedRef.current) setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-10">

            <div className="w-full max-w-[400px] rounded-2xl border border-ink-200 bg-white p-7 shadow-sm sm:p-8">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-base font-bold text-white">
                        M
                    </div>

                    <div>

                        <div className="text-base font-bold tracking-tight text-ink-900">
                            MediCompare
                        </div>

                        <div className="text-xs text-ink-400">
                            Healthcare comparison
                        </div>

                    </div>

                </div>

                <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink-900">
                    Welcome back
                </h1>

                <p className="mt-1 text-sm text-ink-500">
                    Sign in to your account to continue
                </p>

                <form onSubmit={handleSubmit} className="mt-6">

                    <div>

                        <label
                            htmlFor="login-email"
                            className="mb-1.5 block text-sm font-semibold text-ink-900"
                        >
                            Email address
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setMessage("");
                            }}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>

                    <div className="mt-4">

                        <div className="mb-1.5 flex items-center justify-between">

                            <label
                                htmlFor="login-password"
                                className="block text-sm font-semibold text-ink-900"
                            >
                                Password
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-xs font-semibold text-brand-600 transition hover:text-brand-700"
                            >
                                Forgot password?
                            </Link>

                        </div>

                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setMessage("");
                            }}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                        />

                    </div>

                    {message && (
                        <div
                            className={
                                messageType === "error"
                                    ? "mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700"
                                    : "mt-4 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-[13px] text-blue-700"
                            }
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-5 h-11 w-full rounded-xl bg-brand-500 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="mt-5 text-center text-sm text-ink-500">
                        New to MediCompare?{" "}

                        <Link
                            to="/register"
                            className="font-semibold text-brand-600 transition hover:text-brand-700"
                        >
                            Create account
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}

export default Login;
