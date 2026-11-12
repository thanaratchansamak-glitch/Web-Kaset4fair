// src/pages/CarDetailPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { initialCars } from "../data/cars";
import "./CarDetailPage.css";

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  //  Find car by id

  const car = initialCars.find((item) => item.id === id) || initialCars[0];

  const handleReserveClick = () => {
    navigate(`/book/${car.id}`, { state: { selectedCar: car } });
  };

  return (
    <div className="car-detail-page-root">
      {/* Breadcrumb Navigation */}
      <div className="detail-breadcrumb-bar">
        <div className="detail-container">
          <Link to="/" className="b-link">Home</Link>
          <span className="b-sep">/</span>
          <Link to="/fleet" className="b-link">All Fleet</Link>
          <span className="b-sep">/</span>
          <span className="b-current">{car.brand} {car.model}</span>
        </div>
      </div>

      <div className="detail-container main-content-wrap">
        {/* Top Header Row */}
        <div className="detail-header-row">
          <div className="title-left-col">
            <div className="detail-badges-group">
              <span className="badge-gold-brand">{car.brand}</span>
              <span className="badge-cat-outline">{car.category}</span>
              <span className="badge-year-solid">Model Year {car.year}</span>
            </div>
            <h1 className="detail-car-title">{car.brand} {car.model}</h1>
            <p className="detail-car-color">Exterior Finish: <strong>{car.color}</strong></p>
          </div>

          <div className="header-price-col">
            <span className="price-tag-sub">Exclusive Daily Rate</span>
            <div className="price-big-num">
              ฿{car.dailyRate.toLocaleString()}
              <small> / day</small>
            </div>
            <span className="deposit-note">Refundable Security Deposit: ฿{car.deposit.toLocaleString()} (100% Returnable)</span>
          </div>
        </div>

        {/* 2-Columns Layout: Left = Large Photos & Gallery, Right = Specs & Booking Card */}
        <div className="detail-split-grid">
          {/* ================= LEFT: LARGE PHOTOS & DETAILS ================= */}
          <div className="detail-photos-col">
            <div className="photo-view-main-card">
              <img src={car.imageUrl}
                alt={`${car.brand} ${car.model}`}
                className="main-large-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = car.fallbackImageUrl || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>

            {/* Car Description Text */}
            <div className="car-about-desc-card">
              <h3>Masterpiece Vehicle Highlights</h3>
              <p>{car.description}</p>
              <div className="service-included-box">
                <h4>Included with Every Rental Experience:</h4>
                <ul>
                  <li>100% Comprehensive First-Class Insurance (Zero Excess Options)</li>
                  <li>24/7 Dedicated Concierge & Emergency Roadside Response</li>
                  <li>White-Glove VIP Delivery with Full Tank of Fuel</li>
                  <li>Multi-Stage Detailing, Sanitization & Ceramic Protection</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: TECHNICAL SPECS & RESERVE CARD ================= */}
          <div className="detail-sidebar-col">
            {/* Sticky Reservation Summary Card */}
            <div className="sidebar-reserve-card">
              <div className="reserve-card-header">
                <h3>Reservation Summary</h3>
                <span className="car-avail-badge">Ready for Immediate Handover</span>
              </div>

              <div className="reserve-calc-preview">
                <div className="calc-row">
                  <span>Daily Rental Rate</span>
                  <strong>฿{car.dailyRate.toLocaleString()} / day</strong>
                </div>
                <div className="calc-row">
                  <span>Refundable Security Deposit</span>
                  <strong>฿{car.deposit.toLocaleString()}</strong>
                </div>
                <div className="calc-row highlight">
                  <span>First-Class Insurance</span>
                  <span className="free-tag">Complimentary Included</span>
                </div>
              </div>

              {/* Configure & Reserve Button */}
              <button type="button"
                className="btn-reserve-vehicle-gold"
                onClick={handleReserveClick}
              >
                <span>Configure & Reserve</span>
                <span className="arrow-btn"></span>
              </button>

              <Link to="/fleet" className="btn-back-to-fleet">
                ← Return to Fleet Overview
              </Link>
            </div>

            {/* Detailed Technical Specs Table */}
            <div className="specs-table-card">
              <h3 className="specs-table-title">Comprehensive Technical Specifications</h3>
              <div className="specs-list">
                <div className="spec-item-row">
                  <span className="spec-name">Engine / Powertrain</span>
                  <span className="spec-data">{car.specs.engine || "High Performance Engine"}</span>
                </div>
                <div className="spec-item-row">
                  <span className="spec-name">Horsepower Output</span>
                  <span className="spec-data gold">{car.specs.horsepower}</span>
                </div>
                <div className="spec-item-row">
                  <span className="spec-name">0-100 km/h Acceleration</span>
                  <span className="spec-data gold">{car.specs.acceleration}</span>
                </div>
                <div className="spec-item-row">
                  <span className="spec-name">Top Speed</span>
                  <span className="spec-data">{car.specs.topSpeed || "250+ km/h"}</span>
                </div>
                <div className="spec-item-row">
                  <span className="spec-name">Transmission</span>
                  <span className="spec-data">{car.specs.transmission}</span>
                </div>
                <div className="spec-item-row">
                  <span className="spec-name">Seating Capacity</span>
                  <span className="spec-data">{car.specs.seats} Seats</span>
                </div>
                <div className="spec-item-row">
                  <span className="spec-name">Luggage Volume</span>
                  <span className="spec-data">{car.specs.luggageCapacity || "450 Liters"}</span>
                </div>
                <div className="spec-item-row">
                  <span className="spec-name">Fuel / Energy Type</span>
                  <span className="spec-data">{car.specs.fuelType || "Petrol 95"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
