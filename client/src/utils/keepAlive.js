import { API_BASE_URL } from "../config";

/**
 * Keeps Render free-tier backend warm.
 * Render sleeps after 15 minutes of inactivity.
 * We ping every 14 minutes + on visibility change.
 */

let intervalId = null;

function ping() {
    fetch(`${API_BASE_URL}/api/hello`, {
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
    }).catch(() => {});
}

export function startKeepAlive() {
    if (intervalId) return;

    // Immediate ping on app start
    ping();

    // Ping every 14 minutes (840000ms) - just before Render's 15min sleep
    intervalId = setInterval(ping, 14 * 60 * 1000);

    // Also ping when user returns to tab (backend may have slept while tab was hidden)
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            ping();
        }
    });
}

export function stopKeepAlive() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}
