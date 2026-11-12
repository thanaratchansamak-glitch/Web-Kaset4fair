// src/screens/LuxuryRentalApp.jsx
import { useState, useMemo } from "react";
import { initialCars } from "../data/cars";
import { bookingService } from "../services/bookingService";
import BookingFormModal from "../components/BookingFormModal";
import MyBookingsView from "../components/MyBookingsView";
import "./LuxuryRentalApp.css";

export default function LuxuryRentalApp() {
  const [activeTab, setActiveTab] = useState("showroom"); // 'showroom' | 'my-bookings'
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarForBooking, setSelectedCarForBooking] = useState(null);

  // รายการการจองของฉัน
  const bookingsCount = bookingService.getAll().length;

  // แบรนด์รถยนต์หรู 5 แบรนด์
  const brandPills = [
    { id: "All", name: "รถหรูทั้งหมด", sub: "(ดูทั้งหมด)", icon: "" },
    { id: "Porsche", name: "Porsche", sub: "(ดูเพิ่มเติม)", icon: "" },
    { id: "BMW", name: "BMW", sub: "(ดูเพิ่มเติม)", icon: "" },
    { id: "Mercedes-Benz", name: "Mercedes-Benz", sub: "(ดูเพิ่มเติม)", icon: "" },
    { id: "Audi", name: "Audi", sub: "(ดูเพิ่มเติม)", icon: "" },
    { id: "Lexus", name: "Lexus", sub: "(ดูเพิ่มเติม)", icon: "" },
  ];

  // กรองรถยนต์ตามแท็บแบรนด์และคำค้นหา (ค้นหาได้ทั้งชื่อแบรนด์, รุ่นรถ, ประเภทรถ)
  const filteredCars = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return initialCars.filter((car) => {
      const matchBrand = selectedBrand === "All" || car.brand.toLowerCase() === selectedBrand.toLowerCase();
      if (!term) return matchBrand;

      const matchSearch =
        car.model.toLowerCase().includes(term) ||
        car.brand.toLowerCase().includes(term) ||
        car.category.toLowerCase().includes(term) ||
        `${car.brand} ${car.model}`.toLowerCase().includes(term);

      return matchBrand && matchSearch;
    });
  }, [selectedBrand, searchTerm]);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val.trim() && selectedBrand !== "All") {
      const matchWithinBrand = initialCars.some(
        (c) =>
          c.brand.toLowerCase() === selectedBrand.toLowerCase() &&
          (c.model.toLowerCase().includes(val.toLowerCase()) ||
            c.brand.toLowerCase().includes(val.toLowerCase()))
      );
      if (!matchWithinBrand) {
        setSelectedBrand("All");
      }
    }
    if (activeTab !== "showroom") {
      setActiveTab("showroom");
    }
  };

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (activeTab !== "showroom") setActiveTab("showroom");
    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenBooking = (car) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dayAfter = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
    setSelectedCarForBooking({
      ...car,
      initialStart: tomorrow,
      initialEnd: dayAfter,
      initialLocation: "สนามบินสุวรรณภูมิ (VIP Lounge)",
    });
  };

  const handleBookingSuccess = () => {
    setActiveTab("my-bookings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="lux-portal-root">
      {/* ================= 1. HEADER & NAVBAR ================= */}
      <header className="lux-top-header">
        <div className="lux-header-container">
          {/* Logo */}
          <div className="lux-logo-wrap" onClick={() => { setActiveTab("showroom"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <div className="lux-logo-arch">
              <span className="lux-brand-text">Thanatooth Luxury Drive</span>
              <span className="lux-sub-brand">EXOTIC & SUPERCAR RENTAL</span>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="lux-nav-bar">
            <button
              className={`nav-btn-pill ${activeTab === "showroom" && !searchTerm ? "active" : ""}`}
              onClick={() => {
                setActiveTab("showroom");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span className="n-icon"></span> หน้าหลัก
            </button>
            <div className="nav-dropdown-item">
              <button
                className="nav-btn-pill"
                onClick={() => {
                  setActiveTab("showroom");
                  document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className="n-icon"></span> รถยนต์ทั้งหมด <span className="down-arrow"></span>
              </button>
            </div>
            <button
              className={`nav-btn-pill ${activeTab === "my-bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("my-bookings")}
            >
              <span className="n-icon"></span> การจองของฉัน
              {bookingsCount > 0 && <span className="nav-count-badge">{bookingsCount}</span>}
            </button>
            <a href="#promos" className="nav-btn-pill" onClick={() => setActiveTab("showroom")}>
              <span className="n-icon"></span> โปรโมชั่น
            </a>
            <a href="#about" className="nav-btn-pill" onClick={() => setActiveTab("showroom")}>
              <span className="n-icon">ℹ</span> เกี่ยวกับเรา
            </a>
            <a href="#contact" className="nav-btn-pill" onClick={() => setActiveTab("showroom")}>
              <span className="n-icon"></span> ติดต่อเรา
            </a>
          </nav>

          {/* Header Search Form & User Actions */}
          <div className="lux-header-right-group">
            <form onSubmit={handleHeaderSearch} className="lux-header-search-form">
              <div className="header-search-input-wrap">
                <span className="h-search-icon"></span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อรถ, รุ่นรถ (เช่น 911, M4, Porsche)..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  aria-label="ค้นหารถยนต์"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="h-search-clear-btn"
                    onClick={() => setSearchTerm("")}
                    title="ล้างคำค้นหา"
                  >
                    
                  </button>
                )}
              </div>
              <button type="submit" className="btn-header-search-gold">
                <span>ค้นหารถ</span>
              </button>
            </form>

            <div className="lux-user-actions">
              <button
                className="user-profile-circle-btn"
                title="การจองของฉัน"
                onClick={() => setActiveTab("my-bookings")}
              >
                
              </button>
              <button
                className="btn-header-login-outline"
                onClick={() => alert("ระบบสมาชิก Thanatooth Luxury Drive")}
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= VIEW 1: SHOWROOM & HOMEPAGE ================= */}
      {activeTab === "showroom" && (
        <main className="lux-main-showroom">
          {/* Hero Banner Section */}
          <section className="lux-hero-section">
            <div className="hero-dark-vignette"></div>
            <div className="hero-content-wrapper">
              <div className="hero-text-col">
                <h1 className="hero-big-title">
                  เช่ารถหรู...<br />
                  <span>ได้มากกว่าการเดินทาง</span>
                </h1>
                <p className="hero-quote-text">
                  “Thanatooth Luxury Drive — สัมผัสประสบการณ์เหนือระดับ กับรถหรูหลากหลายรุ่น พร้อมบริการระดับพรีเมียม”
                </p>
                <button
                  className="btn-hero-cta-gold"
                  onClick={() => document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  จองเลยวันนี้ 
                </button>

                {/* Carousel Indicator Dots */}
                <div className="hero-dots-row">
                  <span className="h-dot active"></span>
                  <span className="h-dot"></span>
                  <span className="h-dot"></span>
                </div>
              </div>

              {/* Cursive Tag */}
              <div className="hero-cursive-tag">Thanatooth Luxury Drive</div>
            </div>
          </section>

          {/* Brand Pills Row (แถบหมวดหมู่แบรนด์ทรงแคปซูลหรู) */}
          <section className="brand-pills-section">
            <div className="lux-container">
              <div className="brand-pills-row">
                <div className="brand-pills-scroll">
                  {brandPills.map((b) => (
                    <button
                      key={b.id}
                      className={`brand-capsule-btn ${selectedBrand === b.id ? "active" : ""}`}
                      onClick={() => setSelectedBrand(b.id)}
                    >
                      <span className="capsule-icon">{b.icon}</span>
                      <div className="capsule-text">
                        <strong>{b.name}</strong>
                        <small>{b.sub}</small>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  className="btn-view-more-brands"
                  onClick={() => setSelectedBrand("All")}
                >
                  ดูเพิ่มเติม 
                </button>
              </div>
            </div>
          </section>

          {/* Car Showcase Section ("รถหรูแนะนำ") */}
          <section className="cars-showcase-section" id="catalog-section">
            <div className="lux-container">
              <div className="showcase-header-row">
                <div className="showcase-title-wrap">
                  <span className="gold-bar-accent">|</span>
                  <h2>{selectedBrand === "All" ? "รถหรูแนะนำ" : `รถหรูแบรนด์ ${selectedBrand}`}</h2>
                  <span className="cars-counter-pill">({filteredCars.length} คัน)</span>
                </div>

                <div className="showcase-header-right-actions">
                  {searchTerm && (
                    <div className="showcase-search-tag">
                      <span>ผลการค้นหา: <strong>"{searchTerm}"</strong></span>
                      <button onClick={() => setSearchTerm("")} title="ล้างคำค้นหา"></button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid of Cars (15 คัน) or Empty Search State */}
              {filteredCars.length === 0 ? (
                <div className="no-cars-found-card">
                  <div className="no-cars-icon"></div>
                  <h3>ไม่พบรถยนต์ที่ตรงกับคำค้นหา "{searchTerm}"</h3>
                  <p>ท่านสามารถค้นหาด้วยชื่อแบรนด์ (เช่น Porsche, BMW, Mercedes-Benz, Audi, Lexus) หรือชื่อรุ่น เช่น 911, M4, S-Class, R8, LC 500</p>
                  <button
                    className="btn-reset-search-gold"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedBrand("All");
                    }}
                  >
                    ดูรถหรูทั้งหมด (15 คัน)
                  </button>
                </div>
              ) : (
                <div className="cars-grid-showcase">
                  {filteredCars.map((car, index) => {
                    const isTopPick = index % 2 === 0;
                    return (
                      <div key={car.id} className="car-lux-card">
                        {/* Image Thumbnail */}
                        <div className="card-thumb-container">
                          <img
                            src={car.imageUrl}
                            alt={`${car.brand} ${car.model}`}
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          {/* Badges */}
                          <div className="card-badges-floating">
                            {isTopPick ? (
                              <span className="badge-flt popular"> ยอดนิยม</span>
                            ) : (
                              <span className="badge-flt recommend"> แนะนำ</span>
                            )}
                            <span className="badge-flt category">{car.category}</span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="card-lux-body">
                          <div className="card-title-group">
                            <span className="brand-sub-lbl">{car.brand}</span>
                            <h3 className="model-main-title">{car.model}</h3>
                          </div>

                          {/* Specs Mini Icons */}
                          <div className="specs-mini-bar">
                            <span> {car.specs.horsepower}</span>
                            <span> {car.specs.acceleration}</span>
                            <span> {car.specs.transmission.split(" ")[0]}</span>
                            <span> {car.specs.seats} ที่นั่ง</span>
                          </div>

                          {/* Pricing & Arrow Button */}
                          <div className="card-bottom-bar">
                            <div className="price-stack">
                              <span className="rate-prefix">เริ่มต้นเพียง</span>
                              <div className="price-number">
                                <strong>฿{car.dailyRate.toLocaleString()}</strong>
                                <small>.- / วัน</small>
                              </div>
                            </div>

                            <button
                              className="btn-circle-arrow-action"
                              onClick={() => handleOpenBooking(car)}
                              title="จองรถคันนี้"
                            >
                              
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Bottom Trust Badges (4 ด้าน ตรงตามภาพ Mockup) */}
          <section className="lux-trust-badges-bar">
            <div className="lux-container">
              <div className="trust-four-grid">
                <div className="trust-card-item">
                  <div className="t-icon-box"></div>
                  <div className="t-desc-box">
                    <strong>มั่นใจได้ ปลอดภัยทุกการเดินทาง</strong>
                    <span>ด้วยประกันภัยชั้น 1</span>
                  </div>
                </div>

                <div className="trust-card-item">
                  <div className="t-icon-box"></div>
                  <div className="t-desc-box">
                    <strong>บริการช่วยเหลือฉุกเฉิน</strong>
                    <span>ตลอด 24 ชั่วโมง</span>
                  </div>
                </div>

                <div className="trust-card-item">
                  <div className="t-icon-box"></div>
                  <div className="t-desc-box">
                    <strong>รถหรู สภาพเยี่ยม</strong>
                    <span>พร้อมให้บริการ</span>
                  </div>
                </div>

                <div className="trust-card-item">
                  <div className="t-icon-box"></div>
                  <div className="t-desc-box">
                    <strong>ประสบการณ์การเช่าระดับพรีเมียม</strong>
                    <span>ที่คุณวางใจ</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Luxury Footer */}
          <footer className="lux-footer-bar">
            <div className="lux-container footer-content-wrap">
              <div className="footer-brand-info">
                <span className="footer-logo-text">Thanatooth Luxury Drive</span>
                <p>ศูนย์รวมบริการเช่ารถหรู ซูเปอร์คาร์ และสปอร์ตคาร์ระดับเวิลด์คลาสในประเทศไทย</p>
              </div>
              <div className="footer-copyright">
                © 2026 Thanatooth Luxury Drive. All Rights Reserved.
              </div>
            </div>
          </footer>
        </main>
      )}

      {/* ================= VIEW 2: MY BOOKINGS (CRUD DASHBOARD) ================= */}
      {activeTab === "my-bookings" && (
        <MyBookingsView onGoToShowroom={() => setActiveTab("showroom")} />
      )}

      {/* Booking Form Modal */}
      {selectedCarForBooking && (
        <BookingFormModal
          car={selectedCarForBooking}
          onClose={() => setSelectedCarForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
