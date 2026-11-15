const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// API ทดสอบสถานะ Backend
app.get('/api', (req, res) => {
  res.json({ message: 'Backend SQLite API is running on port 5000' });
});

// 1. ดึงข้อมูลนิทรรศการและการประกวดทั้งหมด
app.get('/api/exhibitions', (req, res) => {
  db.all('SELECT * FROM exhibitions ORDER BY sort_order ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. ดึงข้อมูลไฮไลต์กำหนดการประกวด
app.get('/api/schedules', (req, res) => {
  db.all('SELECT * FROM contest_schedules', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 3. ดึงข้อมูลเมนูกิจกรรม
app.get('/api/activities', (req, res) => {
  db.all('SELECT * FROM activity_menus', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 4. ดึงข้อมูลรวมหน้าแรกทั้งหมดในครั้งเดียว
app.get('/api/home', (req, res) => {
  db.all('SELECT * FROM exhibitions ORDER BY sort_order ASC', [], (err, exhibitions) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all('SELECT * FROM contest_schedules', [], (err, schedules) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all('SELECT * FROM activity_menus', [], (err, activities) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({
          exhibitions,
          schedules,
          activities
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Server กำลังทำงานที่: http://localhost:${PORT}`);
});