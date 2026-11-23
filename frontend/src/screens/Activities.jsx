import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../screens_css/Activities.css'; // นำเข้า CSS ที่แยกไว้

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/sections')
      .then(res => res.json())
      .then(data => {
        if (data.data) setActivities(data.data);
      })
      .catch(err => console.error('Error fetching activities:', err));
  }, []);

  return (
    <div className="activities-container">
      <h2 className="activities-title">กิจกรรมและนิทรรศการทั้งหมด</h2>
      
      <div>
        {activities.map((item) => (
          <div 
            key={item.id} 
            className="activity-card"
            onClick={() => navigate(`/detail/${item.id}`)}
          >
            <img 
              src={item.image_url || 'https://via.placeholder.com/120'} 
              alt={item.title_th} 
              className="activity-image" 
            />
            <div className="activity-content">
              <h3 className="activity-name">{item.title_th}</h3>
              <p className="activity-location">📍 {item.location_info || 'ภายในงานเกษตรแฟร์'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}