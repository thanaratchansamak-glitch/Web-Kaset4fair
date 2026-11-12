// src/pages/MyBookingsPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import "./MyBookingsPage.css";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [cancelModalId, setCancelModalId] = useState(null);
  const navigate = useNavigate();

  const loadBookings = () => {
    const list = bookingService.getAll();
    setBookings(list);
  };

  useEffect(() => {
    loadBookings();
    bookingService.syncWithBackend().then((latest) => {
      if (latest && Array.isArray(latest)) {
        setBookings(latest);
      }
    });

    const handleStorageChange = () => {
      loadBookings();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("booking_updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("booking_updated", handleStorageChange);
    };
  }, []);

  const handleConfirmCancel = () => {
    if (cancelModalId) {
      bookingService.delete(cancelModalId);
      setCancelModalId(null);
      loadBookings();
    }
  };

  return (
    <div className="my-bookings-page-root">
      <div className="bookings-container">
        {/* Header Bar */}
        <div className="bookings-page-header">
          <div>
            <span className="header-tag-gold">CLIENT RESERVATIONS</span>
            <h1>Client Reservations & Itineraries</h1>
            <p>Review real-time status, modify reservation terms, or manage your luxury fleet experience.</p>
          </div>
          <Link to="/fleet" className="btn-add-new-booking-gold">
            <span>+ Reserve New Vehicle</span>
          </Link>
        </div>

        {/* Bookings List or Empty State */}
        {bookings.length === 0 ? (
          <div className="no-bookings-card">
            <h2>No Active Reservations Found</h2>
            <p>
              Experience world-class luxury mobility. Explore our hand-curated collection of 80 prestigious models today.
            </p>
            <Link to="/fleet" className="btn-explore-now-gold">
              Explore All 80 Fleet Models
            </Link>
          </div>
        ) : (
          <div className="bookings-cards-grid">
            {bookings.map((item) => (
              <div key={item.id} className="booking-ticket-card">
                {/* Ticket Top Header */}
                <div className="ticket-top-bar">
                  <div className="ticket-code-group">
                    <span className="booking-ref-label">RESERVATION REF</span>
                    <strong className="booking-ref-code">#{item.id}</strong>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className={`status-pill ${item.status?.toLowerCase() || "pending"}`}>
                      ● {item.status === "Pending" ? "Awaiting Admin Confirmation" : (item.status || "Confirmed")}
                    </span>
                    {item.paymentStatus && item.paymentStatus !== "Unpaid" && (
                      <span className={`status-pill ${item.adminPaymentVerified ? "confirmed" : item.paymentStatus === "Paid" ? "confirmed" : "pending"}`} style={{ fontSize: "11px" }}>
                        {item.adminPaymentVerified ? "Payment Verified & Finalized" : item.paymentStatus === "Paid" ? "Paid (Reviewing)" : item.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ticket Main Content */}
                <div className="ticket-main-grid">
                  {/* Car Photo */}
                  <div className="ticket-car-photo-box">
                    <img src={item.imageUrl}
                      alt={item.carModel}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/car-placeholder.svg";
                      }}
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="ticket-details-box">
                    <h3 className="ticket-car-name">{item.carModel}</h3>

                    <div className="ticket-meta-grid">
                      <div className="meta-item">
                        <span className="m-lbl">Client Name:</span>
                        <span className="m-val">{item.customerName}</span>
                      </div>
                      <div className="meta-item">
                        <span className="m-lbl">Contact Phone:</span>
                        <span className="m-val">{item.phone}</span>
                      </div>
                      <div className="meta-item">
                        <span className="m-lbl">Rental Duration:</span>
                        <span className="m-val gold">
                          {item.startDate} to {item.endDate} ({item.totalDays} Days)
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="m-lbl">Handover Point:</span>
                        <span className="m-val">{item.pickupLocation}</span>
                      </div>
                    </div>

                    {/* Services Chips */}
                    <div className="ticket-services-chips">
                      <span className="t-chip">First-Class Comprehensive</span>
                      {item.withDriver && (
                        <span className="t-chip gold">VIP Chauffeur Included</span>
                      )}
                      {item.premiumInsurance && (
                        <span className="t-chip gold">Zero Excess Protection</span>
                      )}
                      {item.tireGlassProtection && (
                        <span className="t-chip gold">Tire & Glass Coverage</span>
                      )}
                      {item.lossOfUseCoverage && (
                        <span className="t-chip gold">Loss of Use Waiver</span>
                      )}
                      {item.deliveryFee > 0 && (
                        <span className="t-chip gold">Home Delivery (+฿2,000)</span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="ticket-price-action-box">
                    <div className="ticket-price-box">
                      <span className="t-price-lbl">Net Total Amount</span>
                      <strong className="t-price-num">
                        ฿{item.totalPrice?.toLocaleString() || "0"}
                      </strong>
                    </div>

                    <div className="ticket-buttons-col">
                      {/* เมื่อแอดมิน Confirm แล้ว จะแสดงกล่องสถานะชำระเงิน */}
                      {item.status?.toLowerCase() === "confirmed" ? (
                        <div className="confirmed-action-box">
                          {/* แสดงปุ่ม Handover Tracking เฉพาะเมื่อแอดมินกดยืนยันการชำระเงินแล้ว (adminPaymentVerified === true) */}
                          {item.adminPaymentVerified && (
                            <Link
                              to={`/tracking/${item.id}`}
                              className="btn-live-track"
                            >
                              <span className="track-pulse-dot" />
                              <span>Live Handover Tracking</span>
                            </Link>
                          )}

                          <Link
                            to={`/payment/${item.id}`}
                            className="btn-pay-modal-trigger"
                            style={{
                              background: item.adminPaymentVerified
                                ? "#16a34a"
                                : item.paymentStatus === "Paid"
                                ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                                : "linear-gradient(135deg, #b8860b 0%, #d4af37 100%)"
                            }}
                          >
                            <div className="pay-btn-title">
                              {item.adminPaymentVerified
                                ? "Payment Verified & Finalized"
                                : item.paymentStatus === "Paid"
                                ? "Paid (Waiting for Admin Verification)"
                                : "Pay via QR Code & Upload Slip"}
                            </div>
                            <span className="pay-btn-sub">
                              {item.adminPaymentVerified
                                ? "Vehicle Handover in Progress"
                                : item.paymentStatus === "Paid"
                                ? "สลิปถูกส่งแล้ว - รอแอดมินตรวจสอบยอดเงิน"
                                : "Scan PromptPay & send slip"}
                            </span>
                          </Link>

                          <div className="locked-note-badge">
                            {item.adminPaymentVerified
                              ? "Payment Confirmed by Admin"
                              : item.paymentStatus === "Paid"
                              ? "รอแอดมินตรวจสอบและยืนยันการชำระเงิน"
                              : "Reservation Confirmed (Terms Locked)"}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Modify Details Button */}
                          <Link
                            to={`/edit-booking/${item.id}`}
                            className="btn-ticket-modify"
                          >
                            Modify Details
                          </Link>

                          {/* Cancel Booking Button */}
                          <button
                            type="button"
                            className="btn-ticket-cancel"
                            onClick={() => setCancelModalId(item.id)}
                          >
                            Cancel Booking
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelModalId && (
          <div className="confirm-modal-overlay" onClick={() => setCancelModalId(null)}>
            <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3>Cancel This Reservation?</h3>
              <p>
                Are you sure you want to cancel and remove reservation <strong>#{cancelModalId}</strong>?
                This action is irreversible.
              </p>
              <div className="confirm-modal-actions">
                <button type="button"
                  className="btn-modal-back"
                  onClick={() => setCancelModalId(null)}
                >
                  Keep Reservation
                </button>
                <button type="button"
                  className="btn-modal-delete-confirm"
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
