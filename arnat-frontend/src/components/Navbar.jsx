// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import "./Navbar.css";

export default function Navbar() {
  const [bookingCount, setBookingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  //  อัปเดตจำนวนการจองสดจาก localStorage

  const updateCount = () => {
    const list = bookingService.getAll();
    setBookingCount((prev) => (prev !== list.length ? list.length : prev));
  };

  useEffect(() => {
    updateCount();
    // ฟังการเปลี่ยนแปลงใน localStorage หรือเมื่อ route เปลี่ยน
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, [location.pathname]);

  // ปิด mobile menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="lux-site-header">
      <div className="lux-header-inner">
        {/* Brand Logo */}
        <Link to="/" className="lux-brand-link" title="Thanatooth Luxury Auto Home">
          <div className="lux-logo-crest">
            <img src="/images/logo.jpg"
              alt="Thanatooth Luxury Auto Logo"
              className="lux-brand-logo-img"
            />
          </div>
          <div className="lux-brand-text">
            <span className="brand-primary-name">Thanatooth</span>
            <span className="brand-secondary-name">LUXURY AUTO</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className={`lux-nav-menu ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
          >
            Home
          </NavLink>

          <NavLink
            to="/fleet"
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
          >
            All Fleet
          </NavLink>

          <NavLink
            to="/brands"
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
          >
            Brands
          </NavLink>

          <NavLink
            to="/my-bookings"
            className={({ isActive }) => `nav-link-item my-bookings-link ${isActive ? "active" : ""}`}
          >
            My Bookings
            {bookingCount > 0 && (
              <span className="navbar-badge-count">{bookingCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
          >
            About Us
          </NavLink>
        </nav>

        {/* Right CTA */}
        <div className="lux-header-cta-group">
          <Link to="/fleet" className="btn-navbar-cta-gold">
            <span>Reserve Vehicle</span>
            <span className="arrow-sym">➔</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? "" : ""}
          </button>
        </div>
      </div>
    </header>
  );
}

