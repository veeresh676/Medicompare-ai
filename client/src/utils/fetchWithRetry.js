import { API_BASE_URL } from "../config";

/**
 * Robust fetch wrapper that handles Render free-tier cold starts.
 *
 * - 60s timeout per attempt (cold start needs ~30-60s)
 * - Automatic retry 2-3 times with backoff
 * - Transparent to user: no "press again" error, just retries
 * - Distinguishes real validation errors (400/401/409) from cold-start network failures
 */

export function isRetryableError(error, response) {
    // Network failure / timeout / abort -> retry
    if (!response) {
        // fetch threw - could be TimeoutError / AbortError / TypeError (Failed to fetch)
        if (
            error?.name === "TimeoutError" ||
            error?.name === "AbortError" ||
            error?.message?.includes("Failed to fetch") ||
            error?.message?.includes("Load failed") ||
            error?.message?.includes("NetworkError") ||
            error?.code === "ECONNABORTED"
        ) {
            return true;
        }
        // Unknown network error -> retry once
        return true;
    }
    // HTTP 502/503/504 from Render cold start -> retry
    if ([502, 503, 504, 429].includes(response.status)) return true;
    return false;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with automatic retry and proper timeout handling.
 *
 * WARNING: never auto-retry non-idempotent POSTs (register/login/booking).
 * The server may have committed while the client timed out waiting, so a
 * retry surfaces a confusing "already exists" error. Call those with
 * `{ retries: 0 }` and one long timeout instead.
 *
 * @param {string} url
 * @param {RequestInit} options
 * @param {{ retries?: number, timeout?: number, retryDelay?: number }} config
 */
export async function fetchWithRetry(url, options = {}, config = {}) {
    const {
        retries = 2,
        timeout = 45000,
        retryDelay = 3000,
    } = config;

    let lastError;
    let lastResponse;

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Honor a caller-supplied abort signal (e.g. unmount) as well.
        const callerSignal = options.signal;
        let signal = controller.signal;
        if (callerSignal) {
            if (typeof AbortSignal.any === "function") {
                signal = AbortSignal.any([callerSignal, controller.signal]);
            } else if (callerSignal.aborted) {
                controller.abort();
            } else {
                callerSignal.addEventListener("abort", () => controller.abort(), {
                    once: true,
                });
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                signal,
            });
            clearTimeout(timeoutId);

            // Retry on 502/503/504
            if (isRetryableError(null, response) && attempt < retries) {
                lastResponse = response;
                await sleep(retryDelay * Math.pow(1.8, attempt));
                continue;
            }

            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            lastError = error;

            const isTimeout =
                error?.name === "TimeoutError" ||
                error?.name === "AbortError" ||
                error?.message?.includes("timed out") ||
                error?.message?.includes("signal timed out") ||
                error?.message?.includes("Failed to fetch");

            // Only retry on network/timeout errors, not on validation errors
            if ((isTimeout || isRetryableError(error, null)) && attempt < retries) {
                // Exponential backoff: 3s, 5.4s, 9.7s
                await sleep(retryDelay * Math.pow(1.8, attempt));
                continue;
            }
            throw error;
        }
    }

    if (lastError) throw lastError;
    return lastResponse;
}

/**
 * Wake the Render backend. Fire-and-forget.
 * Called on app mount and on Login/Register page mount.
 * Also used by keepAlive interval.
 */
export function wakeBackend() {
    // Don't await - just ping to warm up the server
    fetch(`${API_BASE_URL}/api/hello`, {
        signal: AbortSignal.timeout(10000),
    }).catch(() => {
        // Even a failed fetch wakes Render (it triggers cold start)
    });
}

export function isColdStartError(error) {
    return (
        error?.name === "TimeoutError" ||
        error?.name === "AbortError" ||
        error?.message?.includes("timed out") ||
        error?.message?.includes("signal timed out") ||
        error?.code === "ECONNABORTED" ||
        error?.message?.includes("Failed to fetch")
    );
}
