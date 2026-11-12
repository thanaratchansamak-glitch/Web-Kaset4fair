import React, { useState, useEffect } from 'react';
import '../screens_css/Search.css'; // นำเข้า CSS ที่แยกไว้

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/sections')
      .then(res => res.json())
      .then(data => {
        if (data.data) setAllData(data.data);
      });
  }, []);

  useEffect(() => {
    if (keyword.trim() === '') {
      setResults([]);
    } else {
      const filtered = allData.filter(item => 
        item.title_th.toLowerCase().includes(keyword.toLowerCase()) ||
        (item.description_th && item.description_th.toLowerCase().includes(keyword.toLowerCase()))
      );
      setResults(filtered);
    }
  }, [keyword, allData]);

  return (
    <div className="search-container">
      <div className="search-bar-box">
        <input 
          type="text" 
          className="search-input"
          placeholder="ค้นหานิทรรศการ, กิจกรรม, โซนช้อปปิ้ง..." 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          autoFocus
        />
      </div>

      <div>
        {results.length > 0 ? (
          results.map(item => (
            <div key={item.id} className="search-result-card">
              <h4 className="search-result-title">{item.title_th}</h4>
              <p className="search-result-desc">{item.description_th || 'คลิกดูรายละเอียดเพิ่มเติม'}</p>
            </div>
          ))
        ) : (
          keyword && <p className="search-no-result">ไม่พบข้อมูลที่คุณค้นหา</p>
        )}
      </div>
    </div>
  );
}