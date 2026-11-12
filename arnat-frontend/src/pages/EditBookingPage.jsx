// src/pages/EditBookingPage.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { initialCars } from "../data/cars";
import "./EditBookingPage.css";

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

export default function EditBookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Retrieve existing booking
  const existingBooking = useMemo(() => {
    return bookingService.getById(id);
  }, [id]);

  // Find vehicle to retrieve current dailyRate & image
  const car = useMemo(() => {
    if (!existingBooking) return null;
    return (
      initialCars.find((c) => c.id === existingBooking.carId) || {
        dailyRate: existingBooking.dailyRate || 30000,
        imageUrl: existingBooking.imageUrl,
        brand: existingBooking.carModel?.split(" ")[0] || "Luxury Car",
        model: existingBooking.carModel || "",
      }
    );
  }, [existingBooking]);

  const parseHandover = (loc = "") => {
    if (loc.startsWith("Direct Delivery:") || loc.startsWith("Delivery to:")) {
      return {
        type: "delivery",
        showroom: "Thanatooth Flagship Center (Rama 9)",
        address: loc.replace(/^(Direct Delivery:|Delivery to:)\s*/, "").trim(),
      };
    }
    const cleanShowroom = loc.replace(/^Showroom:\s*/, "").trim();
    return {
      type: "showroom",
      showroom: cleanShowroom || "Thanatooth Flagship Center (Rama 9)",
      address: "",
    };
  };

  const initialHandover = parseHandover(existingBooking?.pickupLocation);
  const [deliveryType, setDeliveryType] = useState(initialHandover.type);
  const [selectedShowroom, setSelectedShowroom] = useState(initialHandover.showroom);
  const [deliveryAddress, setDeliveryAddress] = useState(initialHandover.address);

  const [formData, setFormData] = useState(() => {
    const b = bookingService.getById(id);
    return {
      customerName: b?.customerName || "",
      phone: b?.phone || "",
      email: b?.email || "",
      driverLicense: b?.driverLicense || "",
      startDate: b?.startDate || "",
      endDate: b?.endDate || "",
      withDriver: Boolean(b?.withDriver),
      premiumInsurance: Boolean(b?.premiumInsurance),
      tireGlassProtection: Boolean(b?.tireGlassProtection),
      lossOfUseCoverage: Boolean(b?.lossOfUseCoverage),
      specialRequests: b?.specialRequests || "",
    };
  });

  // Pre-fill fields when ID changes
  useEffect(() => {
    const b = bookingService.getById(id);
    if (b) {
      const h = parseHandover(b.pickupLocation);
      setDeliveryType(h.type);
      setSelectedShowroom(h.showroom);
      setDeliveryAddress(h.address);

      setFormData({
        customerName: b.customerName || "",
        phone: b.phone || "",
        email: b.email || "",
        driverLicense: b.driverLicense || "",
        startDate: b.startDate || "",
        endDate: b.endDate || "",
        withDriver: Boolean(b.withDriver),
        premiumInsurance: Boolean(b.premiumInsurance),
        tireGlassProtection: Boolean(b.tireGlassProtection),
        lossOfUseCoverage: Boolean(b.lossOfUseCoverage),
        specialRequests: b.specialRequests || "",
      });
    }
  }, [id]);

  // Real-time recalculated net total
  const { totalDays, baseRent, driverFee, insuranceFee, tireGlassFee, lossOfUseFee, deliveryFee, totalPrice } = useMemo(() => {
    if (!formData.startDate || !formData.endDate || !car) {
      return { totalDays: 1, baseRent: 0, driverFee: 0, insuranceFee: 0, tireGlassFee: 0, lossOfUseFee: 0, deliveryFee: 0, totalPrice: 0 };
    }
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const daily = car.dailyRate || existingBooking?.dailyRate || 30000;
    const base = diffDays * daily;
    const driver = formData.withDriver ? diffDays * 3000 : 0;
    const insurance = formData.premiumInsurance ? diffDays * 2000 : 0;
    const tireGlass = formData.tireGlassProtection ? diffDays * 1000 : 0;
    const lossOfUse = formData.lossOfUseCoverage ? diffDays * 1500 : 0;
    const delivery = deliveryType === "delivery" ? 2000 : 0;

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
    car,
    existingBooking,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const currentPickupLocation =
    deliveryType === "showroom"
      ? `Showroom: ${selectedShowroom}`
      : `Direct Delivery: ${deliveryAddress.trim()}`;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      alert("Please provide your delivery destination address (ระบุที่อยู่สำหรับจัดส่งรถ).");
      return;
    }

    if (!formData.customerName.trim() || !formData.phone.trim()) {
      alert("Please complete the required fields: Full Name and Contact Phone.");
      return;
    }

    // Save update
    bookingService.update(id, {
      ...formData,
      pickupLocation: currentPickupLocation,
      totalDays,
      totalPrice,
    });

    alert(`Reservation #${id} has been updated successfully!\nHandover: ${currentPickupLocation}`);
    navigate("/my-bookings");
  };

  if (!existingBooking) {
    return (
      <div className="edit-booking-not-found">
        <h2>Reservation Reference #{id} Not Found</h2>
        <p>This booking may have been removed or the reference link is invalid.</p>
        <Link to="/my-bookings" className="btn-back-my-bookings">
          Return to Client Reservations
        </Link>
      </div>
    );
  }

  // ป้องกันการแก้ไขหากแอดมิน Confirm อนุมัติแล้ว
  if (existingBooking.status?.toLowerCase() === "confirmed") {
    return (
      <div className="edit-booking-page-root">
        <div className="edit-container" style={{ maxWidth: "680px", margin: "60px auto", textAlign: "center" }}>
          <div className="edit-card-box">
            <span className="edit-tag-gold" style={{ display: "inline-block", marginBottom: "16px" }}>
              LOCKED RESERVATION
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", color: "#0f172a", marginBottom: "12px" }}>
              Reservation #{id} is Confirmed
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
              การจองนี้ได้รับการยืนยันและอนุมัติจากฝ่ายบริการลูกค้า (Admin Concierge) เรียบร้อยแล้ว จึงไม่สามารถแก้ไขข้อมูลวันเวลาหรือแพ็กเกจได้อีก เพื่อรักษาคิวรถและเอกสารสัญญาอย่างเป็นทางการ
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link to="/my-bookings" className="btn-return-my-bookings" style={{ width: "auto", padding: "0 24px" }}>
                ← Return to Client Reservations
              </Link>
              <Link to={`/payment/${id}`} className="btn-save-changes-gold" style={{ width: "auto", padding: "0 24px", marginBottom: 0 }}>
                Proceed to Payment
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-booking-page-root">
      <div className="edit-container">
        {/* Breadcrumb */}
        <div className="edit-breadcrumb">
          <Link to="/">Home</Link>
          <span className="crumb-separator">/</span>
          <Link to="/my-bookings">My Bookings</Link>
          <span className="crumb-separator">/</span>
          <span className="current">Modify Reservation #{id}</span>
        </div>

        {/* Header Bar */}
        <div className="edit-header-bar">
          <div className="edit-header-info">
            <span className="edit-tag-gold">Update Reservation</span>
            <h1>Modify Reservation Details #{id}</h1>
            <p>Adjust rental schedule, delivery location, or add-on amenities in real time.</p>
          </div>
          <Link to="/my-bookings" className="btn-cancel-edit">
            Discard Changes
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="edit-grid-layout">
          {/* Left: Edit Form */}
          <div className="edit-form-col">
            {/* Box 1: Client Identification */}
            <div className="edit-card-box">
              <div className="box-header-wrap">
                <h3 className="box-title">Client Identification</h3>
                <span className="box-step-num">Step 1</span>
              </div>
              <div className="edit-fields-grid">
                <div className="e-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Thanarat Chansamak"
                    required
                  />
                </div>
                <div className="e-field">
                  <label>Mobile Contact Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 092-863-6437"
                    required
                  />
                </div>
                <div className="e-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. thanarat@example.com"
                  />
                </div>
                <div className="e-field">
                  <label>Driver's License / Passport *</label>
                  <input
                    type="text"
                    name="driverLicense"
                    value={formData.driverLicense}
                    onChange={handleChange}
                    placeholder="License or Passport ID"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Rental Schedule & Handover Method */}
            <div className="edit-card-box">
              <div className="box-header-wrap">
                <h3 className="box-title">Rental Schedule & Handover Method</h3>
                <span className="box-step-num">Step 2</span>
              </div>
              <div className="edit-fields-grid">
                <div className="e-field">
                  <label>Pick-up Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="e-field">
                  <label>Return Date *</label>
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

              {/* Handover Method (2 Options) */}
              <div className="edit-handover-section">
                <label className="handover-section-label">Vehicle Handover Method *</label>
                <div className="edit-handover-tiles-row">
                  {/* Option 1: Pick up at Showroom */}
                  <div
                    className={`edit-handover-tile ${deliveryType === "showroom" ? "selected" : ""}`}
                    onClick={() => setDeliveryType("showroom")}
                  >
                    <div>
                      <strong>Pick up at Showroom</strong>
                      <span className="tile-sub">Collect at official lounge (Complimentary)</span>
                    </div>
                    <div className="tile-check-circle">
                      {deliveryType === "showroom" && <div className="tile-check-inner" />}
                    </div>
                  </div>

                  {/* Option 2: Direct Delivery */}
                  <div
                    className={`edit-handover-tile ${deliveryType === "delivery" ? "selected" : ""}`}
                    onClick={() => setDeliveryType("delivery")}
                  >
                    <div>
                      <strong>Direct Delivery to Address</strong>
                      <span className="tile-sub">Direct delivery to residence / hotel (VIP)</span>
                    </div>
                    <div className="tile-check-circle">
                      {deliveryType === "delivery" && <div className="tile-check-inner" />}
                    </div>
                  </div>
                </div>

                {/* Showroom choice list */}
                {deliveryType === "showroom" && (
                  <div className="showroom-selection-box">
                    <label className="handover-sub-label">Select Showroom / Handover Center:</label>
                    <div className="showroom-radio-list">
                      {SHOWROOM_LOCATIONS.map((loc) => {
                        const isSelected = selectedShowroom === loc.name;
                        return (
                          <div
                            key={loc.id}
                            className={`showroom-choice-card ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedShowroom(loc.name)}
                          >
                            <div className="showroom-card-body">
                              <div className="showroom-card-top">
                                <strong>{loc.name}</strong>
                                <span className="showroom-badge">{loc.badge}</span>
                              </div>
                              <p className="showroom-detail-text">{loc.detail}</p>
                            </div>
                            <div className={`showroom-radio-dot ${isSelected ? "active" : ""}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Direct Delivery address input */}
                {deliveryType === "delivery" && (
                  <div className="delivery-address-group">
                    <label className="handover-sub-label">
                      Enter Your Delivery Address (Specify hotel, residence, or condo) *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Please specify street address, condominium/hotel name, room or lobby details..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      className="delivery-address-textarea"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Box 3: Optional Amenities & Protection */}
            <div className="edit-card-box">
              <div className="box-header-wrap">
                <h3 className="box-title">Optional Amenities & Protection</h3>
                <span className="box-step-num">Step 3</span>
              </div>
              <div className="edit-addons-list">
                <label className={`edit-addon-item ${formData.withDriver ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    name="withDriver"
                    checked={formData.withDriver}
                    onChange={handleChange}
                  />
                  <div className="addon-text">
                    <strong>VIP Private Chauffeur Service (+฿3,000 / day)</strong>
                    <p>Professional chauffeur in executive suit, discreet and route-certified</p>
                  </div>
                </label>

                <label className={`edit-addon-item ${formData.premiumInsurance ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    name="premiumInsurance"
                    checked={formData.premiumInsurance}
                    onChange={handleChange}
                  />
                  <div className="addon-text">
                    <strong>Zero Excess Protection (+฿2,000 / day)</strong>
                    <p>100% collision and damage waiver with zero client liability</p>
                  </div>
                </label>

                <label className={`edit-addon-item ${formData.tireGlassProtection ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    name="tireGlassProtection"
                    checked={formData.tireGlassProtection}
                    onChange={handleChange}
                  />
                  <div className="addon-text">
                    <strong>Wheels, Tires & Windshield Glass Protection (+฿1,000 / day)</strong>
                    <p>Accidental tire punctures, rim scuffs, and chipped windshield coverage</p>
                  </div>
                </label>

                <label className={`edit-addon-item ${formData.lossOfUseCoverage ? "active" : ""}`}>
                  <input
                    type="checkbox"
                    name="lossOfUseCoverage"
                    checked={formData.lossOfUseCoverage}
                    onChange={handleChange}
                  />
                  <div className="addon-text">
                    <strong>Loss of Use Waiver & Instant Vehicle Replacement (+฿1,500 / day)</strong>
                    <p>Zero downtime liability charges with guarantee replacement vehicle</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Summary & Save Button */}
          <div className="edit-summary-col">
            <div className="edit-summary-sticky-card">
              <div className="summary-heading-box">
                <h3>Recalculated Summary</h3>
                <span className="recalculated-tag">Live Recalculated</span>
              </div>

              <div className="edit-car-info-row">
                <img
                  src={car?.imageUrl || existingBooking.imageUrl}
                  alt={existingBooking.carModel}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/car-placeholder.svg";
                  }}
                />
                <div className="car-meta-info">
                  <strong>{existingBooking.carModel}</strong>
                  <span className="car-rate-sub">
                    ฿{(car?.dailyRate || existingBooking.dailyRate || 30000).toLocaleString()} / day
                  </span>
                </div>
              </div>

              <div className="edit-calc-lines">
                <div className="c-line">
                  <span>Updated Duration</span>
                  <strong>{totalDays} Days</strong>
                </div>
                <div className="c-line">
                  <span>Base Rental Rate</span>
                  <span>฿{baseRent.toLocaleString()}</span>
                </div>
                {formData.withDriver && (
                  <div className="c-line addon">
                    <span>VIP Chauffeur</span>
                    <span>+฿{driverFee.toLocaleString()}</span>
                  </div>
                )}
                {formData.premiumInsurance && (
                  <div className="c-line addon">
                    <span>Zero Excess Protection</span>
                    <span>+฿{insuranceFee.toLocaleString()}</span>
                  </div>
                )}
                {formData.tireGlassProtection && (
                  <div className="c-line addon">
                    <span>Tire & Glass Protection</span>
                    <span>+฿{tireGlassFee.toLocaleString()}</span>
                  </div>
                )}
                {formData.lossOfUseCoverage && (
                  <div className="c-line addon">
                    <span>Loss of Use Waiver</span>
                    <span>+฿{lossOfUseFee.toLocaleString()}</span>
                  </div>
                )}
                {deliveryType === "delivery" && (
                  <div className="c-line addon">
                    <span>Direct Delivery Fee</span>
                    <span>+฿{deliveryFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="c-line-divider" />

                <div className="c-line total">
                  <span>Updated Net Total</span>
                  <span className="gold-sum">฿{totalPrice.toLocaleString()}</span>
                </div>

                <div className="handover-summary-note">
                  <span>Handover Destination:</span>
                  <strong>
                    {deliveryType === "showroom" ? selectedShowroom : (deliveryAddress || "Direct Delivery")}
                  </strong>
                </div>
              </div>

              <button type="submit" className="btn-save-changes-gold">
                Save & Update Reservation
              </button>

              <Link to="/my-bookings" className="btn-return-my-bookings">
                Discard & Return to Bookings
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
