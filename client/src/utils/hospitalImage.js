import { API_BASE_URL as API_URL } from "../config";

/*
 * Spare REAL hospital photographs (Wikimedia Commons, freely licensed).
 * None of these overlap with the per-hospital images assigned by the
 * backend, so a fallback never duplicates another hospital's photo.
 * Used only when a hospital's primary imageUrl fails to load
 * (e.g. the remote file was moved or deleted in the future).
 */
export const HOSPITAL_IMAGE_FALLBACKS = [
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_01.jpg/1280px-P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_01.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8b/P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_02.jpg/1280px-P.G._%28SSKM%29_Hospital%2C_administrative_building_and_campus_02.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_02.jpg/1280px-Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_02.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_03.jpg/1280px-Cooch_Behar_Police_Hospital%2C_MJN_Road%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_03.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_03.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_03.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/15/MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_04.jpg/1280px-MJN_Medical_College_%26_Hospital_Coochbehar%2C_Cooch_Behar_Town%2C_West_Bengal%2C_India_04.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/Government_E._N._T._Hospital_2.jpg/1280px-Government_E._N._T._Hospital_2.jpg",
    "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Kasturba_Hospital%2C_Manipal_-_views_around_%287%29.jpg/1280px-Kasturba_Hospital%2C_Manipal_-_views_around_%287%29.jpg",
];

/*
 * Backend stores uploaded image paths such as
 * /uploads/hospitals/example.png — the browser must request them
 * from the API host, not from the React/Vite host.
 */
export function resolveHospitalImageUrl(rawImageUrl) {
    if (!rawImageUrl) {
        return null;
    }

    const value = rawImageUrl.trim();

    if (!value) {
        return null;
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `${API_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

function hashSeed(seed) {
    const text = String(seed ?? "");

    let hash = 0;

    for (let index = 0; index < text.length; index++) {
        hash = (hash * 31 + text.charCodeAt(index)) | 0;
    }

    return Math.abs(hash);
}

/*
 * <img onError> handler with a retry chain:
 * 1. Try spare real-hospital photos (deterministic per hospital).
 * 2. If every spare also fails, hide the <img> and reveal the
 *    sibling [data-image-fallback] element (usually a 🏥 tile).
 *
 * This guarantees hospital cards never show a broken-image icon,
 * even years from now if a remote file is moved or deleted.
 */
export function handleHospitalImageError(event, seed = "") {
    const img = event?.currentTarget;

    if (!img) {
        return;
    }

    const tried = Number(img.dataset.fallbackIndex || 0);

    if (tried < HOSPITAL_IMAGE_FALLBACKS.length) {
        const index =
            (hashSeed(seed) + tried) %
            HOSPITAL_IMAGE_FALLBACKS.length;

        img.dataset.fallbackIndex = String(tried + 1);
        img.src = HOSPITAL_IMAGE_FALLBACKS[index];
        return;
    }

    img.style.display = "none";

    const fallback = img.parentElement?.querySelector(
        "[data-image-fallback]"
    );

    if (fallback) {
        fallback.classList.remove("hidden");
    }
}
