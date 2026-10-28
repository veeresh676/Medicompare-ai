import { useNavigate } from "react-router-dom";

function AdminLayout({ children }) {

    const navigate = useNavigate();

    const name =
        localStorage.getItem("name") || "Admin";

    const initial =
        name.charAt(0).toUpperCase();

    function handleLogout() {

        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        navigate("/login", {
            replace: true,
        });
    }

    return (
        <div className="min-h-screen bg-ink-50 text-ink-900">

            {/* ==================================================
                ADMIN NAVIGATION
            ================================================== */}

            <header className="sticky top-0 z-50 border-b border-ink-200/70 bg-ink-50/95 backdrop-blur-xl">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    {/* BRAND */}

                    <button
                        type="button"
                        onClick={() => navigate("/admin")}
                        className="group flex items-center gap-3"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white shadow-sm transition group-hover:bg-brand-600">
                            M
                        </div>

                        <div className="text-left">

                            <div className="text-lg font-semibold tracking-tight text-ink-900">
                                MediCompare
                            </div>

                            <div className="text-xs text-ink-500">
                                Administration
                            </div>

                        </div>

                    </button>


                    {/* USER */}

                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">

                            <div className="text-sm font-semibold text-ink-900">
                                {name}
                            </div>

                            <div className="text-xs text-ink-500">
                                Administrator
                            </div>

                        </div>


                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-sm font-semibold text-white">
                            {initial}
                        </div>


                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-100"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* ==================================================
                PAGE CONTENT

                IMPORTANT:
                Small top padding intentionally keeps content
                close to the navbar.
            ================================================== */}

            <main className="mx-auto w-full max-w-7xl px-6 pt-5 pb-10 sm:pt-6 sm:pb-12">

                {children}

            </main>

        </div>
    );
}

export default AdminLayout;