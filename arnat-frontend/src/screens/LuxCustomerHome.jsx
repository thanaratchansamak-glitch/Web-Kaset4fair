// src/screens/LuxCustomerHome.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllCars, createBooking } from "../api/carApi";
import "./LuxCustomerHome.css";

export default function LuxCustomerHome() {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick Booking Widget state
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const dayAfter = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
  const [pickupDate, setPickupDate] = useState(tomorrow);
  const [returnDate, setReturnDate] = useState(dayAfter);
  const [selectedCarId, setSelectedCarId] = useState("all");

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingCar, setBookingCar] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [withDriver, setWithDriver] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await getAllCars();
      setCars(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (selectedCarId !== "all") {
      const car = cars.find((c) => c.id === selectedCarId);
      if (car) {
        setBookingCar(car);
        setShowBookingModal(true);
        return;
      }
    }
    // ถ้าเลือกทั้งหมด ให้เลื่อนจอลงไปที่ส่วนรถยอดนิยม
    document.getElementById("popular-cars-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenBooking = (car) => {
    setBookingCar(car);
    setShowBookingModal(true);
    setBookingSuccess(false);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !bookingCar) {
      alert("กรุณากรอกชื่อและเบอร์โทรศัพท์");
      return;
    }

    try {
      await createBooking({
        car_id: bookingCar.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        start_date: pickupDate,
        end_date: returnDate,
        with_driver: withDriver,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setCustomerName("");
        setCustomerPhone("");
      }, 2000);
    } catch (err) {
      alert(err.message || "เกิดข้อผิดพลาดในการจอง");
    }
  };

  // 4 รถยอดนิยม
  const popularCars = cars.slice(0, 4);

  return (
    <div className="lux-customer-page">
      {/* ================= HEADER BAR ================= */}
      <header className="lux-header">
        <div className="lux-header-inner">
          {/* Logo */}
          <Link to="/" className="lux-brand-logo">
            <div className="logo-arch">
              <span className="logo-main">Thanatooth Luxury Drive</span>
              <span className="logo-sub">PREMIUM CAR RENTAL</span>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="lux-nav-menu">
            <Link to="/" className="lux-nav-link active">
              <span className="nav-icon"></span> หน้าแรก
            </Link>
            <div className="nav-dropdown">
              <span className="lux-nav-link">
                 รถยนต์ทั้งหมด <span className="arrow-down"></span>
              </span>
            </div>
            <a href="#promotions" className="lux-nav-link">
               โปรโมชั่น
            </a>
            <a href="#how-to" className="lux-nav-link">
               วิธีการเช่า
            </a>
            <a href="#about" className="lux-nav-link">
              ℹ เกี่ยวกับเรา
            </a>
            <a href="#contact" className="lux-nav-link">
               ติดต่อเรา
            </a>
          </nav>

          {/* Search & Login */}
          <div className="lux-header-actions">
            <button className="btn-search-icon" title="ค้นหา" onClick={() => document.getElementById("quick-widget")?.scrollIntoView({ behavior: "smooth" })}>
              
            </button>
            <button className="btn-login-gold" onClick={() => alert("ระบบสมาชิก LuxDrive Customer Portal")}>
               เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO BANNER ================= */}
      <section className="lux-hero-banner">
        <div className="hero-dark-overlay"></div>
        <div className="hero-inner">
          <div className="hero-text-content">
            <h1 className="hero-title">
              เช่ารถหรู... ขับได้ทุกที่<br />
              ในแบบที่คุณต้องการ
            </h1>
            <p className="hero-quote">
              “LuxDrive บริการเช่ารถระดับพรีเมียม พร้อมดูแลคุณในทุกการเดินทาง”
            </p>
            <button
              className="btn-cta-gold"
              onClick={() => document.getElementById("quick-widget")?.scrollIntoView({ behavior: "smooth" })}
            >
              จองรถเลย 
            </button>
          </div>

          <div className="hero-cursive-tag">Drive Your Dream</div>

          {/* Carousel dots */}
          <div className="carousel-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </section>

      {/* ================= QUICK BOOKING WIDGET ================= */}
      <div className="quick-widget-wrapper" id="quick-widget">
        <form onSubmit={handleQuickSearch} className="quick-booking-card">
          <div className="widget-field">
            <label> วันที่รับรถ</label>
            <div className="input-with-icon">
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="widget-field">
            <label> วันที่คืนรถ</label>
            <div className="input-with-icon">
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="widget-field">
            <label> เลือกรถยนต์</label>
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
            >
              <option value="all">ทั้งหมด</option>
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.model} ({c.series || c.category})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-widget-search">
             ค้นหา
          </button>
        </form>
      </div>

      {/* ================= TRUST BADGES ================= */}
      <section className="trust-badges-bar">
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon-box"></div>
            <div className="trust-desc">
              <strong>รถทุกคันผ่านการตรวจสอบ</strong>
              <span>มาตรฐานระดับสูง</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box"></div>
            <div className="trust-desc">
              <strong>บริการช่วยเหลือฉุกเฉิน</strong>
              <span>ตลอด 24 ชม.</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box"></div>
            <div className="trust-desc">
              <strong>จองง่าย ได้รถไว</strong>
              <span>พร้อมส่งมอบถึงที่</span>
            </div>
          </div>

          <div className="trust-item">
            <div className="trust-icon-box"></div>
            <div className="trust-desc">
              <strong>รถหรู หลากหลายรุ่น</strong>
              <span>Supercar & Luxury Sedan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POPULAR CARS SECTION ================= */}
      <section className="popular-cars-section" id="popular-cars-section">
        <div className="section-head-row">
          <h2 className="section-title">รถยอดนิยม</h2>
          <a href="#all" className="link-view-all">
            ดูรถทั้งหมด 
          </a>
        </div>

        <div className="popular-cars-grid">
          {popularCars.map((car) => (
            <div key={car.id} className="popular-car-card">
              <div className="car-card-image-box">
                <img
                  src={car.image_url}
                  alt={`${car.brand} ${car.model}`}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>

              <div className="car-card-details">
                <h3 className="car-card-name">
                  {car.brand} {car.model}
                </h3>
                <div className="car-card-bottom">
                  <span className="price-tag">
                    เริ่มต้นเพียง <strong>{Number(car.daily_rate).toLocaleString()}.-</strong> / วัน
                  </span>
                  <button
                    className="btn-card-arrow"
                    onClick={() => handleOpenBooking(car)}
                    title="จองรถคันนี้"
                  >
                    
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PROMOTION BANNER ================= */}
      <section className="promotion-banner-section" id="promotions">
        <div className="promo-card">
          <div className="promo-badge-tag">%</div>
          <div className="promo-text-wrap">
            <h3>รับส่วนลดพิเศษ สูงสุด 15%</h3>
            <p>เมื่อจองผ่านเว็บไซต์วันนี้!</p>
          </div>
          <button className="btn-promo-more">
            ดูโปรโมชั่นเพิ่มเติม 
          </button>
        </div>
      </section>

      {/* ================= MODAL: QUICK BOOKING ================= */}
      {showBookingModal && bookingCar && (
        <div className="lux-modal-backdrop" onClick={() => setShowBookingModal(false)}>
          <div className="lux-booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="gold-sub-tag">LUXDRIVE RESERVATION</span>
                <h3>จองรถ {bookingCar.brand} {bookingCar.model}</h3>
              </div>
              <button className="btn-modal-close" onClick={() => setShowBookingModal(false)}>
                
              </button>
            </div>

            {bookingSuccess ? (
              <div className="booking-success-box">
                <div className="success-icon"></div>
                <h4>จองรถยนต์สำเร็จเรียบร้อย!</h4>
                <p>ข้อมูลการจองของคุณถูกส่งเข้าสู่ระบบ LuxDrive เรียบร้อยแล้ว</p>
                <small>เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันการส่งมอบรถ</small>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="lux-modal-form">
                <div className="modal-car-preview">
                  <img src={bookingCar.image_url} alt={bookingCar.model} />
                  <div>
                    <strong>{bookingCar.brand} {bookingCar.model}</strong>
                    <span>{bookingCar.series || bookingCar.category}</span>
                    <span className="modal-rate">
                      ค่าเช่า ฿{Number(bookingCar.daily_rate).toLocaleString()} / วัน
                    </span>
                  </div>
                </div>

                <div className="modal-inputs-grid">
                  <div className="m-field">
                    <label>ชื่อ-นามสกุล ผู้เช่า *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น คุณสมชาย มั่งมี"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <div className="m-field">
                    <label>เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 081-234-5678"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="m-field">
                    <label>วันที่รับรถ</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="m-field">
                    <label>วันที่คืนรถ</label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <label className="m-chauffeur-box">
                  <input
                    type="checkbox"
                    checked={withDriver}
                    onChange={(e) => setWithDriver(e.target.checked)}
                  />
                  <span>เพิ่มบริการคนขับ VIP Chauffeur (+฿5,000 / วัน)</span>
                </label>

                <div className="modal-actions-bar">
                  <button
                    type="button"
                    className="btn-cancel-m"
                    onClick={() => setShowBookingModal(false)}
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn-confirm-gold">
                    ยืนยันการจองรถ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

