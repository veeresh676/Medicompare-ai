import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL as API_URL } from "../config";
import { fetchWithRetry } from "../utils/fetchWithRetry";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
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

        if (!token) {
            setError("This reset link is invalid or missing a token.");
            return;
        }

        if (form.newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetchWithRetry(
                `${API_URL}/api/user/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token,
                        newPassword: form.newPassword
                    })
                },
                { retries: 2, timeout: 45000, retryDelay: 3000 }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to reset password. The link may have expired."
                );
            }

            setSuccess(true);

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 2000);

        } catch (err) {
            console.error("Password reset failed:", err);

            setError(
                err.message ||
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
                        Reset password
                    </h1>

                    <p className="mt-3 text-[18px] text-[#61708a]">
                        Enter a new password for your account.
                    </p>

                </div>

                {!token && (
                    <div className="mt-10 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-700">
                        This link is missing a reset token. Please request a new password reset.
                    </div>
                )}

                {success ? (

                    <div className="mt-10 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-center text-sm text-green-700">
                        Password reset successfully. Redirecting you to login...
                    </div>

                ) : (

                    token && (

                        <form
                            onSubmit={handleSubmit}
                            className="mt-10"
                        >
                            <input
                                type="password"
                                name="newPassword"
                                value={form.newPassword}
                                onChange={handleChange}
                                placeholder="New password"
                                autoComplete="new-password"
                                className="h-[64px] w-full rounded-full border border-[#d5dbe4] bg-white px-7 text-[18px] text-[#344054] outline-none transition placeholder:text-[#63718a] focus:border-[#5b5bf7] focus:ring-4 focus:ring-[#5b5bf7]/10"
                            />

                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                autoComplete="new-password"
                                className="mt-5 h-[64px] w-full rounded-full border border-[#d5dbe4] bg-white px-7 text-[18px] text-[#344054] outline-none transition placeholder:text-[#63718a] focus:border-[#5b5bf7] focus:ring-4 focus:ring-[#5b5bf7]/10"
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
                                {loading ? "Resetting..." : "Reset password"}
                            </button>
                        </form>

                    )

                )}

            </div>

        </div>
    );
}

export default ResetPassword;