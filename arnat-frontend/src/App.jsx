// src/App.jsx - Thanatooth Luxury Drive Multi-Page React Application
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// นำเข้าครบทั้ง 8 หน้าตามเกณฑ์สถาปัตยกรรม React Router
import HomePage from "./pages/HomePage";
import FleetPage from "./pages/FleetPage";
import BrandsPage from "./pages/BrandsPage";
import CarDetailPage from "./pages/CarDetailPage";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import EditBookingPage from "./pages/EditBookingPage";
import AboutPage from "./pages/AboutPage";
import PaymentPage from "./pages/PaymentPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import TrackingPage from "./pages/TrackingPage";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="lux-app-shell">
        {/* Navbar จะแสดงอยู่ด้านบนสุดของทุกหน้า */}
        <Navbar />

        {/* Dynamic Route Viewports */}
        <main className="lux-main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/fleet/:id" element={<CarDetailPage />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/edit-booking/:id" element={<EditBookingPage />} />
            <Route path="/payment/:id" element={<PaymentPage />} />
            <Route path="/tracking/:id" element={<TrackingPage />} />
            <Route path="/admin" element={<AdminBookingsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/about" element={<AboutPage />} />
            {/* Fallback to Home if unknown path */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {/* Footer ด้านล่างสุด */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
