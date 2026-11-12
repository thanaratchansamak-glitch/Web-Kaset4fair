// src/api/carApi.js - Thanatooth Luxury Drive API
const BASE_URL = "http://localhost:3000/api";

// ดึงรายการรถยนต์ทั้งหมดจาก Database
export async function getAllCars(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.category && filters.category !== "all") params.append("category", filters.category);

  const url = params.toString() ? `${BASE_URL}/cars?${params.toString()}` : `${BASE_URL}/cars`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลรถยนต์จากฐานข้อมูลได้");
  return res.json();
}

// ดึงเฉพาะรถยอดนิยมจาก Database
export async function getPopularCars() {
  const res = await fetch(`${BASE_URL}/cars/popular`);
  if (!res.ok) throw new Error("ไม่สามารถโหลดรถยอดนิยมได้");
  return res.json();
}

// บันทึกรายการจองของลูกค้าลง Database
export async function createBooking(bookingData) {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) throw new Error("ไม่สามารถบันทึกรายการจองได้");
  return res.json();
}
