// src/components/MyBookingsView.jsx
import { useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";
import BookingFormModal from "./BookingFormModal";
import "./MyBookingsView.css";

export default function MyBookingsView({ onGoToShowroom }) {
  const [bookings, setBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  const loadBookings = () => {
    const data = bookingService.getAll();
    setBookings(data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // [D] Delete — ยกเลิกการจอง
  const handleCancelReservation = (booking) => {
    if (window.confirm(` คุณแน่ใจว่าต้องการยกเลิกการจอง #${booking.id} (${booking.carModel}) หรือไม่?`)) {
      bookingService.delete(booking.id);
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
      alert(`ยกเลิกการจอง #${booking.id} เรียบร้อยแล้ว`);
    }
  };

  return (
    <div className="my-bookings-container">
      <div className="my-bookings-header">
        <div>
          <span className="gold-sub-title">CUSTOMER RESERVATIONS</span>
          <h2> รายการจองรถของฉัน (My Bookings)</h2>
          <p>ตรวจสอบรายละเอียด แก้ไขวันนัดรับรถ หรือยกเลิกการจอง</p>
        </div>
        <button className="btn-browse-cars" onClick={onGoToShowroom}>
          + เลือกเช่ารถเพิ่มจากโชว์รูม
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-bookings-box">
          <div className="empty-icon"></div>
          <h3>คุณยังไม่มีรายการจองรถหรูในขณะนี้</h3>
          <p>เลือกสัมผัสประสบการณ์ขับขี่ระดับพรีเมียมจากคอลเลกชัน 15 รุ่นยอดนิยมได้ทันที</p>
          <button className="btn-go-showroom" onClick={onGoToShowroom}>
            ไปยังโชว์รูมรถหรู
          </button>
        </div>
      ) : (
        <div className="bookings-cards-grid">
          {bookings.map((b) => (
            <div key={b.id} className="booking-ticket-card">
              {/* Ticket Top */}
              <div className="ticket-top">
                <div className="ticket-id-tag">
                  <strong>#{b.id}</strong>
                  <span className="ticket-created">
                    {new Date(b.createdAt).toLocaleDateString("th-TH")}
                  </span>
                </div>
                <span className={`status-badge ${b.status === "Cancelled" ? "cancelled" : "confirmed"}`}>
                  ● {b.status || "Confirmed"}
                </span>
              </div>

              {/* Car Banner */}
              <div className="ticket-car-banner">
                <img
                  src={b.imageUrl || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80"}
                  alt={b.carModel}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div className="ticket-car-meta">
                  <h4>{b.carModel}</h4>
                  <span className="ticket-rate">
                    ค่าเช่า: ฿{Number(b.dailyRate || 30000).toLocaleString()} / วัน
                  </span>
                </div>
              </div>

              {/* Info Details Grid */}
              <div className="ticket-details-grid">
                <div className="t-item">
                  <span className="lbl">ผู้จอง:</span>
                  <span className="val highlight">{b.customerName}</span>
                </div>
                <div className="t-item">
                  <span className="lbl">เบอร์โทรศัพท์:</span>
                  <span className="val">{b.phone}</span>
                </div>
                <div className="t-item full">
                  <span className="lbl">เลขที่ใบขับขี่:</span>
                  <span className="val">{b.driverLicense}</span>
                </div>
                <div className="t-item full">
                  <span className="lbl">ระยะเวลาการเช่า:</span>
                  <span className="val date-highlight">
                     {b.startDate} ถึง {b.endDate} (รวม <strong>{b.totalDays} วัน</strong>)
                  </span>
                </div>
                <div className="t-item full">
                  <span className="lbl">จุดส่งมอบรถ:</span>
                  <span className="val"> {b.pickupLocation}</span>
                </div>

                {/* Badges for services */}
                <div className="services-chips-row full">
                  {b.withDriver && (
                    <span className="service-chip chauffeur">
                       รวมคนขับส่วนตัว (+฿3,000/วัน)
                    </span>
                  )}
                  {b.premiumInsurance && (
                    <span className="service-chip insurance">
                       ประกันภัยชั้น 1 พรีเมียม (+฿2,000/วัน)
                    </span>
                  )}
                </div>
              </div>

              {/* Ticket Footer with Total and Actions */}
              <div className="ticket-footer">
                <div className="ticket-total-wrap">
                  <span className="lbl">ยอดรวมสุทธิ</span>
                  <span className="price-tag">฿{Number(b.totalPrice).toLocaleString()}</span>
                </div>

                <div className="ticket-actions-group">
                  <button
                    className="btn-edit-ticket"
                    onClick={() => setEditingBooking(b)}
                    title="แก้ไขรายละเอียด"
                  >
                     Edit Details
                  </button>
                  <button
                    className="btn-cancel-ticket"
                    onClick={() => handleCancelReservation(b)}
                    title="ยกเลิกการจอง"
                  >
                     Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* [U] Edit Details Modal */}
      {editingBooking && (
        <BookingFormModal
          existingBooking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSuccess={loadBookings}
        />
      )}
    </div>
  );
}

