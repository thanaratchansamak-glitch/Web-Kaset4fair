// src/pages/BookingPage.jsx - Porsche Configurator-Inspired Luxury Booking Experience
import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { initialCars } from "../data/cars";
import { bookingService } from "../services/bookingService";
import "./BookingPage.css";

//  Showroom Locations for Self-Pickup Option

const SHOWROOM_LOCATIONS = [
  {
    id: "rama9",
    name: "Thanatooth Flagship Center (Rama 9)",
    detail: "Rama 9 Road, Bang Kapi, Huai Khwang, Bangkok 10310 (HQ)",
    badge: "Flagship Showroom",
  },
  {
    id: "suvarnabhumi",
    name: "Suvarnabhumi Airport VIP Arrival Lounge",
    detail: "Passenger Terminal 2nd Floor, Gate 4 (Meet & Greet Concierge)",
    badge: "Airport VIP Hub",
  },
  {
    id: "donmueang",
    name: "Don Mueang Airport VIP Terminal",
    detail: "Private Jet Terminal & VIP Arrival Gate",
    badge: "Private Aviation Hub",
  },
  {
    id: "paragon",
    name: "Siam Paragon Exclusive Valet Lounge",
    detail: "Level B1, Pillar G12, Pathum Wan, Bangkok",
    badge: "City Center Valet",
  },
  {
    id: "iconsiam",
    name: "ICONSIAM Luxury Lounge",
    detail: "Iconluxe Level G, Charoen Nakhon Road, Bangkok",
    badge: "Riverside Luxury Lounge",
  },
];

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  //  Find vehicle by ID or default to first car

  const car = initialCars.find((c) => c.id === id) || initialCars[0];

  //  Configurator Interactive States

  const [activeSection, setActiveSection] = useState("options"); // 'options' | 'dates' | 'client' | 'summary'
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  //  Form State

  const defaultStart = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const defaultEnd = new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];

  //  Handover selection states (Showroom vs Direct Delivery)

  const [deliveryType, setDeliveryType] = useState("showroom"); // 'showroom' | 'delivery'
  const [selectedShowroom, setSelectedShowroom] = useState("Thanatooth Flagship Center (Rama 9)");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    driverLicense: "",
    startDate: defaultStart,
    endDate: defaultEnd,
    withDriver: false,
    premiumInsurance: false,
    tireGlassProtection: false, // การคุ้มครองยางและกระจกพิเศษ
    lossOfUseCoverage: false,   // คุ้มครองการเสียโอกาสใช้งานรถ
    vipDelivery: true,
    childSeat: false,
    wifiHotspot: true,
    specialRequests: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  //  Real-time Pricing Calculation

  const { totalDays, baseRent, driverFee, insuranceFee, tireGlassFee, lossOfUseFee, deliveryFee, totalPrice } = useMemo(() => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const base = diffDays * car.dailyRate;
    const driver = formData.withDriver ? diffDays * 3000 : 0;
    const insurance = formData.premiumInsurance ? diffDays * 2000 : 0;
    const tireGlass = formData.tireGlassProtection ? diffDays * 1000 : 0;
    const lossOfUse = formData.lossOfUseCoverage ? diffDays * 1500 : 0;
    const delivery = deliveryType === "delivery" ? 2000 : 0; // ส่งถึงบ้าน 2,000 บาท

    return {
      totalDays: diffDays,
      baseRent: base,
      driverFee: driver,
      insuranceFee: insurance,
      tireGlassFee: tireGlass,
      lossOfUseFee: lossOfUse,
      deliveryFee: delivery,
      totalPrice: base + driver + insurance + tireGlass + lossOfUse + delivery,
    };
  }, [
    formData.startDate,
    formData.endDate,
    formData.withDriver,
    formData.premiumInsurance,
    formData.tireGlassProtection,
    formData.lossOfUseCoverage,
    deliveryType,
    car.dailyRate,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = () => {
    setFormData({
      customerName: "",
      phone: "",
      email: "",
      driverLicense: "",
      startDate: defaultStart,
      endDate: defaultEnd,
      withDriver: false,
      premiumInsurance: false,
      vipDelivery: true,
      childSeat: false,
      wifiHotspot: true,
      specialRequests: "",
    });
    setDeliveryType("showroom");
    setSelectedShowroom("Thanatooth Flagship Center (Rama 9)");
    setDeliveryAddress("");
    setErrorMsg("");
  };

  const currentPickupLocation =
    deliveryType === "showroom"
      ? `Showroom: ${selectedShowroom}`
      : `Direct Delivery: ${deliveryAddress.trim()}`;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      setErrorMsg("Please provide your delivery destination address (ระบุที่อยู่สำหรับจัดส่งรถ).");
      setActiveSection("dates");
      return;
    }

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.driverLicense.trim()) {
      setErrorMsg("Please complete all required fields: Full Name, Contact Phone, and Driver's License / Passport.");
      setActiveSection("client");
      return;
    }

    const createdBooking = bookingService.create({
      carId: car.id,
      carModel: `${car.brand} ${car.model}`,
      imageUrl: car.imageUrl,
      dailyRate: car.dailyRate,
      customerName: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      driverLicense: formData.driverLicense,
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupLocation: currentPickupLocation,
      withDriver: formData.withDriver,
      premiumInsurance: formData.premiumInsurance,
      tireGlassProtection: formData.tireGlassProtection,
      lossOfUseCoverage: formData.lossOfUseCoverage,
      deliveryType,
      deliveryFee,
      specialRequests: formData.specialRequests,
      totalDays,
      totalPrice,
    });

    alert(` Reservation for ${car.brand} ${car.model} confirmed successfully!\nBooking Reference: #${createdBooking.id}\nHandover: ${currentPickupLocation}`);
    navigate("/my-bookings");
  };

  return (
    <div className="porsche-config-root">
      {/* ================= 1. PORSCHE-STYLE TOP NAVIGATION BAR ================= */}
      <header className="config-top-bar">
        <div className="top-bar-left">
          <Link to={`/fleet/${car.id}`} className="btn-back-config" title="Back to Car Overview">
            ←
          </Link>
          <div className="config-meta-item">
            <span className="meta-text">Thanatooth Code: <strong>#{car.id.toUpperCase()}</strong></span>
          </div>
          <button type="button" className="config-meta-btn" onClick={handleReset}>
            <span>Load configuration</span>
          </button>
        </div>

        <div className="top-bar-right">
          <div className="top-price-box">
            <span className="top-price-amount">THB {totalPrice.toLocaleString()}</span>
            <span className="top-price-sub">{totalDays} Days Rental · {car.brand} {car.model}</span>
          </div>


        </div>
      </header>

      {/* ================= 2. MAIN SPLIT CONFIGURATOR ================= */}
      <div className="config-main-stage">
        {/* ================= LEFT COLUMN: BIG STAGE VISUALIZER & SPECS DASHBOARD ================= */}
        <section className="visualizer-stage-col">
          <div className="stage-viewport">
            {/* Main Stage Image */}
            <div className="car-hero-display">
              <img src={car.imageUrl}
                alt={`${car.brand} ${car.model}`}
                className="stage-car-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/car-placeholder.svg";
                }}
              />
            </div>

            {/* Quick Performance & Technical Specs Strip */}
            <div className="stage-specs-strip">
              <div className="stage-spec-item">
                <span className="spec-label">Power Output</span>
                <span className="spec-val">{car.specs?.horsepower || "High Output"}</span>
              </div>
              <div className="stage-spec-divider"></div>
              <div className="stage-spec-item">
                <span className="spec-label">0-100 km/h</span>
                <span className="spec-val">{car.specs?.acceleration || "N/A"}</span>
              </div>
              <div className="stage-spec-divider"></div>
              <div className="stage-spec-item">
                <span className="spec-label">Top Speed</span>
                <span className="spec-val">{car.specs?.topSpeed || "250+ km/h"}</span>
              </div>
              <div className="stage-spec-divider"></div>
              <div className="stage-spec-item">
                <span className="spec-label">Transmission</span>
                <span className="spec-val">{car.specs?.transmission || "Automatic"}</span>
              </div>
            </div>

            {/* Comprehensive Vehicle Details & Prestige Privileges Card */}
            <div className="stage-vehicle-info-card">
              <div className="stage-info-header">
                <div className="stage-badges-row">
                  <span className="stage-brand-pill">{car.brand}</span>
                  <span className="stage-cat-pill">{car.category}</span>
                  <span className="stage-year-pill">MY {car.year}</span>
                </div>
                <div className="stage-color-row">
                  <span className="color-dot"></span>
                  <span className="color-name">Exterior Finish: <strong>{car.color}</strong></span>
                </div>
              </div>

              <p className="stage-car-description">{car.description}</p>

              {/* Included White-Glove Concierge Privileges */}
              <div className="stage-privileges-box">
                <h4 className="stage-privileges-title">Complimentary Concierge Privileges</h4>
                <div className="stage-privileges-grid">
                  <div className="privilege-item">
                    <span className="privilege-bullet"></span>
                    <div className="privilege-text">
                      <strong>First-Class Comprehensive Insurance</strong>
                      <span>Zero-excess collision, damage and third-party protection included</span>
                    </div>
                  </div>
                  <div className="privilege-item">
                    <span className="privilege-bullet"></span>
                    <div className="privilege-text">
                      <strong>24/7 Dedicated Concierge Response</strong>
                      <span>Direct priority dispatch across Greater Bangkok and nationwide</span>
                    </div>
                  </div>
                  <div className="privilege-item">
                    <span className="privilege-bullet"></span>
                    <div className="privilege-text">
                      <strong>White-Glove Fuel & Detailing</strong>
                      <span>Delivered with a full tank of fuel and multi-stage hospital-grade sanitization</span>
                    </div>
                  </div>
                  <div className="privilege-item">
                    <span className="privilege-bullet"></span>
                    <div className="privilege-text">
                      <strong>100% Refundable Security Deposit</strong>
                      <span>Guaranteed immediate release to your bank account within 24 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: CONFIGURATION PANEL ================= */}
        <aside className="configuration-sidebar-col">
          {errorMsg && (
            <div className="config-error-pill">
              {errorMsg}
            </div>
          )}

          {/* Section 0: Rental Schedule (Pick-up & Return Dates) */}
          <div className="config-block-card">
            <h3 className="config-section-title">Rental Schedule & Duration</h3>
            <p className="config-section-sub">Select your pick-up and return schedule ({totalDays} Days selected)</p>

            <div className="input-two-grid" style={{ marginTop: "14px" }}>
              <div className="field-group">
                <label>Pick-up Date (วันเริ่มต้นเช่า) *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field-group">
                <label>Return Date (วันสิ้นสุดการเช่า) *</label>
                <input
                  type="date"
                  name="endDate"
                  min={formData.startDate}
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="config-flow-form">
            {/* Section 1: Seat & Chauffeur Package */}
            <div className="config-block-card">
              <h3 className="config-section-title">Drive & Chauffeur Experience</h3>
              <p className="config-section-sub">Select your preferred driving arrangement for this journey</p>

              <div className="option-cards-row">
                {/* Option Card A: Self-Drive */}
                <div className={`option-tile-card ${!formData.withDriver ? "selected" : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, withDriver: false }))}
                >
                  <div className="tile-info-text">
                    <strong>Self-Drive Experience</strong>
                    <span className="tile-price-tag">Included in Package (THB 0)</span>
                  </div>
                  <div className={`radio-circle ${!formData.withDriver ? "checked" : ""}`}></div>
                </div>

                {/* Option Card B: VIP Chauffeur */}
                <div className={`option-tile-card ${formData.withDriver ? "selected" : ""}`}
                  onClick={() => setFormData((prev) => ({ ...prev, withDriver: true }))}
                >
                  <div className="tile-info-text">
                    <strong>VIP Private Chauffeur</strong>
                    <span className="tile-price-tag">+THB 3,000 / day</span>
                  </div>
                  <div className={`radio-circle ${formData.withDriver ? "checked" : ""}`}></div>
                </div>
              </div>
            </div>

            {/* Section 2: More Options & Add-ons */}
            <div className="config-block-card">
              <h3 className="config-section-title">Options & Comprehensive Protection</h3>

              <div className="more-options-list">
                {/* Insurance Option 1: Zero Excess */}
                <label className="checkbox-row-item">
                  <div className="cb-left-side">
                    <input type="checkbox"
                      name="premiumInsurance"
                      checked={formData.premiumInsurance}
                      onChange={handleChange}
                    />
                    <span className="cb-label-text">
                      Zero Excess Comprehensive Protection (Full Coverage)
                    </span>
                    <span className="info-icon" title="100% damage and collision protection with zero excess liability">ⓘ</span>
                  </div>
                  <span className="cb-price-text">
                    {formData.premiumInsurance ? `+THB ${(totalDays * 2000).toLocaleString()}` : "+THB 2,000 / day"}
                  </span>
                </label>

                {/* Insurance Option 2: Tire & Windshield Special Protection */}
                <label className="checkbox-row-item">
                  <div className="cb-left-side">
                    <input type="checkbox"
                      name="tireGlassProtection"
                      checked={formData.tireGlassProtection}
                      onChange={handleChange}
                    />
                    <span className="cb-label-text">
                      Premium Wheels, Tires & Windshield Glass Protection
                    </span>
                    <span className="info-icon" title="Covers accidental tire punctures, curb rim scratches, and chipped front windshields">ⓘ</span>
                  </div>
                  <span className="cb-price-text">
                    {formData.tireGlassProtection ? `+THB ${(totalDays * 1000).toLocaleString()}` : "+THB 1,000 / day"}
                  </span>
                </label>

                {/* Insurance Option 3: Loss of Use Waiver & Rapid Replacement */}
                <label className="checkbox-row-item">
                  <div className="cb-left-side">
                    <input type="checkbox"
                      name="lossOfUseCoverage"
                      checked={formData.lossOfUseCoverage}
                      onChange={handleChange}
                    />
                    <span className="cb-label-text">
                      Loss of Use Waiver & Instant Vehicle Replacement Guarantee
                    </span>
                    <span className="info-icon" title="Exempts daily downtime garage charges in case of accident and guarantees instant replacement vehicle">ⓘ</span>
                  </div>
                  <span className="cb-price-text">
                    {formData.lossOfUseCoverage ? `+THB ${(totalDays * 1500).toLocaleString()}` : "+THB 1,500 / day"}
                  </span>
                </label>

                {/* VIP Delivery */}
                <label className="checkbox-row-item">
                  <div className="cb-left-side">
                    <input type="checkbox"
                      name="vipDelivery"
                      checked={formData.vipDelivery}
                      onChange={handleChange}
                    />
                    <span className="cb-label-text">
                      VIP White-Glove Handover (Airport / Hotel / Residence)
                    </span>
                    <span className="info-icon" title="Direct white-glove vehicle delivery to your designated destination">ⓘ</span>
                  </div>
                  <span className="cb-price-text free">THB 0</span>
                </label>

                {/* Child Seat */}
                <label className="checkbox-row-item">
                  <div className="cb-left-side">
                    <input type="checkbox"
                      name="childSeat"
                      checked={formData.childSeat}
                      onChange={handleChange}
                    />
                    <span className="cb-label-text">
                      Complimentary ISOFIX Child Safety Seat
                    </span>
                    <span className="info-icon" title="Certified international standard ISOFIX child seat">ⓘ</span>
                  </div>
                  <span className="cb-price-text free">THB 0</span>
                </label>

                {/* High-Speed Wi-Fi */}
                <label className="checkbox-row-item">
                  <div className="cb-left-side">
                    <input type="checkbox"
                      name="wifiHotspot"
                      checked={formData.wifiHotspot}
                      onChange={handleChange}
                    />
                    <span className="cb-label-text">
                      Dedicated GPS Navigation & In-Car High-Speed Wi-Fi
                    </span>
                    <span className="info-icon" title="Stay seamlessly connected throughout Thailand with 5G speed">ⓘ</span>
                  </div>
                  <span className="cb-price-text free">THB 0</span>
                </label>
              </div>
            </div>

            {/* Section 3: Handover Method (Showroom vs Direct Delivery) */}
            <div className="config-block-card">
              <div className="accordion-header-row"
                onClick={() => setActiveSection((prev) => (prev === "dates" ? "" : "dates"))}
              >
                <div>
                  <h3 className="config-section-title">Vehicle Handover Method</h3>
                  <span className="accordion-summary-tag">
                    {deliveryType === "showroom" ? `Showroom: ${selectedShowroom}` : (deliveryAddress ? `Delivery: ${deliveryAddress.slice(0, 28)}...` : "Direct Delivery")}
                  </span>
                </div>
                <span className="chevron-icon">{activeSection === "dates" ? "▲" : "▼"}</span>
              </div>

              {activeSection === "dates" && (
                <div className="accordion-content-body">

                  {/* Two Handover Method Choice Cards (Pick up at Showroom VS Direct Delivery) */}
                  <div className="handover-choice-section">
                    <label className="handover-section-label">Vehicle Handover Method (วิธีรับรถ) *</label>
                    <div className="option-cards-row">
                      {/* Option 1: Pick up at Showroom */}
                      <div className={`option-tile-card ${deliveryType === "showroom" ? "selected" : ""}`}
                        onClick={() => setDeliveryType("showroom")}
                      >
                        <div className="tile-info-text">
                          <strong>Pick up at Showroom</strong>
                          <span className="tile-price-tag">รับเองที่โชว์รูม (Complimentary)</span>
                        </div>
                        <div className={`radio-circle ${deliveryType === "showroom" ? "checked" : ""}`}></div>
                      </div>

                      {/* Option 2: Direct Delivery */}
                      <div className={`option-tile-card ${deliveryType === "delivery" ? "selected" : ""}`}
                        onClick={() => setDeliveryType("delivery")}
                      >
                        <div className="tile-info-text">
                          <strong>Direct Delivery to Address</strong>
                          <span className="tile-price-tag">จัดส่งถึงที่อยู่ของคุณ (+THB 2,000)</span>
                        </div>
                        <div className={`radio-circle ${deliveryType === "delivery" ? "checked" : ""}`}></div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-section A: Showroom Selection Cards */}
                  {deliveryType === "showroom" && (
                    <div className="showroom-selection-box">
                      <label className="handover-sub-label">Select Showroom / Handover Center (เลือกสาขาโชว์รูมที่ต้องการรับรถ):</label>
                      <div className="showroom-radio-list">
                        {SHOWROOM_LOCATIONS.map((loc) => {
                          const isSelected = selectedShowroom === loc.name;
                          return (
                            <div key={loc.id}
                              className={`showroom-choice-card ${isSelected ? "selected" : ""}`}
                              onClick={() => setSelectedShowroom(loc.name)}
                            >
                              <div className="showroom-card-header">
                                <div className="showroom-name-group">
                                  <strong>{loc.name}</strong>
                                </div>
                                <span className="showroom-badge">{loc.badge}</span>
                              </div>
                              <p className="showroom-detail-text">{loc.detail}</p>
                              <div className={`showroom-radio-dot ${isSelected ? "active" : ""}`}></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-section B: Address Input for Direct Delivery */}
                  {deliveryType === "delivery" && (
                    <div className="delivery-address-group">
                      <label className="handover-sub-label">
                        Enter Your Delivery Address (ระบุที่อยู่ / โรงแรม / คอนโด เพื่อให้ไปส่ง) *
                      </label>
                      <textarea rows={3}
                        placeholder="Please specify street address, condominium/hotel name, room or lobby details (e.g. The Sukhothai Bangkok Hotel, Lobby or 128 Sukhumvit Soi 55, Thonglor, Watthana, Bangkok)..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required className="delivery-address-textarea"
                      />
                      <span className="delivery-hint-text">
                         Our white-glove concierge logistics team will arrive with the vehicle meticulously polished, sanitized, and fully fueled at your exact scheduled time.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Client Identification */}
            <div className="config-block-card">
              <div className="accordion-header-row"
                onClick={() => setActiveSection((prev) => (prev === "client" ? "" : "client"))}
              >
                <div>
                  <h3 className="config-section-title">Client Information</h3>
                  <span className="accordion-summary-tag">
                    {formData.customerName ? formData.customerName : "Provide client details to secure reservation"}
                  </span>
                </div>
                <span className="chevron-icon">{activeSection === "client" ? "▲" : "▼"}</span>
              </div>

              {activeSection === "client" && (
                <div className="accordion-content-body">
                  <div className="input-two-grid">
                    <div className="field-group">
                      <label>Full Name (as per Passport / ID) *</label>
                      <input type="text"
                        name="customerName"
                        placeholder="e.g. Thanathat Chaichana"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Mobile Contact Phone *</label>
                      <input type="tel"
                        name="phone"
                        placeholder="e.g. +66 81 234 5678"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-two-grid">
                    <div className="field-group">
                      <label>Confirmation Email *</label>
                      <input type="email"
                        name="email"
                        placeholder="customer@luxury.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field-group">
                      <label>Driver's License / Passport Number *</label>
                      <input type="text"
                        name="driverLicense"
                        placeholder="e.g. DL-987654321"
                        value={formData.driverLicense}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group full-width">
                    <label>Special Requests / Concierge Instructions</label>
                    <textarea name="specialRequests"
                      rows="2"
                      placeholder="e.g. Delivery at 09:30 AM sharp. Chauffeur in executive dark suit."
                      value={formData.specialRequests}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Real-time Pricing Summary */}
            <div className="config-pricing-box">
              <div className="pricing-line">
                <span>Base Rental Rate ({totalDays} Days x ฿{car.dailyRate.toLocaleString()})</span>
                <strong>฿{baseRent.toLocaleString()}</strong>
              </div>

              {formData.withDriver && (
                <div className="pricing-line extra">
                  <span>VIP Private Chauffeur ({totalDays} x ฿3,000)</span>
                  <strong>+฿{driverFee.toLocaleString()}</strong>
                </div>
              )}

              {formData.premiumInsurance && (
                <div className="pricing-line extra">
                  <span>Zero Excess Protection ({totalDays} x ฿2,000)</span>
                  <strong>+฿{insuranceFee.toLocaleString()}</strong>
                </div>
              )}

              {formData.tireGlassProtection && (
                <div className="pricing-line extra">
                  <span>Tire & Windshield Protection ({totalDays} x ฿1,000)</span>
                  <strong>+฿{tireGlassFee.toLocaleString()}</strong>
                </div>
              )}

              {formData.lossOfUseCoverage && (
                <div className="pricing-line extra">
                  <span>Loss of Use & Replacement Guarantee ({totalDays} x ฿1,500)</span>
                  <strong>+฿{lossOfUseFee.toLocaleString()}</strong>
                </div>
              )}

              {deliveryType === "delivery" && (
                <div className="pricing-line extra">
                  <span>Direct Delivery Service Fee (ค่าบริการจัดส่งถึงที่อยู่)</span>
                  <strong>+฿{deliveryFee.toLocaleString()}</strong>
                </div>
              )}

              <div className="pricing-line deposit">
                <span>Refundable Security Deposit (100% Returned)</span>
                <span>฿{car.deposit.toLocaleString()}</span>
              </div>

              <div className="pricing-total-divider"></div>

              <div className="pricing-line grand-total">
                <span className="total-label">Total Rental Amount</span>
                <span className="total-amount-gold">THB {totalPrice.toLocaleString()}</span>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-confirm-config-gold">
                Confirm Reservation & Enquire 
              </button>
            </div>
          </form>
        </aside>
      </div>

      {/* ================= 3. SUMMARY MODAL (PORSCHE SUMMARY OVERLAY) ================= */}
      {showSummaryModal && (
        <div className="summary-modal-backdrop" onClick={() => setShowSummaryModal(false)}>
          <div className="summary-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-line">
              <h2>Vehicle Configuration Summary</h2>
              <button type="button"
                className="btn-close-summary"
                onClick={() => setShowSummaryModal(false)}
              >
                
              </button>
            </div>

            <div className="modal-vehicle-banner">
              <img src={car.imageUrl} alt={car.model} />
              <div>
                <span className="badge-gold">{car.brand}</span>
                <h3>{car.model} ({car.year})</h3>
                <p>Exterior Finish: {car.color} · Power Output: {car.specs?.horsepower || "500+ hp"}</p>
              </div>
            </div>

            <div className="summary-specs-list">
              <div className="s-item">
                <span>Rental Period:</span>
                <strong>{formData.startDate} to {formData.endDate} ({totalDays} Days)</strong>
              </div>
              <div className="s-item">
                <span>Handover Method:</span>
                <strong>
                  {deliveryType === "showroom"
                    ? `Pick up at Showroom: ${selectedShowroom}`
                    : `Direct Delivery to: ${deliveryAddress || "Address provided"}`}
                </strong>
              </div>
              <div className="s-item">
                <span>Driver Arrangement:</span>
                <strong>{formData.withDriver ? "VIP Private Chauffeur (+฿3,000/day)" : "Self-Drive Experience"}</strong>
              </div>
              <div className="s-item">
                <span>Insurance Protection:</span>
                <strong>{formData.premiumInsurance ? "Zero Excess Full Coverage" : "Standard Comprehensive Insurance"}</strong>
              </div>
              <div className="s-item highlight">
                <span>Net Total Amount:</span>
                <strong className="gold">THB {totalPrice.toLocaleString()}</strong>
              </div>
            </div>

            <div className="modal-action-footer">
              <button type="button"
                className="btn-modal-cancel"
                onClick={() => setShowSummaryModal(false)}
              >
                Back to Configuration
              </button>
              <button type="button"
                className="btn-modal-proceed"
                onClick={() => {
                  setShowSummaryModal(false);
                  handleSubmit();
                }}
              >
                Confirm Booking Now 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
