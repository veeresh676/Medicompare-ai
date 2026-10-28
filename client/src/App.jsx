import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";

import Hospitals from "./pages/Hospitals";
import HospitalForm from "./pages/HospitalForm";
import EditHospital from "./pages/EditHospital";
import AdminServices from "./pages/AdminServices";
import AdminImages from "./pages/AdminImages";
import AdminHospitalDetails from "./pages/AdminHospitalDetails";

import HospitalDetails from "./pages/HospitalDetails";

import Compare from "./pages/Compare";
import Profile from "./pages/Profile";
import AiChat from "./pages/AiChat";
import Map from "./pages/Map";
import Recommendations from "./pages/Recommendations";

import Booking from "./pages/Booking";
import BookingStatus from "./pages/BookingStatus";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { startKeepAlive } from "./utils/keepAlive";


const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");

    if (!token || role !== "ADMIN") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};


const UserProtectedRoute = ({ children }) => {
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken");

    const role =
        localStorage.getItem("role") ||
        localStorage.getItem("userRole");

    if (!token || role !== "USER") {
        return <Navigate to="/login" replace />;
    }

    return children;
};


function App() {
    useEffect(() => {
        startKeepAlive();
    }, []);

    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                {/*
                    Legacy admin bookmark: the login page is now
                    unified, so admins sign in through /login too.
                */}
                <Route
                    path="/admin/login"
                    element={<Login />}
                />


                {/* ================= USER ================= */}

                <Route
                    path="/hospitals"
                    element={
                        <UserProtectedRoute>
                            <Hospitals />
                        </UserProtectedRoute>
                    }
                />

                <Route
                    path="/hospitals/:id"
                    element={
                        <UserProtectedRoute>
                            <HospitalDetails />
                        </UserProtectedRoute>
                    }
                />

                <Route
                    path="/compare"
                    element={
                        <UserProtectedRoute>
                            <Compare />
                        </UserProtectedRoute>
                    }
                />

                <Route
                    path="/ai-chat"
                    element={
                        <UserProtectedRoute>
                            <AiChat />
                        </UserProtectedRoute>
                    }
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />

                <Route
                    path="/map"
                    element={
                        <UserProtectedRoute>
                            <Map />
                        </UserProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <UserProtectedRoute>
                            <Profile />
                        </UserProtectedRoute>
                    }
                />

                <Route
                    path="/recommendations"
                    element={
                        <UserProtectedRoute>
                            <Recommendations />
                        </UserProtectedRoute>
                    }
                />


                {/* ================= BOOKING ================= */}

                {/* Create a new appointment */}
                <Route
                    path="/booking"
                    element={
                        <UserProtectedRoute>
                            <Booking />
                        </UserProtectedRoute>
                    }
                />

                {/* View booking status/history */}
                <Route
                    path="/bookings"
                    element={
                        <UserProtectedRoute>
                            <BookingStatus />
                        </UserProtectedRoute>
                    }
                />


                {/* ================= ADMIN ================= */}

                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/bookings"
                    element={
                        <AdminProtectedRoute>
                            <AdminBookings />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/hospitals"
                    element={
                        <AdminProtectedRoute>
                            <Hospitals />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/hospitals/new"
                    element={
                        <AdminProtectedRoute>
                            <HospitalForm />
                        </AdminProtectedRoute>
                    }
                />

                {/*
                    "+ Add Hospital" buttons navigate here. Static
                    segment outranks :hospitalId, so "add" never
                    resolves as a hospital id.
                */}
                <Route
                    path="/admin/hospitals/add"
                    element={
                        <AdminProtectedRoute>
                            <HospitalForm />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/hospitals/:id/edit"
                    element={
                        <AdminProtectedRoute>
                            <EditHospital />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/hospitals/:hospitalId"
                    element={
                        <AdminProtectedRoute>
                            <AdminHospitalDetails />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/services"
                    element={
                        <AdminProtectedRoute>
                            <AdminServices />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin/hospitals/:hospitalId/images"
                    element={
                        <AdminProtectedRoute>
                            <AdminImages />
                        </AdminProtectedRoute>
                    }
                />


                {/* Fallback */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;