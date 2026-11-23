import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../screens_css/NewsDetail.css';

export default function NewsDetail() {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/sections`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          const found = data.data.find(item => item.id.toString() === id);
          setDetail(found);
        }
      });
  }, [id]);

  if (!detail) return <div className="news-loading">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="news-detail-container">
      <img 
        src={detail.image_url || 'https://via.placeholder.com/400x250'} 
        alt={detail.title_th} 
        className="news-detail-image" 
      />
      <div className="news-detail-content">
        <h2 className="news-detail-title">{detail.title_th}</h2>
        <p className="news-detail-desc">
          {detail.description_th || 'ยังไม่มีรายละเอียดเพิ่มเติมสำหรับหัวข้อนี้'}
        </p>
        {detail.location_info && (
          <div className="news-detail-location">
            <strong>สถานที่จัดงาน:</strong> {detail.location_info}
          </div>
        )}
      </div>
    </div>
  );
}