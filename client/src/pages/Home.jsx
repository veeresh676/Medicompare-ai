import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="min-h-screen bg-[#faf9f7] text-ink-900">

            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <header className="sticky top-0 z-50 border-b border-ink-100 bg-[#faf9f7]/95 backdrop-blur">

                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

                    {/* LOGO */}

                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-xl font-bold text-white shadow-sm">
                            M
                        </div>

                        <div>
                            <div className="text-lg font-extrabold tracking-tight text-ink-900">
                                MediCompare
                            </div>

                            <div className="text-xs font-medium text-ink-400">
                                Healthcare comparison
                            </div>
                        </div>

                    </Link>


                    {/* DESKTOP NAV */}

                    <nav className="hidden items-center gap-8 md:flex">

                        <a
                            href="#home"
                            className="text-sm font-bold text-ink-700 transition hover:text-brand-600"
                        >
                            Home
                        </a>

                        <a
                            href="#features"
                            className="text-sm font-bold text-ink-700 transition hover:text-brand-600"
                        >
                            Features
                        </a>

                        <a
                            href="#how-it-works"
                            className="text-sm font-bold text-ink-700 transition hover:text-brand-600"
                        >
                            How it works
                        </a>

                        <a
                            href="#ai"
                            className="text-sm font-bold text-ink-700 transition hover:text-brand-600"
                        >
                            AI
                        </a>

                    </nav>


                    {/* ACTIONS */}

                    <div className="flex items-center gap-3">

                        <Link
                            to="/login"
                            className="hidden rounded-xl border border-ink-300 bg-white px-5 py-2.5 text-sm font-bold text-ink-800 transition hover:border-ink-400 hover:bg-ink-50 sm:inline-flex"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
                        >
                            Get started
                        </Link>

                    </div>

                </div>

            </header>


            {/* =====================================================
                HERO
            ===================================================== */}

            <main id="home">

                <section className="relative overflow-hidden">

                    {/* Decorative background */}

                    <div className="pointer-events-none absolute left-1/2 top-20 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-100/60 blur-3xl" />

                    <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-12 sm:pb-16 sm:pt-16">


                        {/* Small badge */}

                        <div className="flex justify-center">

                            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-bold text-ink-700 shadow-sm">

                                <span className="flex h-2 w-2 rounded-full bg-brand-500" />

                                AI-powered healthcare comparison

                            </div>

                        </div>


                        {/* Main heading */}

                        <div className="mx-auto mt-6 max-w-5xl text-center">

                            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.03em] text-ink-900 sm:text-5xl lg:text-6xl">

                                Compare healthcare.

                                <br />

                                <span className="text-brand-500">
                                    Choose with confidence.
                                </span>

                            </h1>


                            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-500 sm:text-lg sm:leading-8">

                                Find nearby hospitals across AP, Telangana,
                                Tamil Nadu & Karnataka, compare healthcare
                                services and prices, explore patient reviews,
                                get AI-powered recommendations, and book
                                appointments — all in one place.

                            </p>


                            {/* Hero buttons */}

                            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                                <Link
                                    to="/hospitals"
                                    className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-lg"
                                >
                                    Explore hospitals
                                    <span className="ml-2">
                                        →
                                    </span>
                                </Link>


                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center rounded-xl border border-ink-300 bg-white px-6 py-3.5 text-sm font-bold text-ink-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-ink-50"
                                >
                                    Create free account
                                </Link>

                            </div>

                        </div>


                        {/* =================================================
                            STATS
                        ================================================= */}

                        <div className="mx-auto mt-10 max-w-4xl">

                            <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-sm md:grid-cols-4">

                                <Stat
                                    value="130+"
                                    label="Hospitals"
                                />

                                <Stat
                                    value="650+"
                                    label="Healthcare services"
                                />

                                <Stat
                                    value="40+"
                                    label="Cities in AP, TG, TN & KA"
                                />

                                <Stat
                                    value="Nearby"
                                    label="Location-based search"
                                />

                            </div>

                        </div>


                        {/* =================================================
                            PRODUCT PREVIEW
                        ================================================= */}

                        <div className="mx-auto mt-10 max-w-6xl">

                            <div className="relative overflow-hidden rounded-[2rem] border border-ink-200 bg-white p-3 shadow-[0_25px_80px_rgba(0,0,0,0.10)]">

                                {/* Browser top */}

                                <div className="flex h-12 items-center gap-2 rounded-t-[1.5rem] border-b border-ink-100 bg-ink-50 px-5">

                                    <span className="h-3 w-3 rounded-full bg-ink-300" />
                                    <span className="h-3 w-3 rounded-full bg-ink-300" />
                                    <span className="h-3 w-3 rounded-full bg-ink-300" />

                                    <div className="ml-4 hidden h-7 flex-1 rounded-lg bg-white sm:block" />

                                </div>


                                {/* Preview */}

                                <div className="grid min-h-[420px] lg:grid-cols-[0.9fr_1.1fr]">

                                    {/* Left */}

                                    <div className="border-b border-ink-100 p-7 lg:border-b-0 lg:border-r lg:p-10">

                                        <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
                                            AI Recommendation
                                        </div>

                                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">
                                            Find the hospital that fits your needs.
                                        </h2>

                                        <p className="mt-3 text-sm leading-6 text-ink-500">
                                            Compare price, location, ratings,
                                            reviews and service availability
                                            before making your decision.
                                        </p>


                                        <div className="mt-7 space-y-3">

                                            <PreviewFilter
                                                label="Service"
                                                value="Cardiology Consultation"
                                            />

                                            <PreviewFilter
                                                label="Location"
                                                value="Bengaluru"
                                            />

                                            <PreviewFilter
                                                label="Budget"
                                                value="Up to ₹1,000"
                                            />

                                        </div>


                                        <div className="mt-6 rounded-xl bg-brand-500 px-5 py-3 text-center text-sm font-bold text-white">
                                            Find best hospitals →
                                        </div>

                                    </div>


                                    {/* Right */}

                                    <div className="bg-[#fcfbf9] p-7 lg:p-10">

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <div className="text-xs font-bold uppercase tracking-wider text-brand-600">
                                                    Recommended
                                                </div>

                                                <h3 className="mt-1 text-xl font-extrabold text-ink-900">
                                                    Top matches
                                                </h3>

                                            </div>

                                            <div className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                                                AI ranked
                                            </div>

                                        </div>


                                        <div className="mt-6 space-y-4">

                                            <PreviewHospital
                                                rank="01"
                                                name="Bengaluru HealthFirst Hospital"
                                                location="Bengaluru"
                                                rating="4.8"
                                                price="₹900"
                                                match="Excellent match"
                                            />

                                            <PreviewHospital
                                                rank="02"
                                                name="CapitalCare Hospital"
                                                location="Delhi"
                                                rating="4.8"
                                                price="₹850"
                                                match="Strong match"
                                            />

                                            <PreviewHospital
                                                rank="03"
                                                name="Mumbai HealthPoint Hospital"
                                                location="Mumbai"
                                                rating="4.8"
                                                price="₹900"
                                                match="Good match"
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    FEATURES
                ===================================================== */}

                <section
                    id="features"
                    className="border-t border-ink-100 bg-white"
                >

                    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">

                        <div className="max-w-2xl">

                            <span className="text-sm font-bold text-brand-600">
                                Everything in one place
                            </span>

                            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
                                Make healthcare decisions with better information.
                            </h2>

                            <p className="mt-5 text-base leading-7 text-ink-500">
                                MediCompare brings hospital discovery,
                                comparison, reviews, recommendations,
                                maps and appointments together into one
                                platform.
                            </p>

                        </div>


                        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                            <FeatureCard
                                icon="🔎"
                                title="Find hospitals"
                                description="Search 130+ hospitals across Andhra Pradesh, Telangana, Tamil Nadu & Karnataka by name, city, state, type and rating."
                            />

                            <FeatureCard
                                icon="⇄"
                                title="Compare hospitals"
                                description="Compare consultation fees, healthcare services, prices, ratings and availability side by side."
                            />

                            <FeatureCard
                                icon="✨"
                                title="AI recommendations"
                                description="Get ranked hospital recommendations based on your service, budget, location, ratings and real user reviews."
                                featured
                            />

                            <FeatureCard
                                icon="⭐"
                                title="Patient reviews"
                                description="Read genuine user reviews and ratings to understand patient experiences before choosing."
                            />

                            <FeatureCard
                                icon="📍"
                                title="Nearby hospitals"
                                description="Share your location to see hospitals near you first, with live distance badges and radius filters."
                            />

                            <FeatureCard
                                icon="📅"
                                title="Book appointments"
                                description="Choose an available healthcare service and schedule an appointment directly through MediCompare."
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    AI SECTION
                ===================================================== */}

                <section
                    id="ai"
                    className="overflow-hidden bg-[#faf9f7]"
                >

                    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">

                        <div className="grid items-center gap-16 lg:grid-cols-2">


                            {/* TEXT */}

                            <div>

                                <div className="inline-flex rounded-full bg-brand-100 px-4 py-2 text-xs font-bold text-brand-700">
                                    ✨ MediCompare AI
                                </div>

                                <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight text-ink-900 sm:text-5xl">
                                    Healthcare choices,
                                    <br />
                                    explained by AI.
                                </h2>

                                <p className="mt-6 max-w-xl text-base leading-7 text-ink-500">
                                    Don't just get a list of hospitals.
                                    MediCompare evaluates your requirements
                                    and explains why each hospital matches
                                    your needs.
                                </p>


                                <div className="mt-8 space-y-4">

                                    <AiFactor
                                        number="01"
                                        title="Service & availability"
                                        description="Find hospitals that actually provide the service you're looking for."
                                    />

                                    <AiFactor
                                        number="02"
                                        title="Price & budget"
                                        description="Consider service prices and your maximum budget."
                                    />

                                    <AiFactor
                                        number="03"
                                        title="Ratings & real reviews"
                                        description="Use hospital ratings together with real patient review signals."
                                    />

                                    <AiFactor
                                        number="04"
                                        title="Location"
                                        description="Prioritize hospitals according to your preferred location."
                                    />

                                </div>

                            </div>


                            {/* AI VISUAL */}

                            <div className="relative">

                                <div className="absolute -inset-10 rounded-full bg-brand-100/60 blur-3xl" />

                                <div className="relative rounded-[2rem] border border-ink-200 bg-white p-6 shadow-xl sm:p-8">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
                                                AI analysis
                                            </p>

                                            <h3 className="mt-2 text-xl font-extrabold text-ink-900">
                                                Why this hospital?
                                            </h3>

                                        </div>

                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-xl">
                                            ✨
                                        </div>

                                    </div>


                                    <div className="mt-7 rounded-2xl bg-[#faf9f7] p-5">

                                        <div className="flex items-start justify-between gap-4">

                                            <div>

                                                <p className="text-xs font-bold text-brand-600">
                                                    #1 recommendation
                                                </p>

                                                <h4 className="mt-1 text-lg font-extrabold text-ink-900">
                                                    Bengaluru HealthFirst Hospital
                                                </h4>

                                                <p className="mt-1 text-xs text-ink-500">
                                                    Bengaluru • Cardiology
                                                </p>

                                            </div>

                                            <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                                                Excellent match
                                            </div>

                                        </div>


                                        <div className="mt-5 grid grid-cols-3 gap-3">

                                            <Metric
                                                label="Price"
                                                value="₹900"
                                            />

                                            <Metric
                                                label="Rating"
                                                value="4.8 ★"
                                            />

                                            <Metric
                                                label="Reviews"
                                                value="24"
                                            />

                                        </div>

                                    </div>


                                    <div className="mt-5">

                                        <p className="text-sm font-extrabold text-ink-900">
                                            Why it matched
                                        </p>

                                        <div className="mt-3 space-y-3">

                                            <Reason text="Matches your selected healthcare service." />

                                            <Reason text="Service price fits within your budget." />

                                            <Reason text="Strong patient review performance." />

                                            <Reason text="High hospital rating." />

                                        </div>

                                    </div>


                                    <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-4">

                                        <p className="text-xs font-bold text-brand-700">
                                            AI insight
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-ink-600">
                                            This hospital provides a strong
                                            balance between service price,
                                            patient feedback and overall
                                            hospital rating.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    HOW IT WORKS
                ===================================================== */}

                <section
                    id="how-it-works"
                    className="border-t border-ink-100 bg-white"
                >

                    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">

                        <div className="text-center">

                            <span className="text-sm font-bold text-brand-600">
                                Simple by design
                            </span>

                            <h2 className="mt-3 text-4xl font-black tracking-tight text-ink-900 sm:text-5xl">
                                Find. Compare. Decide. Book.
                            </h2>

                            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-500">
                                MediCompare simplifies the process of
                                choosing a healthcare provider.
                            </p>

                        </div>


                        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

                            <Step
                                number="01"
                                icon="🔎"
                                title="Tell us what you need"
                                description="Search for a hospital or specify the healthcare service you need."
                            />

                            <Step
                                number="02"
                                icon="⇄"
                                title="Compare your options"
                                description="Compare prices, ratings, services, availability and locations."
                            />

                            <Step
                                number="03"
                                icon="✨"
                                title="Get AI recommendations"
                                description="Let MediCompare rank the options and explain the important trade-offs."
                            />

                            <Step
                                number="04"
                                icon="📅"
                                title="Book your appointment"
                                description="Choose a service and schedule an appointment at your selected hospital."
                            />

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    MAP / DIRECTIONS
                ===================================================== */}

                <section className="bg-[#faf9f7]">

                    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">

                        <div className="grid items-center gap-12 lg:grid-cols-2">

                            <div className="order-2 lg:order-1">

                                <div className="overflow-hidden rounded-[2rem] border border-ink-200 bg-white shadow-lg">

                                    <div className="relative h-[360px] overflow-hidden bg-[#e9e5df]">

                                        {/* Map-like decorative grid */}

                                        <div className="absolute inset-0 opacity-50">

                                            <div className="absolute left-[10%] top-[20%] h-2 w-[80%] rotate-12 rounded-full bg-white" />

                                            <div className="absolute left-[0%] top-[55%] h-2 w-[100%] -rotate-6 rounded-full bg-white" />

                                            <div className="absolute left-[45%] top-0 h-[120%] w-2 rotate-12 rounded-full bg-white" />

                                            <div className="absolute left-[70%] top-0 h-[120%] w-2 -rotate-[25deg] rounded-full bg-white" />

                                        </div>


                                        {/* Route */}

                                        <div className="absolute left-[20%] top-[65%] h-[3px] w-[55%] rotate-[-25deg] bg-brand-500" />


                                        {/* User */}

                                        <div className="absolute left-[17%] top-[65%] flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-blue-500 text-lg shadow-lg">
                                            📍
                                        </div>


                                        {/* Hospital */}

                                        <div className="absolute right-[18%] top-[30%] flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-brand-500 text-xl shadow-lg">
                                            🏥
                                        </div>


                                        <div className="absolute bottom-5 left-5 rounded-xl bg-white px-4 py-3 shadow-lg">

                                            <p className="text-xs font-bold text-ink-500">
                                                Estimated travel
                                            </p>

                                            <p className="mt-1 text-lg font-extrabold text-ink-900">
                                                6.4 km · 18 min
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <div className="order-1 lg:order-2">

                                <span className="text-sm font-bold text-brand-600">
                                    Smart directions
                                </span>

                                <h2 className="mt-3 text-4xl font-black tracking-tight text-ink-900 sm:text-5xl">
                                    Know how far it is before you go.
                                </h2>

                                <p className="mt-6 text-base leading-7 text-ink-500">
                                    Select a hospital and MediCompare can
                                    use your location to calculate the
                                    driving route, distance and estimated
                                    travel time.
                                </p>


                                <div className="mt-8 space-y-4">

                                    <DirectionPoint
                                        icon="📍"
                                        title="Your location"
                                        description="Use your current browser location as the starting point."
                                    />

                                    <DirectionPoint
                                        icon="🏥"
                                        title="Selected hospital"
                                        description="Automatically route to the hospital you're viewing."
                                    />

                                    <DirectionPoint
                                        icon="🧭"
                                        title="Route & travel time"
                                        description="See the driving route, distance and estimated journey time."
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    FINAL CTA
                ===================================================== */}

                <section className="bg-ink-900">

                    <div className="mx-auto max-w-5xl px-6 py-24 text-center sm:py-28">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-2xl shadow-lg">
                            M
                        </div>

                        <h2 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-5xl">
                            Your healthcare choice
                            <br />
                            shouldn't be a guess.
                        </h2>

                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-300">
                            Compare hospitals, understand your options,
                            get AI-powered recommendations and make a more
                            informed healthcare decision.
                        </p>


                        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

                            <Link
                                to="/register"
                                className="rounded-xl bg-brand-500 px-7 py-4 text-sm font-bold text-white transition hover:bg-brand-600"
                            >
                                Get started →
                            </Link>

                            <Link
                                to="/hospitals"
                                className="rounded-xl border border-ink-600 bg-transparent px-7 py-4 text-sm font-bold text-white transition hover:bg-ink-800"
                            >
                                Explore hospitals
                            </Link>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    FOOTER
                ===================================================== */}

                <footer className="border-t border-ink-800 bg-ink-900">

                    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="font-bold text-white">
                                MediCompare
                            </div>

                            <p className="mt-1 text-xs text-ink-400">
                                Healthcare comparison made simpler.
                            </p>

                        </div>


                        <div className="flex flex-wrap gap-5 text-xs font-semibold text-ink-400">

                            <a
                                href="#home"
                                className="transition hover:text-white"
                            >
                                Home
                            </a>

                            <a
                                href="#features"
                                className="transition hover:text-white"
                            >
                                Features
                            </a>

                            <a
                                href="#ai"
                                className="transition hover:text-white"
                            >
                                AI
                            </a>

                            <Link
                                to="/login"
                                className="transition hover:text-white"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="transition hover:text-white"
                            >
                                Register
                            </Link>

                        </div>

                    </div>

                </footer>

            </main>

        </div>
    );
}


/* =====================================================
   STAT
===================================================== */

function Stat({
    value,
    label
}) {
    return (
        <div className="border-b border-ink-100 p-6 text-center last:border-b-0 sm:p-7 md:border-b-0 md:border-r md:last:border-r-0">

            <div className="text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
                {value}
            </div>

            <div className="mt-1 text-xs font-semibold text-ink-400 sm:text-sm">
                {label}
            </div>

        </div>
    );
}


/* =====================================================
   FEATURE CARD
===================================================== */

function FeatureCard({
    icon,
    title,
    description,
    featured = false
}) {
    return (
        <div
            className={`rounded-3xl border p-7 transition hover:-translate-y-1 hover:shadow-lg ${
                featured
                    ? "border-brand-200 bg-brand-50"
                    : "border-ink-200 bg-[#faf9f7]"
            }`}
        >

            <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
                    featured
                        ? "bg-brand-500 text-white"
                        : "bg-white shadow-sm"
                }`}
            >
                {icon}
            </div>

            <h3 className="mt-6 text-xl font-extrabold tracking-tight text-ink-900">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-ink-500">
                {description}
            </p>

        </div>
    );
}


/* =====================================================
   PREVIEW FILTER
===================================================== */

function PreviewFilter({
    label,
    value
}) {
    return (
        <div className="rounded-xl border border-ink-200 bg-white p-4">

            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-bold text-ink-800">
                {value}
            </p>

        </div>
    );
}


/* =====================================================
   PREVIEW HOSPITAL
===================================================== */

function PreviewHospital({
    rank,
    name,
    location,
    rating,
    price,
    match
}) {
    return (
        <div className="rounded-2xl border border-ink-200 bg-white p-5">

            <div className="flex items-start gap-4">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-black text-brand-700">
                    {rank}
                </div>

                <div className="min-w-0 flex-1">

                    <div className="flex flex-col justify-between gap-2 sm:flex-row">

                        <div>

                            <h4 className="font-extrabold text-ink-900">
                                {name}
                            </h4>

                            <p className="mt-1 text-xs text-ink-400">
                                📍 {location}
                            </p>

                        </div>

                        <span className="self-start rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700">
                            {match}
                        </span>

                    </div>


                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                        <SmallMetric
                            label="Rating"
                            value={`${rating} ★`}
                        />

                        <SmallMetric
                            label="Service"
                            value={price}
                        />

                        <SmallMetric
                            label="Status"
                            value="Available"
                        />

                    </div>

                </div>

            </div>

        </div>
    );
}


/* =====================================================
   SMALL METRIC
===================================================== */

function SmallMetric({
    label,
    value
}) {
    return (
        <div className="rounded-lg bg-[#faf9f7] p-2.5">

            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-400">
                {label}
            </p>

            <p className="mt-1 text-xs font-extrabold text-ink-800">
                {value}
            </p>

        </div>
    );
}


/* =====================================================
   AI FACTOR
===================================================== */

function AiFactor({
    number,
    title,
    description
}) {
    return (
        <div className="flex gap-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-brand-600 shadow-sm">
                {number}
            </div>

            <div>

                <h3 className="text-sm font-extrabold text-ink-900">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-ink-500">
                    {description}
                </p>

            </div>

        </div>
    );
}


/* =====================================================
   METRIC
===================================================== */

function Metric({
    label,
    value
}) {
    return (
        <div className="rounded-xl border border-ink-200 bg-white p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-ink-400">
                {label}
            </p>

            <p className="mt-1 text-sm font-extrabold text-ink-900">
                {value}
            </p>

        </div>
    );
}


/* =====================================================
   REASON
===================================================== */

function Reason({
    text
}) {
    return (
        <div className="flex items-start gap-3">

            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-600">
                ✓
            </span>

            <p className="text-sm leading-5 text-ink-600">
                {text}
            </p>

        </div>
    );
}


/* =====================================================
   STEP
===================================================== */

function Step({
    number,
    icon,
    title,
    description
}) {
    return (
        <div className="relative">

            <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-lg">
                    {icon}
                </div>

                <span className="text-xs font-black text-brand-500">
                    {number}
                </span>

            </div>

            <h3 className="mt-6 text-lg font-extrabold text-ink-900">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-ink-500">
                {description}
            </p>

        </div>
    );
}


/* =====================================================
   DIRECTION POINT
===================================================== */

function DirectionPoint({
    icon,
    title,
    description
}) {
    return (
        <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                {icon}
            </div>

            <div>

                <h3 className="text-sm font-extrabold text-ink-900">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-ink-500">
                    {description}
                </p>

            </div>

        </div>
    );
}


export default Home;