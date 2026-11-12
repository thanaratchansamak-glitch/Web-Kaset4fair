// src/pages/TrackingPage.jsx
import { useMemo, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { initialCars } from "../data/cars";
import "./TrackingPage.css";

const STEPS = [
  { id: "booking_placed", stepNumber: 1, label: "ทำการจองเรียบร้อยแล้ว", sub: "ระบบบันทึกคำสั่งจองเรียบร้อย" },
  { id: "admin_approved", stepNumber: 2, label: "ผู้ดูแลระบบอนุมัติแล้ว", sub: "แอดมินตรวจสอบและอนุมัติสัญญา" },
  { id: "payment_verified", stepNumber: 3, label: "ยืนยันการชำระเงินเรียบร้อยแล้ว", sub: "ตรวจสอบสลิปและรับชำระเงิน" },
  { id: "prep_stage", stepNumber: 4, label: "รถที่เตรียมพร้อม", sub: "ตรวจเช็ก 150 จุด ล้างเคลือบแก้ว เติมน้ำมันเต็มถัง" },
  { id: "dispatched", stepNumber: 5, label: "กำลังจัดส่ง", sub: "ขนส่งขึ้นรถสไลด์ปิดมิดชิด หรือพร้อมรับที่โชว์รูม" },
  { id: "handover_done", stepNumber: 6, label: "ส่งมอบ/ส่งมอบเรียบร้อยแล้ว", sub: "ส่งมอบกุญแจรถและเริ่มการเดินทาง" },
];

export default function TrackingPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(() => bookingService.getById(id));

  // ฟัง event อัปเดตข้อมูลแบบสด Real-Time ทันทีที่แอดมินคลิกเปลี่ยนปุ่ม
  useEffect(() => {
    const handleUpdate = () => {
      setBooking(bookingService.getById(id));
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("booking_updated", handleUpdate);

    // Sync กับ backend และรีเฟรชข้อมูลล่าสุด
    bookingService.syncWithBackend().then(() => {
      setBooking(bookingService.getById(id));
    });

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("booking_updated", handleUpdate);
    };
  }, [id]);

  const car = useMemo(() => {
    if (!booking) return null;
    return initialCars.find((c) => c.id === booking.carId) || {
      imageUrl: booking.imageUrl,
      brand: booking.carModel?.split(" ")[0] || "Luxury Car",
      model: booking.carModel || "",
    };
  }, [booking]);

  // คำนวณ Index ปัจจุบันของ Step (0 - 5) อิงตามฟิลด์ liveTrackingStep หรือคำนวณจากสถานะ
  const currentStepIndex = useMemo(() => {
    if (!booking) return 0;
    if (typeof booking.liveTrackingStep === "number") {
      return booking.liveTrackingStep;
    }

    const isApproved = booking.status?.toLowerCase() === "confirmed";
    const isPaid = booking.paymentStatus === "Paid";
    const hStatus = booking.handoverStatus || "";

    if (hStatus === "Active Rental" || hStatus === "Returned & Closed") return 5;
    if (hStatus === "Dispatched / Ready") return 4;
    if (hStatus === "Vehicle Prepared") return 3;
    if (isPaid) return 2;
    if (isApproved) return 1;
    return 0;
  }, [booking]);

  // คำนวณเปอร์เซ็นต์ความคืบหน้าของเส้น Gradient Fill
  const progressPercent = useMemo(() => {
    return Math.min(100, Math.round((currentStepIndex / (STEPS.length - 1)) * 100));
  }, [currentStepIndex]);

  // คำนวณกำหนดเวลาประมาณการ (ETA)
  const etaText = useMemo(() => {
    if (!booking) return "กำลังคำนวณ...";
    if (currentStepIndex === 5) return "ส่งมอบเสร็จสิ้น พร้อมใช้งาน";
    if (currentStepIndex === 4) return "รถกำลังเดินทาง ถึงในอีกประมาณ 45 - 60 นาที";
    if (currentStepIndex === 3) return `รถพร้อมแล้ว นัดส่งมอบ: ${booking.startDate} (09:30 น.)`;
    if (currentStepIndex === 2) return `ยืนยันยอดเงินแล้ว กำลังเตรียมนัดหมาย: ${booking.startDate}`;
    if (currentStepIndex === 1) return "อนุมัติแล้ว รอชำระเงิน";
    return `กำหนดส่งมอบ: ${booking.startDate}`;
  }, [booking, currentStepIndex]);

  if (!booking) {
    return (
      <div className="tracking-page-root">
        <div className="tracking-container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <h2>ไม่พบข้อมูลการติดตาม #{id}</h2>
          <p>ระบบไม่พบข้อมูลการจองนี้</p>
          <Link to="/my-bookings" className="btn-tracking-back">
            กลับสู่หน้ารายการจองของฉัน
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-page-root">
      <div className="tracking-container">
        {/* Breadcrumb */}
        <div className="tracking-breadcrumb">
          <Link to="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link to="/my-bookings">My Bookings</Link>
          <span className="crumb-sep">/</span>
          <span className="current">Live Handover Tracking #{id}</span>
        </div>

        {/* Header */}
        <div className="tracking-header-bar">
          <div>
            <span className="tracking-tag-gold">LIVE LOGISTICS TRACKING</span>
            <h1>Real-Time Vehicle Handover Status</h1>
            <p>ติดตามสถานะการเตรียมและจัดส่งรถยนต์หรูของคุณแบบเรียลไทม์ พร้อมตรวจสอบความคืบหน้าได้ตลอด 24 ชั่วโมง</p>
          </div>
          <Link to="/my-bookings" className="btn-tracking-back">
            ← กลับสู่หน้ารายการจอง
          </Link>
        </div>

        {/* Vehicle Banner */}
        <div className="tracking-vehicle-banner">
          <div className="vehicle-banner-left">
            <img
              src={car?.imageUrl || booking.imageUrl}
              alt={booking.carModel}
              className="vehicle-thumb-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/car-placeholder.svg";
              }}
            />
            <div className="vehicle-banner-info">
              <h3>{booking.carModel}</h3>
              <p>
                รหัสการจอง: <strong>#{id}</strong> · ผู้จอง: <strong>{booking.customerName}</strong>
              </p>
              <p style={{ marginTop: "4px", fontSize: "12.5px", color: "#b8860b" }}>
                ระยะเวลาเช่า: {booking.startDate} ถึง {booking.endDate} ({booking.totalDays} วัน)
              </p>
            </div>
          </div>

          <div className="vehicle-banner-right">
            <div className="eta-badge-box">
              <span className="eta-label">สถานะการส่งมอบ / ETA</span>
              <span className="eta-time">{etaText}</span>
            </div>
            {booking.deliveryFee > 0 ? (
              <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "600" }}>
                บริการจัดส่งถึงที่อยู่ของคุณ (+฿2,000)
              </span>
            ) : (
              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                รับเองที่โชว์รูม VIP Lounge
              </span>
            )}
          </div>
        </div>

        {/* Stepper Card สไตล์ Shopee ตรงตามรูปภาพของผู้ใช้ */}
        <div className="tracking-timeline-card">
          <h3 className="timeline-card-title">ตัวติดตามความคืบหน้าการส่งมอบ</h3>
          <p className="timeline-card-sub">ติดตามทุกขั้นตอนของกระบวนการส่งมอบรถยนต์หรูของคุณ</p>

          <div className="stepper-progress-bar">
            {/* Background Line with Dynamic Gradient Fill */}
            <div className="stepper-track-line">
              <div className="stepper-track-fill" style={{ width: `${progressPercent}%` }} />
            </div>

            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isActive = idx === currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`stepper-node ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}
                >
                  <div className="stepper-circle">
                    {isCompleted ? "✓" : step.stepNumber}
                  </div>
                  <span className="stepper-label">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Vertical Detailed History Feed */}
          <div className="history-feed-list">
            {/* Step 5: ส่งมอบเรียบร้อย */}
            {currentStepIndex >= 5 && (
              <div className="feed-item completed">
                <span className="feed-bullet" />
                <span className="feed-time">ส่งมอบสำเร็จ</span>
                <span className="feed-title">ส่งมอบรถยนต์และเอกสารสัญญาเรียบร้อยแล้ว</span>
                <p className="feed-desc">
                  เจ้าหน้าที่ Concierge ได้ส่งมอบกุญแจและตรวจสอบสภาพรถยนต์รอบคันร่วมกับคุณ {booking.customerName} เรียบร้อยแล้ว ระบบดูแลความปลอดภัย 24 ชม. เปิดใช้งานเต็มรูปแบบ
                </p>
              </div>
            )}

            {/* Step 4: กำลังจัดส่ง */}
            {currentStepIndex >= 4 && (
              <div className={`feed-item ${currentStepIndex === 4 ? "highlight" : "completed"}`}>
                <span className="feed-bullet" />
                <span className="feed-time">กำลังจัดส่ง / พร้อมรับ</span>
                <span className="feed-title">
                  {booking.deliveryFee > 0
                    ? "รถยนต์อยู่ระหว่างการขนส่งไปยังที่อยู่ของคุณ"
                    : "รถยนต์จอดสแตนด์บายพร้อมรับที่โชว์รูม VIP Lounge"}
                </span>
                <p className="feed-desc">
                  {booking.deliveryFee > 0
                    ? `รถยนต์ถูกบรรทุกบนรถสไลด์ปิดมิดชิด (Enclosed Transporter) มุ่งหน้าสู่: ${booking.pickupLocation}`
                    : `รถยนต์ ${booking.carModel} จอดในช่อง VIP Bay ที่: ${booking.pickupLocation} เจ้าหน้าที่เตรียมต้อนรับพร้อมส่งมอบ`}
                </p>
              </div>
            )}

            {/* Step 3: รถที่เตรียมพร้อม */}
            {currentStepIndex >= 3 && (
              <div className={`feed-item ${currentStepIndex === 3 ? "highlight" : "completed"}`}>
                <span className="feed-bullet" />
                <span className="feed-time">เตรียมความพร้อมเรียบร้อย</span>
                <span className="feed-title">รถยนต์ผ่านการตรวจเช็ก 150 จุด ล้างขัดเคลือบแก้ว และเติมน้ำมันเต็มถัง</span>
                <p className="feed-desc">
                  ทีมช่างเทคนิคและผู้เชี่ยวชาญดีเทลลิ่งทำการอบโอโซนฆ่าเชื้อห้องโดยสารระดับโรงพยาบาล ตรวจเช็กระบบไฟฟ้า ยางรถยนต์ และความพร้อมสมบูรณ์แบบ 100%
                </p>
              </div>
            )}

            {/* Step 2: ยืนยันการชำระเงินเรียบร้อยแล้ว */}
            {currentStepIndex >= 2 && (
              <div className={`feed-item ${currentStepIndex === 2 ? "highlight" : "completed"}`}>
                <span className="feed-bullet" />
                <span className="feed-time">ตรวจสอบยอดเงินผ่าน</span>
                <span className="feed-title">ยืนยันการชำระเงินและตรวจสลิปโอนเงินเรียบร้อยแล้ว</span>
                <p className="feed-desc">
                  ฝ่ายการเงินตรวจสอบสลิปโอนเงินยอด ฿{booking.totalPrice?.toLocaleString()} บาท ครบถ้วนถูกต้อง ล็อกสิทธิประโยชน์ประกันภัยชั้นหนึ่งและวงเงินมัดจำคุ้มครองทันที
                </p>
              </div>
            )}

            {/* Step 1: ผู้ดูแลระบบอนุมัติแล้ว */}
            {currentStepIndex >= 1 && (
              <div className={`feed-item ${currentStepIndex === 1 ? "highlight" : "completed"}`}>
                <span className="feed-bullet" />
                <span className="feed-time">อนุมัติคำขอเช่า</span>
                <span className="feed-title">ผู้ดูแลระบบ (Admin Concierge) อนุมัติการจองแล้ว</span>
                <p className="feed-desc">
                  ตรวจสอบประวัติผู้ขับขี่และใบขับขี่เรียบร้อย พร้อมล็อกคิวรถยนต์ {booking.carModel} ในตารางเดินรถของ Thanatooth Fleet
                </p>
              </div>
            )}

            {/* Step 0: ทำการจองเรียบร้อยแล้ว */}
            <div className={`feed-item ${currentStepIndex === 0 ? "highlight" : "completed"}`}>
              <span className="feed-bullet" />
              <span className="feed-time">
                {new Date(booking.createdAt || Date.now()).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
              </span>
              <span className="feed-title">ทำการจองเรียบร้อยแล้ว (รอการตรวจสอบ)</span>
              <p className="feed-desc">
                คำสั่งจองรหัส #{id} ได้รับการบันทึกเข้าสู่ระบบเรียบร้อย กำลังรอเจ้าหน้าที่ตรวจสอบรายละเอียด
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="tracking-info-grid">
          {/* Box 1: Delivery Destination */}
          <div className="tracking-info-box">
            <h4>ข้อมูลสถานที่และการรับมอบ</h4>
            <div className="info-lines-list">
              <div className="info-line-row">
                <span>วิธีรับมอบ:</span>
                <strong>{booking.deliveryFee > 0 ? "จัดส่งถึงที่อยู่ของคุณ (VIP Home Delivery)" : "รับเองที่โชว์รูม (Showroom Collection)"}</strong>
              </div>
              <div className="info-line-row">
                <span>สถานที่ส่งมอบ:</span>
                <strong>{booking.pickupLocation}</strong>
              </div>
              <div className="info-line-row">
                <span>วันส่งมอบรถ:</span>
                <strong style={{ color: "#b8860b" }}>{booking.startDate} (เป้าหมาย 09:30 น.)</strong>
              </div>
              <div className="info-line-row">
                <span>ผู้รับมอบ:</span>
                <strong>{booking.customerName} ({booking.phone})</strong>
              </div>
            </div>
          </div>

          {/* Box 2: Dedicated Concierge Contact */}
          <div className="tracking-info-box">
            <h4>ศูนย์บริการลูกค้า Thanatooth Concierge</h4>
            <div className="info-lines-list">
              <div className="info-line-row">
                <span>สาขาปฏิบัติการ:</span>
                <strong>Thanatooth Flagship Rama 9</strong>
              </div>
              <div className="info-line-row">
                <span>สายด่วน 24 ชั่วโมง:</span>
                <strong style={{ color: "#b8860b" }}>+66 (0) 92 863 6437</strong>
              </div>
              <div className="info-line-row">
                <span>ขั้นตอนปัจจุบัน:</span>
                <strong style={{ color: "#16a34a" }}>
                  {STEPS[currentStepIndex]?.label}
                </strong>
              </div>
              <div className="info-line-row">
                <span>บริการคนขับ:</span>
                <strong>{booking.withDriver ? "จัดคนขับรถ VIP Chauffeur สวมสูท" : "ขับเอง (Self-Drive Experience)"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
