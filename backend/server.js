const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 4001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../data/kaset4fair.db");

// Ensure db directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite with WAL mode
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.pragma("busy_timeout = 5000");
db.pragma("foreign_keys = ON");

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS stalls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    zone TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- นับผู้เข้าชม: หนึ่งแถวต่อผู้เข้าชมต่อวัน (visitor เป็น hash ที่เปลี่ยนทุกวัน ไม่เก็บ IP)
  CREATE TABLE IF NOT EXISTS visits (
    day TEXT NOT NULL,
    visitor TEXT NOT NULL,
    pageviews INTEGER NOT NULL DEFAULT 1,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (day, visitor)
  );

  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    event_time TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS exhibitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_th TEXT NOT NULL,
    title_en TEXT NOT NULL,
    image_url TEXT,
    icon TEXT,
    description_th TEXT,
    description_en TEXT,
    location_info_th TEXT,
    location_info_en TEXT,
    time_info_th TEXT,
    time_info_en TEXT,
    sort_order INTEGER
  );
`);

const ALL_EVENTS = require("./exhibitions-seed");
const insertExhibition = db.prepare(`
  INSERT OR REPLACE INTO exhibitions (id, title_th, title_en, image_url, icon, description_th, description_en, location_info_th, location_info_en, time_info_th, time_info_en, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const seedExhibitions = db.transaction((items) => {
  items.forEach((item, idx) => {
    insertExhibition.run(
      item.id,
      item.title_th,
      item.title_en,
      item.image_url,
      item.icon,
      item.description_th,
      item.description_en,
      item.location_info_th,
      item.location_info_en,
      item.time_info_th,
      item.time_info_en,
      idx + 1
    );
  });
});
seedExhibitions(ALL_EVENTS);

// Insert initial seed data if empty
const countStalls = db.prepare("SELECT count(*) as count FROM stalls").get().count;
if (countStalls === 0) {
  const insertStall = db.prepare("INSERT INTO stalls (name, zone, category, description, contact) VALUES (?, ?, ?, ?, ?)");
  insertStall.run("ร้านไก่ย่างพังโคนขนานแท้", "โซน A (อาหารและเครื่องดื่ม)", "อาหาร", "ไก่ย่างสมุนไพรสูตรดั้งเดิมสกลนคร", "081-234-5678");
  insertStall.run("กลุ่มวิสาหกิจชุมชนผ้าย้อมครามสกลนคร", "โซน B (สินค้า OTOP & หัตถกรรม)", "สินค้าพื้นเมือง", "ผ้าย้อมครามธรรมชาติแท้ 100%", "089-876-5432");
  insertStall.run("บูธผลผลิตทางการเกษตร คณะทรัพยากรธรรมชาติและอุตสาหกรรมเกษตร", "โซน C (นิทรรศการวิชาการ)", "วิชาการ/นิทรรศการ", "พืชผักไฮโดรโปนิกส์และเนื้อโคขุนโพนยางคำ", "042-725-000");
}

const countActivities = db.prepare("SELECT count(*) as count FROM activities").get().count;
if (countActivities === 0) {
  const insertActivity = db.prepare("INSERT INTO activities (title, location, event_time, description) VALUES (?, ?, ?, ?)");
  insertActivity.run("พิธีเปิดงานเกษตรแฟร์ นนทรีอีสาน", "เวทีกลาง ลานอเนกประสงค์", "09:00 - 10:30 น.", "พิธีเปิดอย่างเป็นทางการและการแสดงศิลปวัฒนธรรมพื้นบ้าน");
  insertActivity.run("การประกวดโคเนื้อและกระบือพื้นเมือง", "ลานประกวดสัตว์เลี้ยง", "13:00 - 16:00 น.", "ประกวดพันธุ์สัตว์ชิงถ้วยพระราชทาน");
}

// Apache เครื่องเดียวกันต่อท้าย IP ผู้ใช้ใน X-Forwarded-For จึงเชื่อถือเฉพาะ hop สุดท้าย
app.set("trust proxy", 1);

// ---------- log คำขอและนับผู้เข้าชม ----------
// log เป็น logfmt หนึ่งบรรทัดต่อคำขอ ส่งเข้า journald (tag kasetfair) แล้วไประบบ monitor .116
const q = (v) => '"' + String(v ?? "").replace(/["\\\r\n]/g, " ").slice(0, 200) + '"';
const BOT_UA = /bot|crawl|spider|slurp|preview|KUCSC-Monitor|curl|wget|python|go-http|java\/|headless|uptime|monitor/i;

// salt คงที่ต่อฐานข้อมูล เพื่อให้นับผู้เข้าชมคนเดิมในวันเดียวกันได้แม้ restart
let salt = db.prepare("SELECT value FROM meta WHERE key = 'visitor_salt'").get()?.value;
if (!salt) {
  salt = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO meta (key, value) VALUES ('visitor_salt', ?)").run(salt);
}
const bangkokDay = (offsetDays = 0) => new Date(Date.now() + 7 * 3600e3 - offsetDays * 86400e3).toISOString().slice(0, 10);
const insertVisit = db.prepare("INSERT OR IGNORE INTO visits (day, visitor) VALUES (?, ?)");
const bumpVisit = db.prepare("UPDATE visits SET pageviews = pageviews + 1 WHERE day = ? AND visitor = ?");

// หน้าเว็บ (ไม่ใช่ API หรือไฟล์ประกอบ) ที่โหลดสำเร็จโดยคนจริง
function isPageview(req, res, p) {
  if (req.method !== "GET" || (res.statusCode !== 200 && res.statusCode !== 304)) return false;
  if (p.includes("/api/") || p.includes("/.") || (path.extname(p) && !p.endsWith(".html"))) return false;
  return !BOT_UA.test(req.get("user-agent") || "");
}

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  // เก็บ path เดิมไว้ก่อน เพราะ router ที่ mount ไว้ (เช่น /api) ตัด prefix ออกจาก req.path ระหว่างทำงาน
  const reqPath = req.originalUrl.split("?")[0];
  res.on("finish", () => {
    const ms = (Number(process.hrtime.bigint() - start) / 1e6).toFixed(1);
    const status = res.statusCode;
    const ua = req.get("user-agent") || "";
    let extra = "";
    if (isPageview(req, res, reqPath)) {
      try {
        const day = bangkokDay();
        const visitor = crypto.createHash("sha256").update(`${salt}|${day}|${req.ip}|${ua}`).digest("hex").slice(0, 24);
        const isNew = insertVisit.run(day, visitor).changes === 1;
        if (!isNew) bumpVisit.run(day, visitor);
        extra = ` pageview=1 new_visitor=${isNew ? 1 : 0}`;
      } catch (e) {
        console.error(`level=error event=visit_count_failed msg=${q(e.message)}`);
      }
    }
    // health ที่ตอบปกติถูกเรียกจากระบบ monitor และหน้าเว็บบ่อยมาก ไม่ต้อง log
    if (reqPath.endsWith("/api/health") && status === 200) return;
    // ไฟล์ประกอบหน้าเว็บที่โหลดปกติ log เฉพาะเมื่อผิดพลาด
    if (reqPath.includes("/assets/") && status < 400) return;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
    console.log(`level=${level} event=request method=${req.method} path=${q(reqPath)} status=${status} ms=${ms} ip=${req.ip} ua=${q(ua)}${extra}`);
  });
  next();
});

app.use(cors());
app.use(express.json());

// API Router
const apiRouter = express.Router();

// หน้าตัวอย่าง: ปิดการเขียนข้อมูลผ่าน API ทั้งหมด (ยังไม่มีระบบยืนยันตัวตนผู้ดูแล) เปิดได้ด้วย READ_ONLY=0
const READ_ONLY = process.env.READ_ONLY !== "0";
apiRouter.use((req, res, next) => {
  if (READ_ONLY && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return res.status(403).json({ error: "ระบบเป็นหน้าตัวอย่าง ปิดการเพิ่มหรือลบข้อมูล" });
  }
  next();
});

apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "kaset4fair",
    timestamp: new Date().toISOString(),
    database: "SQLite (WAL mode)",
    uptime: process.uptime()
  });
});

apiRouter.get("/stats", (req, res) => {
  const stallCount = db.prepare("SELECT count(*) as count FROM stalls").get().count;
  const activityCount = db.prepare("SELECT count(*) as count FROM activities").get().count;
  res.json({ stalls: stallCount, activities: activityCount, visitors: visitorSummary() });
});

// สรุปผู้เข้าชม: today = คนไม่ซ้ำวันนี้, total = ผลรวมคนไม่ซ้ำรายวัน (คนเดิมต่างวันนับใหม่)
function visitorSummary() {
  const today = db.prepare("SELECT count(*) AS visitors, coalesce(sum(pageviews), 0) AS pageviews FROM visits WHERE day = ?").get(bangkokDay());
  const total = db.prepare("SELECT count(*) AS visitors, coalesce(sum(pageviews), 0) AS pageviews FROM visits").get();
  return { today: today.visitors, today_pageviews: today.pageviews, total: total.visitors, total_pageviews: total.pageviews };
}

// รายวันย้อนหลัง ?days=30 (สูงสุด 365)
apiRouter.get("/visitors", (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  const rows = db.prepare("SELECT day, count(*) AS visitors, sum(pageviews) AS pageviews FROM visits WHERE day >= ? GROUP BY day ORDER BY day").all(bangkokDay(days - 1));
  res.json({ ...visitorSummary(), daily: rows });
});

apiRouter.get("/stalls", (req, res) => {
  const rows = db.prepare("SELECT * FROM stalls ORDER BY id DESC").all();
  res.json(rows);
});

apiRouter.post("/stalls", (req, res) => {
  const { name, zone, category, description, contact } = req.body;
  if (!name || !zone) {
    return res.status(400).json({ error: "Name and Zone are required" });
  }
  const stmt = db.prepare("INSERT INTO stalls (name, zone, category, description, contact) VALUES (?, ?, ?, ?, ?)");
  const info = stmt.run(name, zone, category || "ทั่วไป", description || "", contact || "");
  res.status(201).json({ id: info.lastInsertRowid, name, zone, category, description, contact });
});

apiRouter.delete("/stalls/:id", (req, res) => {
  const stmt = db.prepare("DELETE FROM stalls WHERE id = ?");
  stmt.run(req.params.id);
  res.json({ success: true });
});

apiRouter.get("/activities", (req, res) => {
  const rows = db.prepare("SELECT * FROM activities ORDER BY id ASC").all();
  res.json(rows);
});

apiRouter.get("/exhibitions", (req, res) => {
  const rows = db.prepare("SELECT * FROM exhibitions ORDER BY sort_order ASC").all();
  res.json(rows);
});

// Support both /api and /kaset4fair/api for reverse proxy
app.use("/api", apiRouter);
app.use("/kasetfair/api", apiRouter);
app.use("/kaset4fair/api", apiRouter);

// Serve Static Frontend files (from public)
const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use("/", express.static(publicDir));
  app.use("/kasetfair", express.static(publicDir));
  app.use("/kaset4fair", express.static(publicDir));

  // Catch-all SPA route
  app.get("*", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

// error ที่ไม่ได้จัดการในเส้นทางใด ๆ: log พร้อม stack แล้วตอบ 500 โดยไม่เปิดเผยรายละเอียด
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(`level=error event=exception method=${req.method} path=${q(req.originalUrl.split("?")[0])} status=${status} msg=${q(err.message)}`);
    console.error(err.stack);
  }
  if (res.headersSent) return next(err);
  res.status(status).json({ error: status >= 500 ? "Internal Server Error" : err.message });
});

process.on("unhandledRejection", (e) => {
  console.error(`level=error event=unhandled_rejection msg=${q(e && e.message)}`);
  console.error(e && e.stack);
});
process.on("uncaughtException", (e) => {
  console.error(`level=fatal event=uncaught_exception msg=${q(e.message)}`);
  console.error(e.stack);
  process.exit(1); // docker restart: always จะเปิดใหม่
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[kaset4fair] Server running on port ${PORT}`);
  console.log(`[kaset4fair] SQLite DB located at: ${DB_PATH}`);
});
