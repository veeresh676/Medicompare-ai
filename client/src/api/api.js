import axios from "axios";
import { API_BASE_URL } from "../config";

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 60000,
});

// Retry on cold-start / transient failures (Render free tier)
const RETRY_DELAY_MS = 3000;
const MAX_RETRIES = 2;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableAxiosError(error) {
    const status = error?.response?.status;
    const code = error?.code;

    // Network errors / timeouts -> retry
    if (
        code === "ECONNABORTED" ||
        code === "ERR_NETWORK" ||
        error.message?.includes("timeout") ||
        error.message?.includes("Network Error") ||
        !error.response
    ) {
        return true;
    }

    // Render returns 502/503/504 while waking up
    if ([502, 503, 504, 429].includes(status)) return true;

    return false;
}

api.interceptors.request.use((config) => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken") ||
        localStorage.getItem("adminToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        if (!config || config.__retryCount >= MAX_RETRIES) {
            return Promise.reject(error);
        }

        if (!isRetryableAxiosError(error)) {
            return Promise.reject(error);
        }

        config.__retryCount = (config.__retryCount || 0) + 1;

        const delay = RETRY_DELAY_MS * Math.pow(1.8, config.__retryCount - 1);
        await sleep(delay);

        // Never shorten a caller-supplied timeout (e.g. 90s AI verdict)
        config.timeout = Math.max(config.timeout || 0, 60000);

        return api(config);
    }
);

export default api;