// src/components/BookingFormModal.jsx
import { useState, useMemo } from "react";
import { initialCars } from "../data/cars";
import { bookingService } from "../services/bookingService";
import "./BookingFormModal.css";

export default function BookingFormModal({ car, existingBooking, onClose, onSuccess }) {
  const isEdit = Boolean(existingBooking);

  // หาข้อมูลรถแบบเต็ม (รวม specs, color, deposit) จาก car prop หรือ initialCars
  const carData = useMemo(() => {
    if (car && car.specs) return car;
    if (existingBooking?.carId) {
      const found = initialCars.find((c) => c.id === existingBooking.carId);
      if (found) return { ...found, ...car };
    }
    if (car) {
      const found = initialCars.find((c) => c.id === car.id);
      if (found) return found;
    }
    return {
      id: existingBooking?.carId || car?.id || "car-01",
      brand: existingBooking?.carModel?.split(" ")[0] || car?.brand || "Porsche",
      model: existingBooking?.carModel?.split(" ").slice(1).join(" ") || car?.model || "911 Carrera S",
      category: car?.category || "Supercar",
      year: car?.year || 2024,
      dailyRate: existingBooking?.dailyRate || car?.dailyRate || 35000,
      deposit: car?.deposit || 50000,
      color: car?.color || "Guards Red",
      specs: car?.specs || {
        horsepower: "450 hp",
        acceleration: "3.5s (0-100)",
        transmission: "PDK 8-Speed",
        seats: 4,
      },
      imageUrl:
        car?.imageUrl ||
        existingBooking?.imageUrl ||
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
    };
  }, [car, existingBooking]);

  // สถานะเปิด/ปิดแท็บดูสเปกเชิงลึกของรถ
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  // คำนวณวันเริ่มต้นและสิ้นสุด
  const defaultStart =
    existingBooking?.startDate ||
    car?.initialStart ||
    new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const defaultEnd =
    existingBooking?.endDate ||
    car?.initialEnd ||
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0];
  const defaultLocation =
    existingBooking?.pickupLocation ||
    car?.initialLocation ||
    "สนามบินสุวรรณภูมิ (VIP Lounge)";

  const [formData, setFormData] = useState({
    customerName: existingBooking?.customerName || "",
    phone: existingBooking?.phone || "",
    driverLicense: existingBooking?.driverLicense || "",
    startDate: defaultStart,
    endDate: defaultEnd,
    pickupLocation: defaultLocation,
    withDriver: existingBooking?.withDriver || false,
    premiumInsurance: existingBooking?.premiumInsurance || false,
    freeWifi: true,
    childSeat: false,
  });

  const [error, setError] = useState(null);

  // คำนวณวันเช่าแบบ Real-time ตาม Business Logic
  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const diffTime = new Date(end) - new Date(start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // คำนวณราคาสุทธิแบบ Real-time: TotalPrice = (DailyRate × Days) + (WithDriver ? 3000 × Days : 0) + (Insurance ? 2000 × Days : 0)
  const { totalDays, baseRent, driverFee, insuranceFee, totalPrice } = useMemo(() => {
    const days = calculateDays(formData.startDate, formData.endDate);
    const rate = Number(carData.dailyRate) || 0;
    const base = rate * days;
    const driver = formData.withDriver ? 3000 * days : 0;
    const insurance = formData.premiumInsurance ? 2000 * days : 0;
    return {
      totalDays: days,
      baseRent: base,
      driverFee: driver,
      insuranceFee: insurance,
      totalPrice: base + driver + insurance,
    };
  }, [formData.startDate, formData.endDate, formData.withDriver, formData.premiumInsurance, carData.dailyRate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.driverLicense.trim()) {
      setError("กรุณากรอกชื่อผู้จอง เบอร์โทรศัพท์ และเลขที่ใบขับขี่ให้ครบถ้วน");
      return;
    }

    const payload = {
      carId: carData.id,
      carModel: `${carData.brand} ${carData.model}`,
      imageUrl: carData.imageUrl,
      dailyRate: carData.dailyRate,
      customerName: formData.customerName,
      phone: formData.phone,
      driverLicense: formData.driverLicense,
      startDate: formData.startDate,
      endDate: formData.endDate,
      pickupLocation: formData.pickupLocation,
      withDriver: formData.withDriver,
      premiumInsurance: formData.premiumInsurance,
      totalDays,
      totalPrice,
    };

    if (isEdit) {
      bookingService.update(existingBooking.id, payload);
      alert(` อัปเดตรายละเอียดการจอง #${existingBooking.id} สำเร็จ!`);
    } else {
      const created = bookingService.create(payload);
      alert(` จองรถ ${payload.carModel} สำเร็จ! รหัสการจอง: #${created.id}`);
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="modal-top-bar">
          <div className="modal-title-left">
            <span className="modal-tag-gold">
              {isEdit ? "EDIT RESERVATION" : "EXOTIC CAR RESERVATION"}
            </span>
            <h3>{isEdit ? `แก้ไขการจอง #${existingBooking.id}` : `จองรถหรูระดับพรีเมียม`}</h3>
          </div>
          <button className="btn-close-modal-round" onClick={onClose} title="ปิดหน้าต่าง">
            
          </button>
        </div>

        {/* 2-Column Split: Left = Car Showcase & Specs, Right = Booking Form & Functions */}
        <div className="booking-split-grid">
          {/* ================= COLUMN 1: CAR SHOWCASE & SPECS ================= */}
          <div className="modal-car-showcase-col">
            {/* Main Car Photo with Badges */}
            <div className="car-showcase-photo-card">
              <img
                src={carData.imageUrl}
                alt={`${carData.brand} ${carData.model}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="car-photo-badges-overlay">
                <span className="overlay-badge brand">{carData.brand}</span>
                <span className="overlay-badge category">{carData.category}</span>
                <span className="overlay-badge year">{carData.year}</span>
              </div>
            </div>

            {/* Car Name & Pricing Card */}
            <div className="car-name-price-card">
              <div className="car-title-wrap">
                <span className="car-brand-subtitle">{carData.brand}</span>
                <h4 className="car-model-title">{carData.model}</h4>
                {carData.color && (
                  <span className="car-color-pill"> สีตัวถัง: {carData.color}</span>
                )}
              </div>

              <div className="car-rate-box">
                <span className="rate-lbl">อัตราค่าเช่ามาตรฐาน</span>
                <div className="rate-num">
                  <strong>฿{Number(carData.dailyRate).toLocaleString()}</strong>
                  <small>.- / วัน</small>
                </div>
                <span className="deposit-note">
                  (เงินประกันมัดจำ: ฿{Number(carData.deposit || 50000).toLocaleString()})
                </span>
              </div>
            </div>

            {/* Quick Specs 4-Pill Grid */}
            <div className="car-quick-specs-grid">
              <div className="spec-pill-item">
                <span className="spec-icon"></span>
                <div>
                  <small>พละกำลัง</small>
                  <strong>{carData.specs?.horsepower || "450 hp"}</strong>
                </div>
              </div>

              <div className="spec-pill-item">
                <span className="spec-icon"></span>
                <div>
                  <small>0-100 กม./ชม.</small>
                  <strong>{carData.specs?.acceleration || "3.5s"}</strong>
                </div>
              </div>

              <div className="spec-pill-item">
                <span className="spec-icon"></span>
                <div>
                  <small>ระบบเกียร์</small>
                  <strong>{carData.specs?.transmission?.split(" ")[0] || "Automatic"}</strong>
                </div>
              </div>

              <div className="spec-pill-item">
                <span className="spec-icon"></span>
                <div>
                  <small>จำนวนที่นั่ง</small>
                  <strong>{carData.specs?.seats || 4} ที่นั่ง</strong>
                </div>
              </div>
            </div>

            {/* Toggle Button: กดดูสเปกและข้อมูลตัวรถอย่างละเอียด */}
            <button
              type="button"
              className={`btn-toggle-specs ${showFullSpecs ? "active" : ""}`}
              onClick={() => setShowFullSpecs(!showFullSpecs)}
            >
              <span>{showFullSpecs ? "▲ ซ่อนสเปกเชิงลึก" : " กดดูสเปกและฟังก์ชันตัวรถ ▼"}</span>
            </button>

            {/* Expandable Full Specs Drawer */}
            {showFullSpecs && (
              <div className="car-full-specs-drawer">
                <div className="specs-drawer-title">
                  <span> ข้อมูลทางเทคนิคและสมรรถนะตัวรถ</span>
                </div>
                <div className="specs-table-rows">
                  <div className="specs-table-row">
                    <span>แบรนด์ / ผู้ผลิต:</span>
                    <strong>{carData.brand}</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>รุ่นตัวถัง:</span>
                    <strong>{carData.model}</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>ประเภทรถยนต์:</span>
                    <strong>{carData.category}</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>ปีโมเดล:</span>
                    <strong>{carData.year}</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>พละกำลังแรงม้า:</span>
                    <strong className="text-gold">{carData.specs?.horsepower}</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>อัตราเร่ง 0-100:</span>
                    <strong className="text-gold">{carData.specs?.acceleration}</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>ระบบส่งกำลัง:</span>
                    <strong>{carData.specs?.transmission}</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>ระบบขับเคลื่อน:</span>
                    <strong>AWD Performance / RWD Sport</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>ระบบความปลอดภัย:</span>
                    <strong>ABS, EBD, ถุงลมนิรภัย 8 จุด, กล้อง 360°</strong>
                  </div>
                  <div className="specs-table-row">
                    <span>ระบบความบันเทิง:</span>
                    <strong>Apple CarPlay, Android Auto, Premium Audio</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================= COLUMN 2: BOOKING FORM & FUNCTIONS ================= */}
          <div className="modal-booking-form-col">
            {error && <div className="modal-alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="booking-actual-form">
              {/* Section 1: Customer Details */}
              <div className="form-section-title">
                <span className="sec-icon"></span> 1. ข้อมูลผู้เช่ารถ
              </div>

              <div className="form-grid-2cols">
                <div className="form-input-group">
                  <label>ชื่อ-นามสกุล ผู้จอง <span className="req">*</span></label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    placeholder="เช่น คุณกฤษฎา วัฒนพาณิชย์"
                    value={formData.customerName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-input-group">
                  <label>เบอร์โทรศัพท์ติดต่อ <span className="req">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="เช่น 081-888-9999"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label>เลขที่ใบขับขี่สากล / ส่วนบุคคล <span className="req">*</span></label>
                <input
                  type="text"
                  name="driverLicense"
                  required
                  placeholder="เช่น DL-TH-9821430"
                  value={formData.driverLicense}
                  onChange={handleChange}
                />
              </div>

              {/* Section 2: Dates & Pickup Location */}
              <div className="form-section-title">
                <span className="sec-icon"></span> 2. กำหนดการและสถานที่รับรถ
              </div>

              <div className="form-grid-2cols">
                <div className="form-input-group">
                  <label>วันที่รับรถ (Start Date) <span className="req">*</span></label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-input-group">
                  <label>วันที่คืนรถ (End Date) <span className="req">*</span></label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-input-group">
                <label>จุดส่งมอบและรับรถ (Pickup Location) <span className="req">*</span></label>
                <select
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                >
                  <option value="สนามบินสุวรรณภูมิ (VIP Lounge)">
                    สนามบินสุวรรณภูมิ (VIP Lounge)
                  </option>
                  <option value="สนามบินดอนเมือง (VIP Terminal)">
                    สนามบินดอนเมือง (VIP Terminal)
                  </option>
                  <option value="โรงแรมสยามเคมปินสกี้ กรุงเทพฯ">
                    โรงแรมสยามเคมปินสกี้ กรุงเทพฯ
                  </option>
                  <option value="โชว์รูม Thanatooth Luxury Drive สุขุมวิท">
                    โชว์รูม Thanatooth Luxury Drive สุขุมวิท
                  </option>
                  <option value="บริการส่งมอบถึงที่พัก / โรงแรมส่วนบุคคล (กรุงเทพฯ)">
                    บริการส่งมอบถึงที่พัก / โรงแรมส่วนบุคคล (กรุงเทพฯ)
                  </option>
                </select>
              </div>

              {/* Section 3: Add-on Services & System Functions */}
              <div className="form-section-title">
                <span className="sec-icon"></span> 3. เลือกฟังก์ชันและบริการเสริมพิเศษ
              </div>

              <div className="system-functions-list">
                {/* VIP Chauffeur */}
                <label className={`function-toggle-card ${formData.withDriver ? "checked" : ""}`}>
                  <input
                    type="checkbox"
                    name="withDriver"
                    checked={formData.withDriver}
                    onChange={handleChange}
                  />
                  <div className="fn-card-content">
                    <div className="fn-icon-box"></div>
                    <div className="fn-text-box">
                      <div className="fn-title-line">
                        <strong>บริการคนขับส่วนตัว (VIP Chauffeur)</strong>
                        <span className="fn-price-badge">+฿3,000 / วัน</span>
                      </div>
                      <p>พนักงานขับรถส่วนตัวระดับมืออาชีพ สวมสูทสากล สุภาพ ชำนาญเส้นทาง</p>
                    </div>
                  </div>
                </label>

                {/* Zero Excess Insurance */}
                <label
                  className={`function-toggle-card ${formData.premiumInsurance ? "checked" : ""}`}
                >
                  <input
                    type="checkbox"
                    name="premiumInsurance"
                    checked={formData.premiumInsurance}
                    onChange={handleChange}
                  />
                  <div className="fn-card-content">
                    <div className="fn-icon-box"></div>
                    <div className="fn-text-box">
                      <div className="fn-title-line">
                        <strong>ประกันภัยชั้น 1 พรีเมียม (Zero Excess Coverage)</strong>
                        <span className="fn-price-badge">+฿2,000 / วัน</span>
                      </div>
                      <p>คุ้มครองความเสียหาย 100% ไร้กังวลทุกการขับขี่ ไม่ต้องจ่ายค่าเสียหายส่วนแรก</p>
                    </div>
                  </div>
                </label>

                {/* Free Child Seat */}
                <label className={`function-toggle-card ${formData.childSeat ? "checked" : ""}`}>
                  <input
                    type="checkbox"
                    name="childSeat"
                    checked={formData.childSeat}
                    onChange={handleChange}
                  />
                  <div className="fn-card-content">
                    <div className="fn-icon-box"></div>
                    <div className="fn-text-box">
                      <div className="fn-title-line">
                        <strong>เบาะนั่งนิรภัยสำหรับเด็ก (Child Safety Seat)</strong>
                        <span className="fn-price-badge free">ฟรี VIP Included</span>
                      </div>
                      <p>มาตรฐานความปลอดภัยสากล ISOFIX เหมาะสำหรับการเดินทางพร้อมครอบครัว</p>
                    </div>
                  </div>
                </label>

                {/* In-Car 5G Wi-Fi */}
                <label className={`function-toggle-card ${formData.freeWifi ? "checked" : ""}`}>
                  <input
                    type="checkbox"
                    name="freeWifi"
                    checked={formData.freeWifi}
                    onChange={handleChange}
                  />
                  <div className="fn-card-content">
                    <div className="fn-icon-box"></div>
                    <div className="fn-text-box">
                      <div className="fn-title-line">
                        <strong>อินเทอร์เน็ตพกพาในรถยนต์ (In-Car 5G High-Speed Wi-Fi)</strong>
                        <span className="fn-price-badge free">ฟรี VIP Included</span>
                      </div>
                      <p>สัญญาณอินเทอร์เน็ต 5G ไม่จำกัด เชื่อมต่ออุปกรณ์ได้สูงสุด 8 เครื่องพร้อมกัน</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Section 4: Live Price Summary */}
              <div className="live-pricing-summary-card">
                <div className="summary-line">
                  <span>ระยะเวลาการเช่า:</span>
                  <strong>{totalDays} วัน</strong>
                </div>
                <div className="summary-line">
                  <span>
                    ค่าเช่ารถ ({totalDays} วัน × ฿{Number(carData.dailyRate).toLocaleString()}):
                  </span>
                  <span>฿{baseRent.toLocaleString()}</span>
                </div>

                {formData.withDriver && (
                  <div className="summary-line highlight">
                    <span> บริการคนขับส่วนตัว ({totalDays} วัน × ฿3,000):</span>
                    <span>+฿{driverFee.toLocaleString()}</span>
                  </div>
                )}

                {formData.premiumInsurance && (
                  <div className="summary-line highlight">
                    <span> ประกันภัยชั้น 1 พรีเมียม ({totalDays} วัน × ฿2,000):</span>
                    <span>+฿{insuranceFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="summary-divider"></div>

                <div className="summary-total-line">
                  <div className="total-label-wrap">
                    <span>ยอดชำระสุทธิทั้งหมด</span>
                    <small>(รวมภาษีและบริการทั้งหมดแล้ว)</small>
                  </div>
                  <div className="grand-total-gold">฿{totalPrice.toLocaleString()}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-action-buttons-row">
                <button type="button" className="btn-cancel-modal" onClick={onClose}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-confirm-booking-gold">
                  {isEdit
                    ? " บันทึกการแก้ไขการจอง"
                    : ` ยืนยันการจองรถ (฿${totalPrice.toLocaleString()})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
