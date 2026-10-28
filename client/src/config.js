/*
 * Centralized backend URL resolution.
 *
 * Priority:
 * 1. VITE_API_URL env (set in Vercel dashboard for production)
 * 2. localhost default when running locally
 * 3. Render production backend as permanent fallback so the
 *    deployed Vercel site never calls "undefined/api/..." or
 *    "localhost:8080" from a real browser.
 */

const PRODUCTION_API_URL = "https://medicompare-ai.onrender.com";
const LOCAL_API_URL = "http://localhost:8080";

function resolveDefaultApiUrl() {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;

        if (hostname === "localhost" || hostname === "127.0.0.1") {
            return LOCAL_API_URL;
        }
    }

    return PRODUCTION_API_URL;
}

const fromEnv = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

export const API_BASE_URL = fromEnv || resolveDefaultApiUrl();

export default API_BASE_URL;
