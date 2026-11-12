// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { initialCars } from "../data/cars";
import "./HomePage.css";

export default function HomePage() {
  // Hero Standalone 3D Car Showcase (รถไม่มีพื้นหลัง จอดโดดเด่นสมจริง 5 คัน สลับเปลี่ยนอัตโนมัติ)
  const heroStandaloneCars = [
    {
      id: "hero-car-1",
      name: "BMW X5 xDrive M Sport",
      category: "Luxury Performance SUV",
      tagline: "489 HP • Adaptive Air Suspension",
      dailyRate: 24000,
      image: "/images/cars/bmw-x5.png",
      brandLogo: "/images/brands/bmw.svg",
    },
    {
      id: "hero-car-2",
      name: "Lexus LX 600 VIP",
      category: "Flagship Luxury SUV",
      tagline: "409 HP • Supreme V6 Twin-Turbo",
      dailyRate: 45000,
      image: "/images/cars/lexus-lx-600.png",
      brandLogo: "/images/brands/lexus.svg",
    },
    {
      id: "hero-car-3",
      name: "Lexus LM 350h Executive",
      category: "Ultra-Luxury First-Class Lounge",
      tagline: "250 HP • Ottoman Captain Seats",
      dailyRate: 32000,
      image: "/images/cars/lexus-lm-350h.png",
      brandLogo: "/images/brands/lexus.svg",
    },
    {
      id: "hero-car-4",
      name: "Toyota Crown Crossover",
      category: "Flagship Prestige Sedan",
      tagline: "349 HP • Dual Boost Hybrid",
      dailyRate: 12000,
      image: "/images/cars/toyota-crown.png",
      brandLogo: "/images/brands/toyota.svg",
    },
    {
      id: "hero-car-5",
      name: "Toyota Alphard VIP Lounge",
      category: "Presidential Chauffeur Van",
      tagline: "250 HP • First-Class Travel",
      dailyRate: 20000,
      image: "/images/cars/toyota-alphard.png",
      brandLogo: "/images/brands/toyota.svg",
    },
  ];

  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Auto-switch hero car every 4.5 seconds
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroStandaloneCars.length);
    }, 4500);
    return () => clearInterval(heroTimer);
  }, [heroStandaloneCars.length]);

  // Featured flagship fleet for showcase (representative cars)
  const featuredCars = initialCars.filter((car) =>
    ["car-01", "car-02", "car-11", "car-16"].includes(car.id)
  );

  // Slider state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % featuredCars.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredCars.length]);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? featuredCars.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % featuredCars.length);
  };

  const activeFeaturedCar = featuredCars[currentSlideIndex] || initialCars[0];
  const activeHeroCar = heroStandaloneCars[heroSlideIndex];

  return (
    <div className="home-page-root">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="home-hero-section">
        <div className="home-hero-bg-overlay"></div>
        <div className="home-hero-container">
          <div className="home-hero-content">
            <div className="hero-top-badge">
              <span>EXOTIC & LUXURY CAR RENTAL IN THAILAND</span>
            </div>

            <h1 className="home-hero-title">
              <span className="gold-shimmer-text">Beyond Just Driving</span>
            </h1>

            <p className="home-hero-subtitle">
              Experience the pinnacle of automotive prestige with Thanatooth Luxury Drive. Hand-curated supercars, executive sedans, and high-performance SUVs delivered directly to your doorstep.
            </p>

            <div className="home-hero-cta-row">
              <Link to="/fleet" className="btn-explore-fleet-gold">
                <span>Explore Our Fleet</span>
                <span className="btn-arrow"></span>
              </Link>
              <Link to="/about" className="btn-learn-more-outline">
                <span>Our Services</span>
              </Link>
            </div>
          </div>

          {/* Hero Banner Graphic - Standalone Transparent 3D Car Showcase (รถไม่มีพื้นหลัง จอดโดดเด่นเข้ากับพื้นหลังเว็บ) */}
          <div className="home-hero-graphic">
            <div className="hero-model-stage">
              {/* Radial showroom glow behind the car */}
              <div className="hero-model-ambient-glow"></div>

              {/* Realistic Ground Floor Shadows (เงาสะท้อนใต้ท้องรถเหมือนจอดบนพื้นจริง) */}
              <div className="hero-model-ground-shadow"></div>
              <div className="hero-model-contact-shadow"></div>

              {/* Cars Transition Container */}
              <div className="hero-model-carousel-track">
                {heroStandaloneCars.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`hero-model-car-item ${idx === heroSlideIndex ? "active" : ""}`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="hero-model-transparent-img"
                    />
                  </div>
                ))}
              </div>

              {/* Floating Luxury Car Info Pill */}
              <div className="hero-model-floating-info">
                <div className="hero-model-info-left">
                  <img
                    src={activeHeroCar.brandLogo}
                    alt="Brand"
                    className="hero-model-brand-logo"
                  />
                  <div>
                    <h3 className="hero-model-title">{activeHeroCar.name}</h3>
                    <p className="hero-model-subtitle">{activeHeroCar.tagline}</p>
                  </div>
                </div>
                <div className="hero-model-info-right">
                  <span className="hero-model-price-label">Daily Rental</span>
                  <span className="hero-model-price-val">฿{activeHeroCar.dailyRate?.toLocaleString()}</span>
                </div>
              </div>

              {/* Slider Indicator Dots */}
              <div className="hero-model-dots">
                {heroStandaloneCars.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    className={`hero-model-dot ${dotIdx === heroSlideIndex ? "active" : ""}`}
                    onClick={() => setHeroSlideIndex(dotIdx)}
                    title={`View car model ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. FEATURED FLEET (IMAGE SLIDER) ================= */}
      <section className="home-featured-section">
        <div className="home-container">
          <div className="section-header-row">
            <div>
              <span className="section-tag-gold">FEATURED VEHICLES</span>
              <h2 className="section-title">Flagship Selections of the Week</h2>
            </div>
            <Link to="/fleet" className="btn-view-all-link">
              View All {initialCars.length} Fleet Models
            </Link>
          </div>

          {/* Slider Container */}
          <div className="featured-slider-card">
            <div className="slider-photo-wrapper">
              <img src={activeFeaturedCar.imageUrl}
                alt={`${activeFeaturedCar.brand} ${activeFeaturedCar.model}`}
                className="featured-slide-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = activeFeaturedCar.fallbackImageUrl || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80";
                }}
              />
              <div className="featured-badges-overlay">
                <span className="f-tag brand">{activeFeaturedCar.brand}</span>
                <span className="f-tag category">{activeFeaturedCar.category}</span>
                <span className="f-tag year">{activeFeaturedCar.year}</span>
              </div>

              {/* Slider Arrow Buttons */}
              <button type="button"
                className="slider-arrow left"
                onClick={handlePrevSlide}
                aria-label="Previous Slide"
              >

              </button>
              <button type="button"
                className="slider-arrow right"
                onClick={handleNextSlide}
                aria-label="Next Slide"
              >

              </button>
            </div>

            {/* Slider Info Content */}
            <div className="slider-info-col">
              <div className="featured-car-header">
                <span className="f-brand-sub">{activeFeaturedCar.brand}</span>
                <h3 className="f-model-name">{activeFeaturedCar.model}</h3>
                <p className="f-car-desc">{activeFeaturedCar.description}</p>
              </div>

              {/* Specs Pills */}
              <div className="f-specs-grid">
                <div className="f-spec-box">
                  <span className="f-spec-label">Power</span>
                  <strong className="f-spec-val">{activeFeaturedCar.specs.horsepower}</strong>
                </div>
                <div className="f-spec-box">
                  <span className="f-spec-label">0-100 km/h</span>
                  <strong className="f-spec-val">{activeFeaturedCar.specs.acceleration}</strong>
                </div>
                <div className="f-spec-box">
                  <span className="f-spec-label">Transmission</span>
                  <strong className="f-spec-val">{activeFeaturedCar.specs.transmission}</strong>
                </div>
                <div className="f-spec-box">
                  <span className="f-spec-label">Capacity</span>
                  <strong className="f-spec-val">{activeFeaturedCar.specs.seats} Seats</strong>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="f-pricing-cta-row">
                <div className="f-price-box">
                  <span className="f-price-sub">Starting Rate</span>
                  <div className="f-price-num">
                    ฿{activeFeaturedCar.dailyRate.toLocaleString()}
                    <small> / day</small>
                  </div>
                </div>

                <div className="f-actions-group">
                  <Link to={`/fleet/${activeFeaturedCar.id}`}
                    className="btn-f-details"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/book/${activeFeaturedCar.id}`}
                    className="btn-f-book-gold"
                  >
                    Reserve Now ➔
                  </Link>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="slider-dots-row">
                {featuredCars.map((car, index) => (
                  <button key={car.id}
                    type="button"
                    className={`dot-btn ${index === currentSlideIndex ? "active" : ""}`}
                    onClick={() => setCurrentSlideIndex(index)}
                    aria-label={`Go to slide ${car.model}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. SERVICES HIGHLIGHT ================= */}
      <section className="home-services-section">
        <div className="home-container">
          <div className="services-title-center">
            <span className="section-tag-gold">PREMIUM SERVICES</span>
            <h2 className="section-title">World-Class Hospitality & Standards</h2>
            <p className="section-subtitle">
              Designed for distinguished clientele who prioritize time, privacy, and impeccable service.
            </p>
          </div>

          <div className="services-cards-grid">
            <div className="service-card">
              <h3>VIP Airport Chauffeur & Meet</h3>
              <p>
                Direct tarmac or VIP Arrival Hall delivery at Suvarnabhumi and Don Mueang airports with dedicated luggage concierge.
              </p>
            </div>

            <div className="service-card">
              <h3>Comprehensive Full Coverage</h3>
              <p>
                Complete peace of mind with 100% comprehensive commercial coverage, zero hidden liability, and 24/7 dedicated roadside response.
              </p>
            </div>

            <div className="service-card">
              <h3>Executive Chauffeur Service</h3>
              <p>
                Discreet, multilingual professional drivers certified in VIP protocol, defensive driving, and utmost route precision.
              </p>
            </div>

            <div className="service-card">
              <h3>Mint Condition & Sanitized</h3>
              <p>
                Every vehicle undergoes a rigorous 150-point technical inspection, professional ceramic detailing, and multi-stage sanitization.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
