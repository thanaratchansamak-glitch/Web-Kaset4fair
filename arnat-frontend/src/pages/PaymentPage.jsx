// src/pages/PaymentPage.jsx
import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import "./PaymentPage.css";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const booking = useMemo(() => {
    return bookingService.getById(id);
  }, [id]);

  const [slipImage, setSlipImage] = useState(booking?.paymentSlipUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate PromptPay / Bank QR image url
  const qrCodeUrl = useMemo(() => {
    if (!booking) return "";
    const amount = booking.totalPrice || 0;
    // ใช้ PromptPay QR generator service หรือ QR code API มาตรฐาน
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=PROMPTPAY-0928636437-AMOUNT-${amount}`;
  }, [booking]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSlipImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSlip = (e) => {
    e.preventDefault();
    if (!slipImage) {
      alert("Please upload your payment transfer slip.");
      return;
    }

    // บันทึกสลิปและตั้งสถานะการชำระเงินทันที
    bookingService.update(id, {
      paymentSlipUrl: slipImage,
      paymentStatus: "Paid", // ลูกค้าจ่ายเงินแล้ว
      paymentSubmittedAt: new Date().toISOString(),
    });

    alert(`อัปโหลดสลิปการชำระเงินสำหรับรหัสจอง #${id} เรียบร้อยแล้ว! ระบบกำลังส่งข้อมูลให้แอดมินตรวจสอบ`);
    navigate("/my-bookings");
  };

  if (!booking) {
    return (
      <div className="payment-page-root">
        <div className="payment-container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <h2>Reservation Not Found</h2>
          <p>We could not find booking #{id}.</p>
          <Link to="/my-bookings" className="btn-back-reservations">
            Return to Reservations
          </Link>
        </div>
      </div>
    );
  }

  // หากยังไม่ได้รับการยืนยันจาก Admin
  if (booking.status?.toLowerCase() === "pending") {
    return (
      <div className="payment-page-root">
        <div className="payment-container" style={{ textAlign: "center", padding: "80px 20px", maxWidth: "600px", margin: "0 auto" }}>
          <div className="payment-card-box">
            <span className="payment-tag-gold">PENDING APPROVAL</span>
            <h2 style={{ fontFamily: "var(--font-display)", marginTop: "12px", color: "#0f172a" }}>
              Awaiting Concierge Confirmation
            </h2>
            <p style={{ color: "#64748b", fontSize: "15px", lineHeight: "1.6", margin: "16px 0 24px" }}>
              Reservation <strong>#{id}</strong> is currently being reviewed by our Thanatooth Concierge Administrator. Once confirmed, payment instructions and QR Code will be unlocked here.
            </p>
            <Link to="/my-bookings" className="btn-back-reservations">
              ← Return to Client Reservations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page-root">
      <div className="payment-container">
        {/* Breadcrumb */}
        <div className="payment-breadcrumb">
          <Link to="/">Home</Link>
          <span className="crumb-sep">/</span>
          <Link to="/my-bookings">My Bookings</Link>
          <span className="crumb-sep">/</span>
          <span className="current">Payment & Handover Verification #{id}</span>
        </div>

        {/* Header */}
        <div className="payment-header-bar">
          <div>
            <span className="payment-tag-gold">Official Payment Gateway</span>
            <h1>Secure QR Payment & Slip Submission</h1>
            <p>Scan the official PromptPay QR Code below and upload your transaction receipt to finalize handover.</p>
          </div>
          <Link to="/my-bookings" className="btn-back-reservations">
            ← Return to Reservations
          </Link>
        </div>

        <div className="payment-grid-layout">
          {/* Left Column: QR Code & Account Details */}
          <div className="payment-card-box">
            <h3>PromptPay & Bank Transfer</h3>
            <p className="box-subtitle">Scan to transfer directly via any Thai Mobile Banking Application</p>

            <div className="qr-display-container">
              <img
                src={qrCodeUrl}
                alt="Thanatooth Official Payment QR Code"
                className="qr-code-img"
              />
              <div className="qr-amount-box">
                <span className="amt-label">Total Payable Amount</span>
                <span className="amt-num">฿{booking.totalPrice?.toLocaleString()}</span>
              </div>
            </div>

            <div className="qr-account-info">
              <div className="acc-row">
                <span>Account Name:</span>
                <strong>Thanatooth Luxury Auto Co., Ltd.</strong>
              </div>
              <div className="acc-row">
                <span>Bank:</span>
                <strong>Kasikornbank (KBANK)</strong>
              </div>
              <div className="acc-row">
                <span>Account Number:</span>
                <strong>092-8-63643-7</strong>
              </div>
              <div className="acc-row">
                <span>Reservation Reference:</span>
                <strong style={{ color: "#b8860b" }}>#{id}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Slip Upload & Status */}
          <div className="payment-card-box">
            <h3>Transfer Slip Submission</h3>
            <p className="box-subtitle">Upload your mobile banking receipt or transfer proof</p>

            {booking.paymentStatus === "Paid" ? (
              <div className="slip-already-submitted-card">
                <span className="status-badge-paid">Payment Verified</span>
                <h4 style={{ margin: "6px 0", color: "#0f172a" }}>Payment Completed Successfully</h4>
                <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>
                  Your payment has been fully verified by our concierge admin. Your luxury vehicle will be prepared for handover.
                </p>
                {booking.paymentSlipUrl && (
                  <img
                    src={booking.paymentSlipUrl}
                    alt="Payment Slip Proof"
                    style={{ maxWidth: "200px", borderRadius: "8px", marginTop: "12px", border: "1px solid #bbf7d0" }}
                  />
                )}
              </div>
            ) : booking.paymentStatus === "Slip Uploaded" ? (
              <div className="slip-already-submitted-card" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <span className="status-badge-review">Verification in Progress</span>
                <h4 style={{ margin: "6px 0", color: "#0f172a" }}>Receipt Received</h4>
                <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>
                  We have received your transfer slip. Our finance admin is verifying the transaction.
                </p>
                {booking.paymentSlipUrl && (
                  <img
                    src={booking.paymentSlipUrl}
                    alt="Uploaded Slip"
                    style={{ maxWidth: "200px", borderRadius: "8px", marginTop: "12px", border: "1px solid #fde68a" }}
                  />
                )}
                <label className="btn-remove-slip" style={{ cursor: "pointer", marginTop: "10px" }}>
                  Upload Replacement Slip
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
              </div>
            ) : (
              <form onSubmit={handleUploadSlip}>
                {slipImage ? (
                  <div className="slip-preview-container">
                    <img src={slipImage} alt="Slip Preview" className="slip-preview-img" />
                    <button
                      type="button"
                      className="btn-remove-slip"
                      onClick={() => setSlipImage("")}
                    >
                      Remove & Choose Another
                    </button>
                  </div>
                ) : (
                  <label className="upload-dropzone">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      required
                    />
                    <div className="upload-icon-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p>Click or tap to upload transfer slip</p>
                    <span>Supports JPG, PNG, WEBP (Max 5MB)</span>
                  </label>
                )}

                <button
                  type="submit"
                  className="btn-submit-slip-gold"
                  disabled={!slipImage || isSubmitting}
                >
                  {isSubmitting ? "Submitting Slip..." : "Submit Payment Slip"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

