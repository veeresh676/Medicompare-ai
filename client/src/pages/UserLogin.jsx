import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL as API_URL } from "../config";

function UserLogin() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));

        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!form.email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (!form.password) {
            setError("Please enter your password.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/user/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: form.email.trim(),
                        password: form.password
                    })
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Invalid email or password."
                );
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);
            }

            if (data.refreshToken) {
                localStorage.setItem(
                    "refreshToken",
                    data.refreshToken
                );
            }

            if (data.name) {
                localStorage.setItem("name", data.name);
            }

            if (data.email) {
                localStorage.setItem("email", data.email);
            } else {
                localStorage.setItem(
                    "email",
                    form.email.trim()
                );
            }

            if (data.role) {
                localStorage.setItem("role", data.role);
            }

            navigate("/hospitals", {
                replace: true
            });

        } catch (err) {
            console.error("User login failed:", err);

            setError(
                err.message ||
                "Unable to sign in. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }

    function handleForgotPassword() {
        navigate("/forgot-password");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 py-10">

            <div className="w-full max-w-[576px] rounded-[24px] border border-[#dfe3ea] bg-white px-12 py-16 shadow-sm">

                {/* HEADING */}

                <div className="text-center">

                    <h1 className="text-[44px] font-medium tracking-tight text-[#080808]">
                        Login
                    </h1>

                    <p className="mt-3 text-[21px] text-[#61708a]">
                        Please sign in to continue
                    </p>

                </div>


                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-16"
                >

                    {/* EMAIL */}

                    <div className="relative">

                        <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-[#687387]">

                            <svg
                                width="23"
                                height="23"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                            >
                                <rect
                                    x="3"
                                    y="5"
                                    width="18"
                                    height="14"
                                    rx="1"
                                />

                                <path d="M3 7l9 6 9-6" />
                            </svg>

                        </span>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email id"
                            autoComplete="email"
                            className="h-[72px] w-full rounded-full border border-[#d5dbe4] bg-white pl-[70px] pr-7 text-[20px] text-[#344054] outline-none transition placeholder:text-[#63718a] focus:border-[#5b5bf7] focus:ring-4 focus:ring-[#5b5bf7]/10"
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="relative mt-6">

                        <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-[#687387]">

                            <svg
                                width="23"
                                height="23"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <rect
                                    x="5"
                                    y="10"
                                    width="14"
                                    height="10"
                                    rx="1.5"
                                />

                                <path
                                    d="M8 10V7a4 4 0 018 0v3"
                                />

                            </svg>

                        </span>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Password"
                            autoComplete="current-password"
                            className="h-[72px] w-full rounded-full border border-[#d5dbe4] bg-white pl-[70px] pr-7 text-[20px] text-[#344054] outline-none transition placeholder:text-[#63718a] focus:border-[#5b5bf7] focus:ring-4 focus:ring-[#5b5bf7]/10"
                        />

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}


                    {/* FORGOT PASSWORD */}

                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="mt-9 text-left text-[20px] font-normal text-[#5151f5] transition hover:text-[#3838d8]"
                    >
                        Forgot password?
                    </button>


                    {/* LOGIN */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 h-[67px] w-full rounded-full bg-[#5b5bf6] text-[24px] font-normal text-white shadow-sm transition hover:bg-[#4c4ceb] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>


                    {/* REGISTER */}

                    <p className="mt-6 text-center text-[20px] text-[#61708a]">

                        Don't have an account?{" "}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/register")
                            }
                            className="text-[#5151f5] transition hover:text-[#3838d8]"
                        >
                            Sign up
                        </button>

                    </p>

                </form>

            </div>

        </div>
    );
}

export default UserLogin;