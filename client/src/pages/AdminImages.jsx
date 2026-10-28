import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import { API_BASE_URL as API_URL } from "../config";
function AdminImages() {

    const { hospitalId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);


    const [hospital, setHospital] = useState(null);
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [altText, setAltText] = useState("");
    const [primaryImage, setPrimaryImage] = useState(false);


    // =========================================================
    // LOAD HOSPITAL + IMAGES
    // =========================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                hospitalResponse,
                imagesResponse
            ] = await Promise.all([

                api.get(
                    `/admin/hospitals/${hospitalId}`
                ),

                api.get(
                    `/admin/hospitals/${hospitalId}/images`
                )

            ]);

            setHospital(
                hospitalResponse.data
            );

            setImages(
                Array.isArray(imagesResponse.data)
                    ? imagesResponse.data
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load hospital images:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                navigate(
                    "/admin/login",
                    {
                        replace: true
                    }
                );

                return;
            }

            setError(
                "Unable to load hospital images."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadData();

    }, [hospitalId]);


    // =========================================================
    // IMAGE URL
    // =========================================================

    function getImageUrl(imageUrl) {

        if (!imageUrl) {
            return "";
        }

        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        return `${API_URL}${imageUrl}`;
    }


    // =========================================================
    // FILE SELECTION
    // =========================================================

    const handleFileChange = (event) => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }


        setError("");
        setSuccess("");


        // -----------------------------------------------------
        // Validate file type
        // -----------------------------------------------------

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            setError(
                "Please select a JPG, PNG, or WEBP image."
            );

            event.target.value = "";

            return;
        }


        // -----------------------------------------------------
        // Validate file size
        // -----------------------------------------------------

        const maxSize =
            10 * 1024 * 1024;


        if (file.size > maxSize) {

            setError(
                "Image size must be less than 10 MB."
            );

            event.target.value = "";

            return;
        }


        // -----------------------------------------------------
        // Store selected file
        // -----------------------------------------------------

        setSelectedFile(file);


        // -----------------------------------------------------
        // Create local preview
        // -----------------------------------------------------

        const objectUrl =
            URL.createObjectURL(file);

        setPreviewUrl(objectUrl);


        // -----------------------------------------------------
        // Automatically create alt text
        // -----------------------------------------------------

        if (!altText.trim()) {

            const filename =
                file.name
                    .replace(/\.[^/.]+$/, "")
                    .replace(/[-_]+/g, " ")
                    .trim();

            setAltText(
                filename ||
                `${hospital?.name || "Hospital"} image`
            );
        }
    };


    // =========================================================
    // OPEN FILE PICKER
    // =========================================================

    const openFilePicker = () => {

        fileInputRef.current?.click();
    };


    // =========================================================
    // REMOVE SELECTED FILE
    // =========================================================

    const removeSelectedFile = () => {

        setSelectedFile(null);
        setPreviewUrl("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    // =========================================================
    // RESET FORM
    // =========================================================

    const resetForm = () => {

        setSelectedFile(null);
        setPreviewUrl("");

        setAltText("");
        setPrimaryImage(false);

        setShowForm(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };


    // =========================================================
    // UPLOAD IMAGE
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!selectedFile) {

            setError(
                "Please select an image first."
            );

            return;
        }


        try {

            setSaving(true);
            setError("");
            setSuccess("");


            const formData =
                new FormData();


            formData.append(
                "file",
                selectedFile
            );


            formData.append(
                "altText",
                altText.trim()
            );


            formData.append(
                "primaryImage",
                primaryImage
            );


            await api.post(

                `/admin/hospitals/${hospitalId}/images/upload`,

                formData

            );


            setSuccess(
                "Hospital image uploaded successfully."
            );


            resetForm();


            await loadData();


        } catch (err) {

            console.error(
                "Failed to upload image:",
                err
            );


            if (
                err.response?.status === 400
            ) {

                const message =
                    typeof err.response.data ===
                    "string"
                        ? err.response.data
                        : "Invalid image file.";

                setError(message);

            } else if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                navigate(
                    "/admin/login",
                    {
                        replace: true
                    }
                );

            } else {

                setError(
                    "Unable to upload image. Please try again."
                );
            }

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // SET PRIMARY IMAGE
    // =========================================================

    const handleSetPrimary = async (
        imageId
    ) => {

        try {

            setError("");
            setSuccess("");


            await api.put(
                `/admin/hospitals/${hospitalId}/images/${imageId}/primary`
            );


            setSuccess(
                "Primary image updated successfully."
            );


            await loadData();


        } catch (err) {

            console.error(
                "Failed to set primary image:",
                err
            );


            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                navigate(
                    "/admin/login",
                    {
                        replace: true
                    }
                );

                return;
            }


            setError(
                "Unable to set primary image."
            );
        }
    };


    // =========================================================
    // DELETE IMAGE
    // =========================================================

    const handleDelete = async (
        imageId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this hospital image?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setSuccess("");


            await api.delete(
                `/admin/hospitals/${hospitalId}/images/${imageId}`
            );


            setSuccess(
                "Image deleted successfully."
            );


            await loadData();


        } catch (err) {

            console.error(
                "Failed to delete image:",
                err
            );


            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                navigate(
                    "/admin/login",
                    {
                        replace: true
                    }
                );

                return;
            }


            setError(
                "Unable to delete image."
            );
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "role"
        );

        localStorage.removeItem(
            "name"
        );

        localStorage.removeItem(
            "email"
        );

        navigate(
            "/admin/login",
            {
                replace: true
            }
        );
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-[#faf9f7]">

                <header className="border-b border-ink-200/70 bg-[#faf9f7]">

                    <div className="mx-auto flex h-20 max-w-7xl items-center px-6">

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-ink-100">
                            </div>

                            <div>

                                <div className="h-5 w-32 animate-pulse rounded bg-ink-100" />

                                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-ink-100" />

                            </div>

                        </div>

                    </div>

                </header>


                <main className="mx-auto max-w-7xl px-6 py-12">

                    <div className="h-4 w-32 animate-pulse rounded bg-ink-100" />

                    <div className="mt-4 h-10 w-72 animate-pulse rounded bg-ink-100" />

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {[1, 2, 3].map(
                            number => (

                                <div
                                    key={number}
                                    className="overflow-hidden rounded-2xl border border-ink-200 bg-white"
                                >

                                    <div className="h-64 animate-pulse bg-ink-100" />

                                    <div className="space-y-3 p-5">

                                        <div className="h-5 w-2/3 animate-pulse rounded bg-ink-100" />

                                        <div className="h-4 w-full animate-pulse rounded bg-ink-100" />

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="min-h-screen bg-[#faf9f7] text-ink-900">


            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="border-b border-ink-200/70 bg-[#faf9f7]">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">


                    {/* LOGO */}

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
                            M
                        </div>

                        <div>

                            <h1 className="text-lg font-semibold tracking-tight">
                                MediCompare
                            </h1>

                            <p className="text-xs text-ink-500">
                                Administration
                            </p>

                        </div>

                    </div>


                    {/* ADMIN */}

                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-medium">
                                Administrator
                            </p>

                            <p className="text-xs text-ink-500">
                                Manage hospital images
                            </p>

                        </div>


                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                            A
                        </div>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-medium transition hover:border-ink-300 hover:bg-ink-50"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="mx-auto max-w-7xl px-6 py-10">


                {/* BACK */}

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            `/admin/hospitals/${hospitalId}`
                        )
                    }
                    className="mb-7 inline-flex items-center text-sm font-semibold text-ink-600 transition hover:text-brand-600"
                >
                    ← Back to Hospital
                </button>


                {/* HEADER */}

                <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">

                    <div>

                        <p className="text-sm font-semibold text-brand-600">
                            Hospital Images
                        </p>

                        <h2 className="mt-2 text-4xl font-bold tracking-tight text-ink-900">
                            {hospital?.name ||
                                "Hospital"}
                        </h2>

                        <p className="mt-2 text-sm text-ink-500">
                            📍 {hospital?.city ||
                                "Location unavailable"}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setShowForm(true);
                        }}
                        className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
                    >
                        + Upload Image
                    </button>

                </div>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (

                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
                        {error}
                    </div>

                )}


                {success && (

                    <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm leading-6 text-green-700">
                        {success}
                    </div>

                )}


                {/* =================================================
                    UPLOAD FORM
                ================================================= */}

                {showForm && (

                    <section className="mb-10 overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm">

                        <div className="border-b border-ink-100 px-7 py-6">

                            <div className="flex items-start justify-between gap-4">

                                <div>

                                    <p className="text-sm font-bold text-brand-600">
                                        Add image
                                    </p>

                                    <h3 className="mt-1 text-2xl font-bold">
                                        Upload hospital photo
                                    </h3>

                                    <p className="mt-2 text-sm text-ink-500">
                                        Select an image from your computer.
                                        No image URL is required.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition hover:bg-ink-50"
                                >
                                    ×
                                </button>

                            </div>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="p-7"
                        >

                            {/* FILE INPUT */}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />


                            {!selectedFile ? (

                                <button
                                    type="button"
                                    onClick={openFilePicker}
                                    className="group w-full rounded-3xl border-2 border-dashed border-ink-300 bg-[#faf9f7] px-6 py-14 text-center transition hover:border-brand-400 hover:bg-brand-50"
                                >

                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl transition group-hover:scale-105">
                                        🖼️
                                    </div>

                                    <h4 className="mt-5 text-lg font-bold text-ink-900">
                                        Choose an image
                                    </h4>

                                    <p className="mt-2 text-sm text-ink-500">
                                        Click to browse your computer
                                    </p>

                                    <p className="mt-3 text-xs text-ink-400">
                                        JPG, PNG or WEBP · Maximum 10 MB
                                    </p>

                                </button>

                            ) : (

                                <div className="overflow-hidden rounded-3xl border border-ink-200 bg-[#faf9f7]">

                                    <div className="relative">

                                        <img
                                            src={previewUrl}
                                            alt="Selected hospital preview"
                                            className="h-80 w-full object-cover"
                                        />


                                        <button
                                            type="button"
                                            onClick={removeSelectedFile}
                                            className="absolute right-4 top-4 rounded-xl bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-lg transition hover:bg-red-50"
                                        >
                                            Remove
                                        </button>

                                    </div>


                                    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-bold text-ink-900">
                                                {selectedFile.name}
                                            </p>

                                            <p className="mt-1 text-xs text-ink-400">
                                                {(
                                                    selectedFile.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={openFilePicker}
                                            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-xs font-bold text-ink-700 transition hover:bg-ink-50"
                                        >
                                            Choose another
                                        </button>

                                    </div>

                                </div>

                            )}


                            {/* DETAILS */}

                            <div className="mt-7 grid gap-6 md:grid-cols-2">

                                <div>

                                    <label
                                        htmlFor="altText"
                                        className="mb-2 block text-sm font-bold text-ink-900"
                                    >
                                        Image description
                                    </label>

                                    <input
                                        id="altText"
                                        type="text"
                                        value={altText}
                                        onChange={(event) =>
                                            setAltText(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Main exterior of the hospital"
                                        maxLength={300}
                                        className="h-12 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                                    />

                                    <p className="mt-2 text-xs text-ink-400">
                                        Used as accessible image text.
                                    </p>

                                </div>


                                <div>

                                    <label className="mb-2 block text-sm font-bold text-ink-900">
                                        Image status
                                    </label>

                                    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 transition hover:bg-ink-50">

                                        <input
                                            type="checkbox"
                                            checked={primaryImage}
                                            onChange={(event) =>
                                                setPrimaryImage(
                                                    event.target.checked
                                                )
                                            }
                                            className="h-4 w-4 accent-brand-500"
                                        />

                                        <div>

                                            <p className="text-sm font-semibold">
                                                Make primary image
                                            </p>

                                            <p className="text-xs text-ink-400">
                                                Use this image on hospital cards.
                                            </p>

                                        </div>

                                    </label>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={resetForm}
                                    disabled={saving}
                                    className="rounded-xl border border-ink-200 bg-white px-6 py-3 text-sm font-bold text-ink-700 transition hover:bg-ink-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !selectedFile
                                    }
                                    className="rounded-xl bg-brand-500 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? "Uploading..."
                                        : "Upload Image"}
                                </button>

                            </div>

                        </form>

                    </section>

                )}


                {/* =================================================
                    IMAGE SUMMARY
                ================================================= */}

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                        <p className="text-sm font-bold text-ink-900">
                            Hospital gallery
                        </p>

                        <p className="mt-1 text-sm text-ink-500">
                            {images.length}{" "}
                            {images.length === 1
                                ? "image"
                                : "images"}{" "}
                            uploaded
                        </p>

                    </div>

                </div>


                {/* =================================================
                    NO IMAGES
                ================================================= */}

                {images.length === 0 ? (

                    <section className="rounded-3xl border border-dashed border-ink-300 bg-white px-6 py-20 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-3xl">
                            🖼️
                        </div>

                        <h3 className="mt-5 text-xl font-bold">
                            No hospital images yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">
                            Upload a high-quality hospital photograph
                            to make the hospital directory look more
                            professional.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setShowForm(true)
                            }
                            className="mt-6 rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600"
                        >
                            + Upload First Image
                        </button>

                    </section>

                ) : (

                    /* =================================================
                       IMAGE GRID
                    ================================================= */

                    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                        {images.map(image => (

                            <article
                                key={image.id}
                                className="group overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                {/* IMAGE */}

                                <div className="relative overflow-hidden bg-ink-100">

                                    <img
                                        src={getImageUrl(
                                            image.imageUrl
                                        )}
                                        alt={
                                            image.altText ||
                                            `${hospital?.name || "Hospital"} image`
                                        }
                                        className="h-64 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        onError={(event) => {

                                            event.currentTarget.style.display =
                                                "none";

                                            event.currentTarget.parentElement.classList.add(
                                                "flex",
                                                "items-center",
                                                "justify-center"
                                            );

                                            event.currentTarget.parentElement.innerHTML =
                                                '<span class="text-4xl">🖼️</span>';
                                        }}
                                    />


                                    {/* PRIMARY BADGE */}

                                    {image.primaryImage && (

                                        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand-600 shadow-md">
                                            ★ Primary
                                        </span>

                                    )}

                                </div>


                                {/* CONTENT */}

                                <div className="p-5">

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-w-0">

                                            <h3 className="truncate text-sm font-bold text-ink-900">
                                                {image.altText ||
                                                    "Hospital image"}
                                            </h3>

                                            <p className="mt-1 text-xs text-ink-400">
                                                Hospital gallery
                                            </p>

                                        </div>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="mt-5 flex gap-2">

                                        {!image.primaryImage && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSetPrimary(
                                                        image.id
                                                    )
                                                }
                                                className="flex-1 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-xs font-bold text-ink-700 transition hover:border-brand-300 hover:text-brand-600"
                                            >
                                                Set Primary
                                            </button>

                                        )}


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    image.id
                                                )
                                            }
                                            className="rounded-xl border border-red-200 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </article>

                        ))}

                    </section>

                )}

            </main>

        </div>
    );
}


export default AdminImages;