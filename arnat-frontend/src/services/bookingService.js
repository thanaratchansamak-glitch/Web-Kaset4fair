// src/services/bookingService.js
// ระบบจัดการข้อมูลลูกค้าและการจอง เชื่อมต่อกับ MySQL (phpMyAdmin) และมี Local Storage สำรอง

const STORAGE_KEY = "luxury_car_bookings";
const API_BASE_URL = "http://localhost:3000/api";

export const bookingService = {
  // [R] Read All - ดึงข้อมูลการจองทั้งหมด
  getAll: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const list = data ? JSON.parse(data) : [];
      // ลบรายการทดสอบเก่า (BK-TEST-USER) อัตโนมัติหากยังมีค้างในเครื่อง
      const cleaned = list.filter((item) => String(item.id) !== "BK-TEST-USER");
      if (cleaned.length !== list.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {
      console.error("Error reading bookings from localStorage:", e);
      return [];
    }
  },

  // ดึงข้อมูลลูกค้าและการจองล่าสุดจาก phpMyAdmin (MySQL) มาซิงก์กับหน้าเว็บ
  syncWithBackend: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`);
      if (res.ok) {
        const remoteBookings = await res.json();
        if (Array.isArray(remoteBookings) && remoteBookings.length > 0) {
          const localList = bookingService.getAll();
          const localMap = new Map(localList.map((item) => [String(item.id), item]));

          const formatted = remoteBookings.map((b) => {
            const local = localMap.get(String(b.id));
            return {
              ...b,
              // ผสานสถานะที่อัปเดตล่าสุดจาก local หรือ remote (คงสถานะที่แอดมินยืนยันแล้วไว้เสมอ)
              status: local?.status || b.status || "Pending",
              paymentStatus: local?.paymentStatus || b.paymentStatus || "Unpaid",
              paymentSlipUrl: local?.paymentSlipUrl || b.paymentSlipUrl || "",
              adminPaymentVerified: Boolean(local?.adminPaymentVerified !== undefined ? local.adminPaymentVerified : b.adminPaymentVerified),
              handoverStatus: local?.handoverStatus || b.handoverStatus || "Pending Prep",
              liveTrackingStep: typeof local?.liveTrackingStep === "number" ? local.liveTrackingStep : (typeof b.liveTrackingStep === "number" ? b.liveTrackingStep : 0),
              startDate: b.startDate ? b.startDate.split("T")[0] : b.startDate,
              endDate: b.endDate ? b.endDate.split("T")[0] : b.endDate,
              withDriver: Boolean(b.withDriver),
              premiumInsurance: Boolean(b.premiumInsurance),
              tireGlassProtection: Boolean(local?.tireGlassProtection !== undefined ? local.tireGlassProtection : b.tireGlassProtection),
              lossOfUseCoverage: Boolean(local?.lossOfUseCoverage !== undefined ? local.lossOfUseCoverage : b.lossOfUseCoverage),
              deliveryFee: local?.deliveryFee !== undefined ? local.deliveryFee : (b.deliveryFee || 0),
              totalPrice: Number(b.totalPrice),
            };
          });

          // บรรจุรายการที่มีอยู่ใน local แต่ยังไม่ซิงก์ไป MySQL (หากมี)
          const remoteIds = new Set(remoteBookings.map((b) => String(b.id)));
          localList.forEach((loc) => {
            if (!remoteIds.has(String(loc.id))) {
              formatted.unshift(loc);
            }
          });

          localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
          window.dispatchEvent(new Event("storage"));
          return formatted;
        }
      }
    } catch {
      // หากยังไม่ได้เปิด Backend หรือ XAMPP ให้ใช้ข้อมูลในเครื่องต่อไปได้
    }
    return bookingService.getAll();
  },

  // [R] Read by ID - ดึงข้อมูลรายการเดียวตาม ID
  getById: (id) => {
    const list = bookingService.getAll();
    return list.find((item) => String(item.id) === String(id)) || null;
  },

  // [C] Create - บันทึกข้อมูลลูกค้าและการจองใหม่ลงใน phpMyAdmin ทันที
  create: (bookingData) => {
    const list = bookingService.getAll();
    const newBooking = {
      ...bookingData,
      id: bookingData.id || "BK-" + Math.floor(100000 + Math.random() * 900000),
      status: bookingData.status || "Pending", // รอแอดมินยืนยันก่อน
      paymentStatus: "Unpaid", // Unpaid | Slip Uploaded | Paid
      paymentSlipUrl: "",
      confirmedAt: null,
      createdAt: new Date().toISOString(),
    };

    // 1. บันทึกลง localStorage ในเครื่องทันทีเพื่อให้หน้าเว็บตอบสนองทันใจ
    list.unshift(newBooking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));

    // 2. ส่งข้อมูลลูกค้าไปบันทึกลง MySQL phpMyAdmin ทันที
    fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBooking),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(" บันทึกข้อมูลลูกค้าลง phpMyAdmin สำเร็จ:", data);
      })
      .catch((err) => {
        console.warn(" ไม่สามารถส่งไปยัง phpMyAdmin ได้ (ตรวจสอบว่าเปิด XAMPP หรือยัง):", err.message);
      });

    return newBooking;
  },

  // [U] Update - แก้ไขข้อมูลลูกค้าและการจอง (เปลี่ยนข้อมูลลูกค้าแล้วบันทึกลง phpMyAdmin ทันที)
  update: (id, updatedFields) => {
    const list = bookingService.getAll();
    const index = list.findIndex((item) => String(item.id) === String(id));
    if (index === -1) return null;

    const updatedBooking = { ...list[index], ...updatedFields };
    list[index] = updatedBooking;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("booking_updated", { detail: { id, updatedBooking } }));

    // 2. ส่งคำสั่ง PUT ไปอัปเดตข้อมูลลูกค้าใน phpMyAdmin ทันที
    fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBooking),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Update failed");
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ อัปเดตข้อมูลลูกค้าใน phpMyAdmin สำเร็จ:", data);
      })
      .catch((err) => {
        console.error("❌ ไม่สามารถอัปเดตไปยัง phpMyAdmin ได้:", err.message);
      });

    return updatedBooking;
  },

  // [D] Delete - ยกเลิกการจองและลบข้อมูลออกจาก phpMyAdmin
  delete: (id) => {
    const list = bookingService.getAll();
    const filtered = list.filter((item) => String(item.id) !== String(id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));

    // ส่งคำสั่ง DELETE ไปลบข้อมูลใน phpMyAdmin
    fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(" ลบข้อมูลการจองใน phpMyAdmin สำเร็จ:", data);
      })
      .catch((err) => {
        console.warn(" ไม่สามารถลบข้อมูลใน phpMyAdmin ได้:", err.message);
      });

    return true;
  },
};
