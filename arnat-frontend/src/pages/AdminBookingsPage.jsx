// src/pages/AdminBookingsPage.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import "./AdminBookingsPage.css";

const TRACKING_STEPS = [
  { stepIndex: 0, num: 1, label: "ทำการจองเรียบร้อยแล้ว" },
  { stepIndex: 1, num: 2, label: "ผู้ดูแลระบบอนุมัติแล้ว" },
  { stepIndex: 2, num: 3, label: "ยืนยันการชำระเงินเรียบร้อยแล้ว" },
  { stepIndex: 3, num: 4, label: "รถที่เตรียมพร้อม" },
  { stepIndex: 4, num: 5, label: "กำลังจัดส่ง" },
  { stepIndex: 5, num: 6, label: "ส่งมอบ/ส่งมอบเรียบร้อยแล้ว" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'slip_uploaded' | 'confirmed' | 'rejected'
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected temporary steps per booking before confirming
  const [selectedSteps, setSelectedSteps] = useState({});

  // Modals state
  const [activeSlipBooking, setActiveSlipBooking] = useState(null);
  const [viewDetailBooking, setViewDetailBooking] = useState(null);
  const [printVoucherBooking, setPrintVoucherBooking] = useState(null);
  const [rejectModalBooking, setRejectModalBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = () => {
    const list = bookingService.getAll();
    setBookings(list);
  };

  useEffect(() => {
    loadData();
    bookingService.syncWithBackend().then((latest) => {
      if (latest && Array.isArray(latest)) {
        setBookings(latest);
      }
    });

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Stats calculation including total revenue
  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status?.toLowerCase() === "pending").length;
    const slips = bookings.filter((b) => b.paymentStatus === "Slip Uploaded").length;
    const paid = bookings.filter((b) => b.paymentStatus === "Paid").length;
    
    // Calculate total verified collected revenue
    const totalRevenue = bookings
      .filter((b) => b.paymentStatus === "Paid")
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

    return { total, pending, slips, paid, totalRevenue };
  }, [bookings]);

  // Search & Filter combined logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      if (filter === "pending" && b.status?.toLowerCase() !== "pending") return false;
      if (filter === "slip_uploaded" && b.paymentStatus !== "Slip Uploaded") return false;
      if (filter === "confirmed" && b.status?.toLowerCase() !== "confirmed") return false;
      if (filter === "rejected" && b.status?.toLowerCase() !== "rejected") return false;

      // 2. Search Filter (Ref ID, Client Name, Phone, Car Model)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchRef = String(b.id || "").toLowerCase().includes(term);
        const matchName = String(b.customerName || "").toLowerCase().includes(term);
        const matchPhone = String(b.phone || "").toLowerCase().includes(term);
        const matchCar = String(b.carModel || "").toLowerCase().includes(term);
        const matchLoc = String(b.pickupLocation || "").toLowerCase().includes(term);
        return matchRef || matchName || matchPhone || matchCar || matchLoc;
      }

      return true;
    });
  }, [bookings, filter, searchTerm]);

  // Admin Actions
  const handleConfirmBooking = async (id) => {
    bookingService.update(id, {
      status: "Confirmed",
      handoverStatus: "Pending Prep",
      confirmedAt: new Date().toISOString(),
    });
    loadData();
    alert(`Reservation #${id} has been approved. The customer can now make payment via QR code.`);
  };

  const handleVerifyPayment = async (id) => {
    bookingService.update(id, {
      paymentStatus: "Paid",
      adminPaymentVerified: true, // แอดมินยืนยันยอดเงินแล้ว ปลดล็อกปุ่ม Handover Tracking ฝั่งลูกค้า
      liveTrackingStep: 2, // ก้าวสู่ขั้นที่ 3: ยืนยันการชำระเงินเรียบร้อยแล้ว
      handoverStatus: "Vehicle Prepared",
      paidAt: new Date().toISOString(),
    });
    setActiveSlipBooking(null);
    loadData();
    alert(`ยืนยันการชำระเงินของรหัสจอง #${id} เรียบร้อยแล้ว! ข้อมูลได้บันทึกลง phpMyAdmin และเปิดปุ่ม Live Handover Tracking ให้ลูกค้าเรียบร้อยแล้วครับ`);
  };

  const handleUpdateHandoverStatus = (id, newStatus) => {
    bookingService.update(id, {
      handoverStatus: newStatus,
    });
    loadData();
  };

  // แอดมินคลิกเปลี่ยนขั้นตอน Stepper 1 - 6 แบบสด
  const handleSetTrackingStep = (id, stepIndex) => {
    const stepData = TRACKING_STEPS[stepIndex];
    let autoHandoverStatus = "Pending Prep";
    let autoStatus = "Pending";
    let autoPayment = "Unpaid";

    if (stepIndex >= 1) autoStatus = "Confirmed";
    if (stepIndex >= 2) autoPayment = "Paid";
    if (stepIndex === 3) autoHandoverStatus = "Vehicle Prepared";
    if (stepIndex === 4) autoHandoverStatus = "Dispatched / Ready";
    if (stepIndex >= 5) autoHandoverStatus = "Active Rental";

    const updatePayload = {
      liveTrackingStep: stepIndex,
      handoverStatus: autoHandoverStatus,
      status: stepIndex >= 1 ? "Confirmed" : "Pending",
      paymentStatus: stepIndex >= 2 ? "Paid" : autoPayment,
      adminPaymentVerified: stepIndex >= 2 ? true : false,
    };

    bookingService.update(id, updatePayload);
    loadData();
  };

  const handleConfirmReject = () => {
    if (!rejectModalBooking) return;
    bookingService.update(rejectModalBooking.id, {
      status: "Rejected",
      rejectionReason: rejectReason || "Vehicle unavailable or terms unfulfilled",
    });
    setRejectModalBooking(null);
    setRejectReason("");
    loadData();
    alert(`Reservation #${rejectModalBooking.id} has been rejected.`);
  };

  return (
    <div className="admin-page-root">
      <div className="admin-container">
        {/* Header Bar */}
        <div className="admin-header-bar">
          <div>
            <span className="admin-tag-gold">MANAGEMENT CONSOLE</span>
            <h1>Concierge Admin Portal</h1>
            <p>Comprehensive luxury fleet operations, client vetting, real-time banking slip audit, and logistics.</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/my-bookings" className="btn-admin-link">
              View Client Reservations
            </Link>
          </div>
        </div>

        {/* 5 Stats Counter Cards (Including Revenue) */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="stat-label">Total Reservations</span>
            <span className="stat-number">{stats.total}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Pending Approval</span>
            <span className="stat-number amber">{stats.pending}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Slips Awaiting Audit</span>
            <span className="stat-number gold">{stats.slips}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Completed & Paid</span>
            <span className="stat-number green">{stats.paid}</span>
          </div>
          <div className="admin-stat-card">
            <span className="stat-label">Verified Total Revenue</span>
            <span className="stat-number gold">฿{stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Search Bar & Filter Buttons */}
        <div className="admin-controls-card">
          <div className="search-input-wrap">
            <svg className="search-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Client Name, Phone, Car Model, Ref #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-tabs">
            <button
              type="button"
              className={`admin-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending ({stats.pending})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${filter === "slip_uploaded" ? "active" : ""}`}
              onClick={() => setFilter("slip_uploaded")}
            >
              Slip Uploaded ({stats.slips})
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${filter === "confirmed" ? "active" : ""}`}
              onClick={() => setFilter("confirmed")}
            >
              Confirmed
            </button>
            <button
              type="button"
              className={`admin-filter-btn ${filter === "rejected" ? "active" : ""}`}
              onClick={() => setFilter("rejected")}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Bookings Management Table */}
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Client Name & Phone</th>
                <th>Vehicle & Dates</th>
                <th>Handover Point</th>
                <th>Total Price</th>
                <th>Booking Status</th>
                <th>Payment</th>
                <th>สถานะการส่งมอบ (Live Tracking)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No bookings found matching current filters or search term.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong style={{ color: "#0f172a" }}>#{b.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{b.customerName}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{b.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.carModel}</div>
                      <div style={{ fontSize: "12px", color: "#b8860b" }}>
                        {b.startDate} → {b.endDate} ({b.totalDays} Days)
                      </div>
                    </td>
                    <td style={{ maxWidth: "200px" }}>
                      <div style={{ fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.pickupLocation}
                      </div>
                      {b.deliveryFee > 0 && (
                        <span className="badge-delivery-tag home">Home Delivery (+฿2,000)</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ fontFamily: "var(--font-display)", color: "#b8860b", fontSize: "14.5px" }}>
                        ฿{b.totalPrice?.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge-status ${b.status?.toLowerCase() || "pending"}`}>
                        {b.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-pay ${
                          b.paymentStatus === "Paid"
                            ? "paid"
                            : b.paymentStatus === "Slip Uploaded"
                            ? "slip"
                            : "unpaid"
                        }`}
                      >
                        {b.paymentStatus || "Unpaid"}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const savedIdx =
                          typeof b.liveTrackingStep === "number"
                            ? b.liveTrackingStep
                            : b.handoverStatus === "Active Rental" || b.handoverStatus === "Returned & Closed"
                            ? 5
                            : b.handoverStatus === "Dispatched / Ready"
                            ? 4
                            : b.handoverStatus === "Vehicle Prepared"
                            ? 3
                            : b.paymentStatus === "Paid"
                            ? 2
                            : b.status?.toLowerCase() === "confirmed"
                            ? 1
                            : 0;

                        // ถ้ามีการเลือกใน dropdown แต่ยังไม่กดยืนยัน ให้ใช้ค่าที่เลือกไว้ชั่วคราว
                        const currentChoice =
                          selectedSteps[b.id] !== undefined
                            ? selectedSteps[b.id]
                            : savedIdx;

                        const isChanged = currentChoice !== savedIdx;

                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <select
                                className="handover-step-dropdown"
                                value={currentChoice}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setSelectedSteps((prev) => ({ ...prev, [b.id]: val }));
                                }}
                              >
                                {TRACKING_STEPS.map((step) => (
                                  <option key={step.stepIndex} value={step.stepIndex}>
                                    ขั้นที่ {step.num}: {step.label}
                                  </option>
                                ))}
                              </select>

                              {/* ปุ่มกดยืนยันการเปลี่ยนสถานะ */}
                              <button
                                type="button"
                                className={`btn-confirm-step ${isChanged ? "highlight" : ""}`}
                                onClick={() => {
                                  handleSetTrackingStep(b.id, currentChoice);
                                  setSelectedSteps((prev) => {
                                    const next = { ...prev };
                                    delete next[b.id];
                                    return next;
                                  });
                                  alert(`อัปเดตและยืนยันสถานะการส่งมอบของ #${b.id} เป็น "ขั้นที่ ${currentChoice + 1}: ${TRACKING_STEPS[currentChoice]?.label}" สำเร็จแล้ว!`);
                                }}
                                title="กดยืนยันสถานะเพื่ออัปเดตให้ลูกค้าเห็นสดแบบ Real-Time"
                              >
                                ยืนยันสถานะ
                              </button>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "11px", color: savedIdx >= 4 ? "#16a34a" : "#b8860b", fontWeight: 600 }}>
                                ปัจจุบัน: ขั้นที่ {savedIdx + 1} ({TRACKING_STEPS[savedIdx]?.label})
                              </span>
                              {isChanged && (
                                <span style={{ fontSize: "10.5px", color: "#d97706", fontWeight: 700 }}>
                                  ● รอกดยืนยัน
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {/* Approve Booking Button */}
                        {b.status?.toLowerCase() === "pending" && (
                          <button
                            type="button"
                            className="btn-admin-act approve"
                            onClick={() => handleConfirmBooking(b.id)}
                            title="Approve booking and unlock client payment"
                          >
                            Approve
                          </button>
                        )}

                        {/* View Transfer Slip */}
                        {b.paymentSlipUrl && (
                          <button
                            type="button"
                            className="btn-admin-act inspect"
                            onClick={() => setActiveSlipBooking(b)}
                          >
                            Inspect Slip
                          </button>
                        )}

                        {/* ปุ่มยืนยันสถานะชำระเงินของลูกค้า (เมื่อมีสลิปแนบเข้ามาและแอดมินยังไม่ได้กดยืนยันไฟนอล) */}
                        {b.paymentSlipUrl && !b.adminPaymentVerified && (
                          <button
                            type="button"
                            className="btn-admin-act verify-pay"
                            onClick={() => handleVerifyPayment(b.id)}
                            style={{ background: "#b8860b", color: "#ffffff", fontWeight: 800 }}
                            title="คลิกเพื่อยืนยันว่าลูกค้าชำระเงินเรียบร้อยแล้ว และเปิดปุ่ม Handover Tracking ให้ลูกค้า"
                          >
                            ✓ ยืนยันการชำระเงิน
                          </button>
                        )}

                        {/* View Full Dossier */}
                        <button
                          type="button"
                          className="btn-admin-act view-detail"
                          onClick={() => setViewDetailBooking(b)}
                        >
                          Dossier
                        </button>

                        {/* Print Voucher */}
                        <button
                          type="button"
                          className="btn-admin-act view-detail"
                          onClick={() => setPrintVoucherBooking(b)}
                          title="Generate printable reservation voucher"
                        >
                          Voucher
                        </button>

                        {/* Reject Reservation */}
                        {b.status?.toLowerCase() !== "rejected" && (
                          <button
                            type="button"
                            className="btn-admin-act reject"
                            onClick={() => setRejectModalBooking(b)}
                            title="Reject reservation or cancel contract"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MODAL 1: FULL DOSSIER DETAILS ================= */}
        {viewDetailBooking && (
          <div className="admin-modal-overlay" onClick={() => setViewDetailBooking(null)}>
            <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <div>
                  <span className="admin-tag-gold">CLIENT DOSSIER</span>
                  <h3>Reservation #{viewDetailBooking.id}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    Created on {new Date(viewDetailBooking.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>
                <button type="button" className="btn-close-modal" onClick={() => setViewDetailBooking(null)}>
                  ✕
                </button>
              </div>

              <div className="dossier-grid">
                <div className="dossier-item">
                  <span className="dossier-lbl">Client Full Name</span>
                  <span className="dossier-val">{viewDetailBooking.customerName}</span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-lbl">Contact Phone</span>
                  <span className="dossier-val">{viewDetailBooking.phone}</span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-lbl">Confirmation Email</span>
                  <span className="dossier-val">{viewDetailBooking.email || "Not specified"}</span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-lbl">Driver License / Passport</span>
                  <span className="dossier-val">{viewDetailBooking.driverLicense}</span>
                </div>

                <div className="dossier-item full-span">
                  <span className="dossier-lbl">Reserved Vehicle</span>
                  <span className="dossier-val gold">{viewDetailBooking.carModel}</span>
                </div>

                <div className="dossier-item">
                  <span className="dossier-lbl">Rental Period</span>
                  <span className="dossier-val">
                    {viewDetailBooking.startDate} to {viewDetailBooking.endDate} ({viewDetailBooking.totalDays} Days)
                  </span>
                </div>
                <div className="dossier-item">
                  <span className="dossier-lbl">Total Net Amount</span>
                  <span className="dossier-val gold">฿{viewDetailBooking.totalPrice?.toLocaleString()}</span>
                </div>

                <div className="dossier-item full-span">
                  <span className="dossier-lbl">Handover Location & Address</span>
                  <span className="dossier-val">{viewDetailBooking.pickupLocation}</span>
                </div>

                <div className="dossier-item full-span">
                  <span className="dossier-lbl">Included Services & Amenities</span>
                  <div className="dossier-chips-wrap">
                    <span className="d-chip active">First-Class Comprehensive</span>
                    {viewDetailBooking.withDriver && <span className="d-chip active">VIP Private Chauffeur</span>}
                    {viewDetailBooking.premiumInsurance && <span className="d-chip active">Zero Excess Protection</span>}
                    {viewDetailBooking.tireGlassProtection && <span className="d-chip active">Wheels, Tires & Glass</span>}
                    {viewDetailBooking.lossOfUseCoverage && <span className="d-chip active">Loss of Use Waiver</span>}
                    {viewDetailBooking.deliveryFee > 0 && <span className="d-chip active">Home Delivery (+฿2,000)</span>}
                  </div>
                </div>

                {viewDetailBooking.specialRequests && (
                  <div className="dossier-item full-span">
                    <span className="dossier-lbl">Special Instructions</span>
                    <span className="dossier-val">{viewDetailBooking.specialRequests}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="btn-admin-act view-detail"
                  onClick={() => {
                    setPrintVoucherBooking(viewDetailBooking);
                    setViewDetailBooking(null);
                  }}
                >
                  Print Voucher
                </button>
                <button
                  type="button"
                  className="btn-admin-act inspect"
                  onClick={() => setViewDetailBooking(null)}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 2: INSPECT SLIP ================= */}
        {activeSlipBooking && (
          <div className="admin-modal-overlay" onClick={() => setActiveSlipBooking(null)}>
            <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <div>
                  <span className="admin-tag-gold">BANKING SLIP AUDIT</span>
                  <h3>Slip Verification #{activeSlipBooking.id}</h3>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>
                    Client: <strong>{activeSlipBooking.customerName}</strong> · Payable Amount:{" "}
                    <strong style={{ color: "#b8860b" }}>฿{activeSlipBooking.totalPrice?.toLocaleString()}</strong>
                  </p>
                </div>
                <button type="button" className="btn-close-modal" onClick={() => setActiveSlipBooking(null)}>
                  ✕
                </button>
              </div>

              <img
                src={activeSlipBooking.paymentSlipUrl}
                alt="Customer Payment Receipt"
                className="slip-full-img"
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="admin-filter-btn"
                  onClick={() => setActiveSlipBooking(null)}
                >
                  Close
                </button>
                {activeSlipBooking.paymentStatus !== "Paid" && (
                  <button
                    type="button"
                    className="btn-admin-act verify-pay"
                    style={{ padding: "10px 20px" }}
                    onClick={() => handleVerifyPayment(activeSlipBooking.id)}
                  >
                    Verify & Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 3: PRINTABLE OFFICIAL VOUCHER ================= */}
        {printVoucherBooking && (
          <div className="admin-modal-overlay" onClick={() => setPrintVoucherBooking(null)}>
            <div className="admin-modal-card" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3>Official Reservation Voucher</h3>
                <button type="button" className="btn-close-modal" onClick={() => setPrintVoucherBooking(null)}>
                  ✕
                </button>
              </div>

              {/* Printable Area */}
              <div className="voucher-paper">
                <div className="voucher-header">
                  <div className="voucher-brand">
                    Thanatooth <span>LUXURY AUTO</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong>VOUCHER REF: #{printVoucherBooking.id}</strong>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                      Date: {new Date().toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px", marginBottom: "16px" }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Client Name:</span>
                    <div><strong>{printVoucherBooking.customerName}</strong></div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Contact Phone:</span>
                    <div><strong>{printVoucherBooking.phone}</strong></div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Vehicle:</span>
                    <div><strong style={{ color: "#b8860b" }}>{printVoucherBooking.carModel}</strong></div>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Rental Duration:</span>
                    <div><strong>{printVoucherBooking.startDate} to {printVoucherBooking.endDate} ({printVoucherBooking.totalDays} Days)</strong></div>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={{ color: "#64748b" }}>Handover Address:</span>
                    <div><strong>{printVoucherBooking.pickupLocation}</strong></div>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Payment Status:</span>
                    <strong style={{ display: "block", color: printVoucherBooking.paymentStatus === "Paid" ? "#16a34a" : "#b45309" }}>
                      {printVoucherBooking.paymentStatus === "Paid" ? "CONFIRMED & FULLY PAID" : "PENDING PAYMENT"}
                    </strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Total Contract Value:</span>
                    <strong style={{ display: "block", fontSize: "18px", color: "#b8860b" }}>
                      THB {printVoucherBooking.totalPrice?.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="btn-admin-act view-detail"
                  onClick={() => window.print()}
                >
                  Print to PDF / Paper
                </button>
                <button
                  type="button"
                  className="btn-admin-act inspect"
                  onClick={() => setPrintVoucherBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL 4: REJECT RESERVATION ================= */}
        {rejectModalBooking && (
          <div className="admin-modal-overlay" onClick={() => setRejectModalBooking(null)}>
            <div className="admin-modal-card" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3 style={{ color: "#dc2626" }}>Reject Reservation #{rejectModalBooking.id}</h3>
                <button type="button" className="btn-close-modal" onClick={() => setRejectModalBooking(null)}>
                  ✕
                </button>
              </div>

              <p style={{ fontSize: "14px", color: "#475569", margin: 0 }}>
                Please specify the official reason for rejecting client <strong>{rejectModalBooking.customerName}</strong>:
              </p>

              <textarea
                rows={3}
                style={{
                  width: "100%",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px",
                  fontFamily: "inherit",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder="e.g. Schedule overlap, license verification failed, or vehicle undergoing routine maintenance..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  className="admin-filter-btn"
                  onClick={() => setRejectModalBooking(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-admin-act reject"
                  style={{ padding: "10px 18px" }}
                  onClick={handleConfirmReject}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
