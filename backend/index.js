const express = require("express");
const cors = require("cors");
const db = require("./database"); // <-- 1. นำเข้าฐานข้อมูล SQLite ที่คุณสร้างไว้

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root API test endpoint
app.get("/api", (req, res) => {
  res.json({ message: "Backend API is running (Clean Slate)" });
});

// ==========================================
// 2. API ดึงข้อมูลหน้าแรกทั้งหมด (รองรับการค้นหา ?q=...)
// ==========================================
app.get("/api/home", (req, res) => {
  const searchQuery = req.query.q ? `%${req.query.q}%` : "%";

  // ดึงข้อมูล sections ทั้งหมดที่ตรงกับคำค้นหา
  db.all(
    `SELECT * FROM sections WHERE (title_th LIKE ? OR description_th LIKE ?) ORDER BY sort_order ASC`,
    [searchQuery, searchQuery],
    (err, sectionRows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // แยกประเภท type เป็น highlights และ menus ตามที่หน้า Home.jsx เรียกใช้
      const highlights = sectionRows.filter(row => row.type === 'highlight');
      const menus = sectionRows.filter(row => row.type === 'menu');

      // ดึงข้อมูล news (ข่าวสาร) ที่ตรงกับคำค้นหา
      db.all(
        `SELECT * FROM news WHERE (title_th LIKE ? OR content_th LIKE ?) ORDER BY id DESC`,
        [searchQuery, searchQuery],
        (err, newsRows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          // ส่งโครงสร้างข้อมูลกลับไปให้ React
          res.json({
            highlights: highlights,
            menus: menus,
            news: newsRows
          });
        }
      );
    }
  );
});

// ==========================================
// 3. API ดึงข้อมูลหมวดหมู่หน้าแรก (sections) แบบเดิม (เผื่อใช้งานหน้าอื่น)
// ==========================================
app.get("/api/sections", (req, res) => {
  db.all("SELECT * FROM sections ORDER BY sort_order ASC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows
    });
  });
});

// ==========================================
// 4. API ดึงข้อมูลข่าวสาร (news) แบบเดิม (เผื่อใช้งานหน้าอื่น)
// ==========================================
app.get("/api/news", (req, res) => {
  db.all("SELECT * FROM news ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});