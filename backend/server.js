const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// API ดึงข้อมูลทั้งหมดสำหรับหน้าแรก (Home)
app.get('/api/home', (req, res) => {
  const search = req.query.q ? `%${req.query.q}%` : '%';

  db.all(
    "SELECT * FROM sections WHERE title_th LIKE ? OR title_en LIKE ? ORDER BY sort_order ASC",
    [search, search],
    (err, sections) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(
        "SELECT * FROM news WHERE title_th LIKE ? OR title_en LIKE ? ORDER BY id DESC",
        [search, search],
        (err, news) => {
          if (err) return res.status(500).json({ error: err.message });

          // แยกข้อมูล highlights กับ menu ส่งกลับไปเป็น JSON
          const highlights = sections.filter((item) => item.type === 'highlight');
          const menus = sections.filter((item) => item.type === 'menu');

          res.json({
            highlights,
            menus,
            news
          });
        }
      );
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server ทำงานอยู่ที่ http://localhost:${PORT}`);
});