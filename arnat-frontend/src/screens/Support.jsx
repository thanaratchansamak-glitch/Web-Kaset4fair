import React from 'react';
import '../screens_css/Support.css';

export default function Support() {
  return (
    <div className="support-container">
      <h2 className="support-title">ช่วยเหลือและข้อมูลติดต่อ</h2>
      
      <div className="support-card">
        <h3 className="support-card-title">📞 เบอร์โทรฉุกเฉินภายในงาน</h3>
        <p className="support-text">กองอำนวยการกลาง: 042-xxx-xxx</p>
        <p className="support-text">หน่วยพยาบาลและปฐมพยาบาล: 042-xxx-xxx</p>
      </div>

      <div className="support-card">
        <h3 className="support-card-title">🚌 การเดินทางและรถรับส่ง</h3>
        <p className="support-text" style={{ color: '#666' }}>
          มีบริการรถ Shuttle Bus รับส่งฟรีรอบมหาวิทยาลัยตลอดงาน ตั้งแต่เวลา 08:00 - 21:00 น.
        </p>
      </div>
    </div>
  );
}