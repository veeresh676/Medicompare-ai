import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL as API_URL } from "../config";
import { fetchWithRetry } from "../utils/fetchWithRetry";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);

            await fetchWithRetry(
                `${API_URL}/api/user/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim()
                    })
                },
                { retries: 2, timeout: 45000, retryDelay: 3000 }
            );

            /*
             * Always show success, regardless of whether the
             * email exists, to avoid leaking account information.
             */
            setSubmitted(true);

        } catch (err) {
            console.error("Forgot password request failed:", err);

            setError(
                "Something went wrong. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6 py-10">

            <div className="w-full max-w-[576px] rounded-[24px] border border-[#dfe3ea] bg-white px-12 py-16 shadow-sm">

                <div className="text-center">

                    <h1 className="text-[36px] font-medium tracking-tight text-[#080808]">
                        Forgot password
                    </h1>

                    <p className="mt-3 text-[18px] text-[#61708a]">
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                </div>

                {submitted ? (

                    <div className="mt-10 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center text-sm text-green-700">
                        If an account exists for that email, a reset link has been sent. Check your inbox.
                    </div>

                ) : (

                    <form
                        onSubmit={handleSubmit}
                        className="mt-10"
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setError("");
                            }}
                            placeholder="Email id"
                            autoComplete="email"
                            className="h-[64px] w-full rounded-full border border-[#d5dbe4] bg-white px-7 text-[18px] text-[#344054] outline-none transition placeholder:text-[#63718a] focus:border-[#5b5bf7] focus:ring-4 focus:ring-[#5b5bf7]/10"
                        />

                        {error && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 h-[60px] w-full rounded-full bg-[#5b5bf6] text-[20px] font-normal text-white shadow-sm transition hover:bg-[#4c4ceb] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </form>

                )}

                <p className="mt-8 text-center text-[18px] text-[#61708a]">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-[#5151f5] transition hover:text-[#3838d8]"
                    >
                        ← Back to login
                    </button>
                </p>

            </div>

        </div>
    );
}

export default ForgotPassword;