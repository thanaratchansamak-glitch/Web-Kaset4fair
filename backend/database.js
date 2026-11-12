const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kaset4fair.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('เชื่อมต่อฐานข้อมูลไม่สำเร็จ:', err.message);
  } else {
    console.log('เชื่อมต่อ SQLite (kaset4fair.db) สำเร็จ!');
  }
});

db.serialize(() => {
  // 1. ตารางเก็บหมวดหมู่และไฮไลต์หน้าแรก (เพิ่มรายละเอียด เวลา และสถานที่)
  db.run(`CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title_th TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_th TEXT,
    description_en TEXT,
    location_info TEXT,
    time_info TEXT,
    icon_name TEXT,
    image_url TEXT,
    sort_order INTEGER
  )`);

  // 2. ตารางข่าวสารประชาสัมพันธ์
  db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_th TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_th TEXT,
    content_en TEXT,
    date_label TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT
  )`);

  db.get("SELECT COUNT(*) AS count FROM sections", (err, row) => {
    if (row && row.count === 0) {
      const insertSection = db.prepare(
        `INSERT INTO sections 
        (type, title_th, title_en, description_th, description_en, location_info, time_info, icon_name, image_url, sort_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      // ส่วนเน้นหน้าแรก: นิทรรศการและการประกวด
      insertSection.run(
        'highlight',
        'นิทรรศการเกษตรและนวัตกรรม',
        'Agri & Innovation Exhibition',
        'จัดแสดงผลงานวิจัยและนวัตกรรมทางการเกษตรอัจฉริยะ (Smart Farming) โดรนเพื่อการเกษตร และพันธุ์พืชปรับปรุงใหม่จากคณะต่างๆ ของ มก.',
        'Showcasing smart farming research, agricultural drones, and new crop varieties from KU faculties.',
        'อาคารจักรพันธ์เพ็ญศิริ และลานนิทรรศการกลาง',
        '09:00 - 20:00 น.',
        'Sprout',
        'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
        1
      );
      insertSection.run(
        'highlight',
        'การประกวดโปสเตอร์และคลิปวิดีโอ',
        'Poster & Video Contest',
        'การประกวดผลงานทางวิชาการ โปสเตอร์วิจัย และการประกวดคลิปสั้นสร้างสรรค์การเกษตร',
        'Academic research posters and agricultural short video contest.',
        'อาคารสารนิเทศ 50 ปี',
        '08:30 - 18:00 น.',
        'Flower2',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        2
      );

      // เมนูหลัก 4 หมวด
      insertSection.run(
        'menu',
        'การแสดงเวทีกลาง',
        'Main Stage Shows',
        'ชมการแสดงดนตรีโฟล์คซอง วงดนตรีลูกทุ่งชมรมนิสิต ศิลปวัฒนธรรมพื้นบ้าน และการแสดงพิเศษทุกค่ำคืน',
        'Enjoy student folk bands, traditional cultural performances, and special night concerts.',
        'เวทีกลาง ลานหน้าอาคารเทพศาสตร์สถิตย์',
        '17:00 - 22:00 น.',
        'Music',
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80',
        1
      );
      insertSection.run(
        'menu',
        'ร้านค้าและโซนช้อปปิ้ง',
        'Shops & Shopping Zone',
        'รวบรวมร้านค้านิสิต ผลิตภัณฑ์แปรรูปทางการเกษตร อาหารขึ้นชื่อ OTOP และสินค้าชุมชนกว่า 1,000 ร้านค้า',
        'Over 1,000 booths featuring student shops, processed agricultural goods, and OTOP products.',
        'โซน A - G ตลอดแนวถนนสายหลัก',
        '10:00 - 22:00 น.',
        'ShoppingBag',
        'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=500&q=80',
        2
      );
      insertSection.run(
        'menu',
        'อบรมวิชาชีพ',
        'Vocational Training',
        'หลักสูตรอบรมระยะสั้นฟรี! เช่น การเพาะเห็ดเศรษฐกิจ การทำปุ๋ยอินทรีย์ การแปรรูปอาหาร และการปลูกผักไฮโดรโปนิกส์',
        'Free short vocational courses: mushroom farming, organic fertilizer, food processing, and hydroponics.',
        'อาคารสำนักส่งเสริมและฝึกอบรม',
        'รอบเช้า 10:00 น. / รอบบ่าย 14:00 น.',
        'GraduationCap',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=500&q=80',
        3
      );
      insertSection.run(
        'menu',
        'บรรยาย / เสวนา',
        'Talks & Seminars',
        'เวทีเสวนาวิชาการหัวข้อ "เกษตรยุคใหม่ปรับตัวอย่างไรในยุค AI และสภาพภูมิอากาศเปลี่ยน" โดยคณาจารย์และผู้เชี่ยวชาญ',
        'Academic seminar on Modern Agriculture Adaptation in the AI and Climate Change Era.',
        'ห้องประชุมสุธรรม อารีกุล',
        '13:00 - 16:30 น.',
        'Mic',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=500&q=80',
        4
      );

      insertSection.finalize();
    }
  });

  db.get("SELECT COUNT(*) AS count FROM news", (err, row) => {
    if (row && row.count === 0) {
      const insertNews = db.prepare(
        "INSERT INTO news (title_th, title_en, content_th, content_en, date_label, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );

      insertNews.run(
        'เตรียมพบกับ งานเกษตรแฟร์ ประจำปี 2569',
        'Get Ready for Kaset Fair 2026',
        'มหาวิทยาลัยเกษตรศาสตร์ขอเชิญชวนเที่ยวชมงานเกษตรแฟร์ ประจำปี 2569 พบกับนวัตกรรมเกษตรยั่งยืน ร้านค้าผลิตภัณฑ์ชุมชน และกิจกรรมมากมายตลอด 9 วันเต็ม',
        'Kasetsart University invites everyone to Kaset Fair 2026 featuring sustainable agri-innovations, community shops, and 9 days of activities.',
        '27 พ.ย. 2569',
        'กองเกษตรสัมพันธ์',
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=400&q=80'
      );
      insertNews.run(
        'เชิญชวนประกวดพืชและผลผลิตสวยงาม',
        'Invitation to Plant & Produce Contest',
        'เปิดรับสมัครเกษตรกรและประชาชนทั่วไปส่งพืชผัก ผลไม้ และไม้ดอกไม้ประดับเข้าประกวดชิงเงินรางวัลและถ้วยเกียรติยศ สมัครได้ตั้งแต่วันนี้เป็นต้นไป',
        'Open registration for farmers and the public to enter fruits, vegetables, and ornamental plants into the annual contest.',
        '27 พ.ย. 2569',
        'การประกวด',
        'https://images.unsplash.com/photo-1526397751294-331021109fbd?auto=format&fit=crop&w=400&q=80'
      );

      insertNews.finalize();
    }
  });
});

module.exports = db;