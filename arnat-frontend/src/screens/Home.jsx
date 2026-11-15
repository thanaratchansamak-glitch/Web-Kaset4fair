import React, { useState, useEffect } from 'react';
import '../screens_css/Home.css';
import { ALL_EVENTS, BANNER_EVENT } from '../data/eventsData';
import {
  Search,
  MapPin,
  ChevronRight,
  ChevronDown,
  Sprout,
  Video,
  Leaf,
  Microscope,
  Bus,
  Train,
  Home as HomeIcon,
  Calendar,
  MoreHorizontal,
  Menu as MenuIcon,
  X,
  Monitor,
  Smartphone,
  BookOpen,
  Music,
  ShoppingBag,
  Phone,
  Mail,
  Globe,
  Building,
  GraduationCap
} from 'lucide-react';

// รายการกิจกรรมทั้งหมด
const EXHIBITION_CARDS = ALL_EVENTS;

export default function Home() {
  const [lang, setLang] = useState('TH');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
// State เก็บข้อมูลที่ดึงมาจาก SQLite (มี Fallback เริ่มต้นจาก EXHIBITION_CARDS เผื่อเซิร์ฟเวอร์ยังไม่เปิด)
const [cardsData, setCardsData] = useState(EXHIBITION_CARDS);

// ดึงข้อมูลจาก Backend SQLite (รองรับทั้ง localhost และ IP ของเครื่องเมื่อเปิดจากมือถือ)
useEffect(() => {
  const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api/exhibitions'
    : `http://${window.location.hostname}:5000/api/exhibitions`;

  fetch(backendUrl)
    .then((res) => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ โหลดข้อมูลจาก SQLite สำเร็จ:', data);
        setCardsData(data);
      }
    })
    .catch((err) => {
      console.warn('⚠️ ไม่สามารถเชื่อมต่อ Backend SQLite ได้ (จะใช้ข้อมูลสำรองในเว็บแทน):', err.message);
    });
}, []);
  // สถานะโหมดการแสดงผลบน PC: 'desktop' (เว็บใหญ่เต็มจอ) หรือ 'mobile' (จำลองมือถือ)
  const [viewMode, setViewMode] = useState('desktop');

  // State สำหรับสไลด์เลื่อนรูปภาพนิทรรศการและการประกวดอัตโนมัติ
  const [currentSlide, setCurrentSlide] = useState(0);



  // 4 ไฮไลต์หลักสำหรับแสดงในหน้าแรก (ไม่ให้รกเกินไป) ส่วนกิจกรรมทั้งหมดให้กดดูใน 'ข่าวทั้งหมด'
  const highlightCards = cardsData.slice(0, 4);

  // ตั้งเวลาเลื่อนรูปภาพไฮไลต์อัตโนมัติทุกๆ 3.5 วินาที
  useEffect(() => {
    if (highlightCards.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % highlightCards.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [highlightCards.length]);
  const dates = [
    { th: '25 ก.พ.', en: 'Feb 25' },
    { th: '26 ก.พ.', en: 'Feb 26' },
    { th: '27 ก.พ.', en: 'Feb 27' }
  ];
  const [selectedDateIdxLeft, setSelectedDateIdxLeft] = useState(1);
  const [selectedDateIdxRight, setSelectedDateIdxRight] = useState(1);

  // ฟังก์ชันเปิดหน้ารายละเอียดแบบเต็มหน้า
  const openDetailPage = (item) => {
    setSelectedItem(item);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // กรองการ์ดตามคำค้นหา
  const filteredCards = cardsData.filter((item) =>
    item.title_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`home-screen-wrapper view-${viewMode}`}>

      {/* Floating Mode Switcher (ลอยตัวอยู่ที่มุมล่างขวาของหน้าจอ ไม่บัง Header) */}
      <div className="pc-floating-switcher">
        <button
          onClick={() => setViewMode('desktop')}
          className={`pc-switcher-btn ${viewMode === 'desktop' ? 'active' : 'inactive'}`}
          title={lang === 'TH' ? 'สลับเป็นโหมดเว็บใหญ่ (คอมพิวเตอร์)' : 'Switch to Desktop View'}
        >
          <Monitor size={15} />
          <span>PC</span>
        </button>
        <button
          onClick={() => setViewMode('mobile')}
          className={`pc-switcher-btn ${viewMode === 'mobile' ? 'active' : 'inactive'}`}
          title={lang === 'TH' ? 'สลับเป็นโหมดจำลองมือถือ' : 'Switch to Mobile View'}
        >
          <Smartphone size={15} />
          <span>Mobile</span>
        </button>
      </div>

      <div className={`home-mobile-container view-${viewMode}`}>
        
        {/* =========================================================
            1. Top Header Bar (Desktop & Mobile)
            ========================================================= */}
        <header className={`home-header view-${viewMode}`}>
          {/* ฝั่งซ้าย: ตราสัญลักษณ์เกษตรแฟร์ นนทรีอีสาน และข้อความเกษตรแฟร์ นนทรีอีสาน */}
          <div
            className="flex items-center gap-2.5 min-w-0 shrink-0 cursor-pointer group"
            onClick={() => { setActiveTab('home'); setSelectedItem(null); }}
          >
            <div className="relative">
              <img
                src="/emblem-pure.png"
                alt="เกษตรแฟร์ นนทรีอีสาน"
                className="w-10 h-10 md:w-11 md:h-11 object-contain drop-shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] sm:text-[15px] md:text-[17px] font-extrabold tracking-tight leading-tight bg-gradient-to-r from-[#0d3820] via-[#154c2e] to-[#257345] bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] truncate">
                {lang === 'TH' ? (
                  <>เกษตรแฟร์ <span className="text-[#d97706] font-black">นนทรีอีสาน</span></>
                ) : (
                  <>Kaset Fair <span className="text-[#d97706] font-black">Nontri Isan</span></>
                )}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-[#154c2e]/70 tracking-wider uppercase">
                {lang === 'TH' ? 'ครั้งที่ 20 มก. ฉกส.' : '20th KU CSC'}
              </span>
            </div>
          </div>

          {/* เมนูกลางเฉพาะบนจอ PC ในโหมด Desktop (สไตล์โมเดิร์นคลีนตามเว็บเกษตรกำแพงแสน) */}
          {viewMode === 'desktop' && (
            <nav className="hidden md:flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => { setActiveTab('home'); setSelectedItem(null); }}
                className={`pc-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              >
                {lang === 'TH' ? 'หน้าแรก' : 'Home'}
              </button>
              <button
                onClick={() => { setActiveTab('activities'); setSelectedItem(null); }}
                className={`pc-nav-item ${activeTab === 'activities' ? 'active' : ''}`}
              >
                {lang === 'TH' ? 'กิจกรรม/นิทรรศการ' : 'Activities'}
              </button>
              <button
                onClick={() => {
                  const conf = cardsData.find(c => c.id === 4) || cardsData[cardsData.length - 1];
                  openDetailPage(conf);
                }}
                className="pc-nav-item"
              >
                {lang === 'TH' ? 'ประชุมวิชาการ' : 'Conference'}
              </button>
              <button
                onClick={() => { setActiveTab('map'); setSelectedItem(null); }}
                className={`pc-nav-item ${activeTab === 'map' ? 'active' : ''}`}
              >
                {lang === 'TH' ? 'แผนที่' : 'Map'}
              </button>
              <button
                onClick={() => { setActiveTab('shop'); setSelectedItem(null); }}
                className={`pc-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
              >
                {lang === 'TH' ? 'ร้านค้า' : 'Shop'}
              </button>
            </nav>
          )}

          {/* ฝั่งขวา: แว่นขยาย + TH/EN + ปุ่มเมนูแฮมเบอร์เกอร์ */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* ปุ่มค้นหา */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer bg-white shadow-2xs transition"
              title={lang === 'TH' ? 'ค้นหา' : 'Search'}
            >
              {searchOpen ? <X size={15} /> : <Search size={15} />}
            </button>

            {/* ปุ่มสลับภาษา TH | EN */}
            <div className="flex items-center text-xs font-semibold border border-gray-200 rounded-full overflow-hidden bg-white shadow-2xs">
              <button
                onClick={() => setLang('TH')}
                className={`px-2 py-1 transition cursor-pointer ${lang === 'TH' ? 'bg-[#154c2e] text-white' : 'text-gray-500'}`}
              >
                TH
              </button>
              <button
                onClick={() => setLang('EN')}
                className={`px-2 py-1 transition cursor-pointer ${lang === 'EN' ? 'bg-[#154c2e] text-white' : 'text-gray-500'}`}
              >
                EN
              </button>
            </div>

            {/* ปุ่มแถบเมนู (แสดงบนมือถือ หรือเมื่อสลับเป็นโหมดจำลองมือถือ) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`${viewMode === 'desktop' ? 'md:hidden' : 'flex'} w-8 h-8 rounded-full bg-[#154c2e] hover:bg-[#0f3a22] border-2 border-[#c5a059] flex items-center justify-center text-amber-300 shadow-sm transition active:scale-95 cursor-pointer shrink-0`}
              title={lang === 'TH' ? 'เมนูนำทาง' : 'Navigation Menu'}
            >
              {menuOpen ? <X size={16} /> : <MenuIcon size={16} />}
            </button>
          </div>
        </header>

        {/* ช่องค้นหา (แสดงเมื่อกดแว่นขยาย) */}
        {searchOpen && (
          <div className="bg-emerald-50/90 backdrop-blur-xs px-4 py-2.5 border-b border-emerald-100 z-30">
            <div className="max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'TH' ? 'ค้นหานิทรรศการ, การประกวด...' : 'Search exhibitions, contests...'}
                className="w-full bg-white text-sm px-4 py-2 rounded-full border border-emerald-200 focus:outline-none focus:border-[#154c2e] shadow-xs"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Side Drawer เมนูเลื่อนสไลด์ออกมาจากด้านข้างขวา */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end menu-backdrop"
            onClick={() => setMenuOpen(false)}
          >
            <div
              className="w-[285px] max-w-[85%] bg-white h-full shadow-2xl flex flex-col menu-side-drawer border-l border-emerald-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#154c2e] text-white p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <img src="/ku-logo.png" alt="KU" className="w-8 h-8 object-contain drop-shadow-xs" />
                  <div>
                    <h3 className="text-sm font-bold leading-tight">
                      {lang === 'TH' ? 'เกษตรแฟร์' : 'Kaset Fair'}
                    </h3>
                    <p className="text-[10px] text-amber-300">kaset4fair menu</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                <button
                  onClick={() => { setActiveTab('home'); setSelectedItem(null); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'home' ? 'bg-[#154c2e] text-[#facc15]' : 'bg-gray-100 text-gray-600'}`}>
                    <HomeIcon size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'หน้าแรกของงาน' : 'Main Event Page'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('map'); setSelectedItem(null); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${
                    activeTab === 'map'
                      ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'map' ? 'bg-[#154c2e] text-[#facc15]' : 'bg-amber-100/70 text-amber-700'}`}>
                    <MapPin size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'แผนที่งาน' : 'Event Map'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'ผังมหาวิทยาลัย' : 'Campus Layout'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('activities'); setSelectedItem(null); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${
                    activeTab === 'activities'
                      ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'activities' ? 'bg-[#154c2e] text-[#facc15]' : 'bg-emerald-100/60 text-[#154c2e]'}`}>
                    <Calendar size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'กิจกรรม' : 'Activities'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'ตารางประกวดและกิจกรรม' : 'Contests & Schedules'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('more'); setSelectedItem(null); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${
                    activeTab === 'more'
                      ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'more' ? 'bg-[#154c2e] text-[#facc15]' : 'bg-gray-100 text-gray-600'}`}>
                    <MoreHorizontal size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'เพิ่มเติม' : 'More'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'ข้อมูลติดต่อและอื่นๆ' : 'Contact & Info'}
                    </div>
                  </div>
                </button>
              </div>

              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center text-[11px] text-gray-400">
                {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์' : 'Kasetsart University'}
              </div>
            </div>
          </div>
        )}

        {/* Modal / Popup กิจกรรม (แสดงหน้าต่างลอยเมื่อกดแท็บ 'กิจกรรม') */}
        {activitiesModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in"
            onClick={() => setActivitiesModalOpen(false)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-emerald-100 transform transition-all animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-linear-to-r from-[#154c2e] to-[#1e6b41] px-6 py-4.5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-amber-300">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg leading-tight">
                      {lang === 'TH' ? 'เมนูกิจกรรมเกษตร 4 แฟร์' : 'Event Activities & Info'}
                    </h3>
                    <p className="text-[11px] text-emerald-100/90">
                      {lang === 'TH' ? 'เลือกหัวข้อกิจกรรมที่คุณสนใจเพื่อเข้าชม' : 'Select an activity to view details'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActivitiesModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body: รวมข้อมูลส่วนที่เหลือ */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
                {/* 1. แผนที่การจัดงาน */}
                <button
                  onClick={() => {
                    setActiveTab('map');
                    setSelectedItem(null);
                    setActivitiesModalOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 transition text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <MapPin size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#154c2e] transition">
                      {lang === 'TH' ? 'แผนที่การจัดงาน' : 'Event Map'}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {lang === 'TH' ? 'ผังงาน จุดจอดรถ และอาคาร' : 'Campus map & parking'}
                    </p>
                  </div>
                </button>

                {/* 2. อบรมวิชาชีพ */}
                <button
                  onClick={() => {
                    setActiveTab('workshop');
                    setSelectedItem(null);
                    setActivitiesModalOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 transition text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-[#154c2e] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <BookOpen size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#154c2e] transition">
                      {lang === 'TH' ? 'อบรมวิชาชีพ' : 'Workshops'}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {lang === 'TH' ? 'หลักสูตรอบรมอาชีพระยะสั้น' : 'Short courses & training'}
                    </p>
                  </div>
                </button>

                {/* 3. นิทรรศการและการประกวด (เปิดดูหน้ารวมกิจกรรมทั้งหมด) */}
                <button
                  onClick={() => {
                    setActiveTab('activities');
                    setSelectedItem(null);
                    setActivitiesModalOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 transition text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Sprout size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#154c2e] transition">
                      {lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibitions & Contests'}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {lang === 'TH' ? 'กิจกรรม การประกวด และนิทรรศการทั้งหมด' : 'All competitions and exhibitions'}
                    </p>
                  </div>
                </button>

                {/* 4. การแสดงเวทีกลาง */}
                <button
                  onClick={() => {
                    setActiveTab('stage');
                    setSelectedItem(null);
                    setActivitiesModalOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 transition text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Music size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#154c2e] transition">
                      {lang === 'TH' ? 'การแสดงเวทีกลาง' : 'Main Stage'}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {lang === 'TH' ? 'คอนเสิร์ต ศิลปวัฒนธรรม' : 'Concerts & performances'}
                    </p>
                  </div>
                </button>

                {/* 5. การเดินทาง */}
                <button
                  onClick={() => {
                    setActiveTab('transit');
                    setSelectedItem(null);
                    setActivitiesModalOpen(false);
                  }}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-emerald-50/70 hover:border-emerald-200 transition text-left cursor-pointer group sm:col-span-2"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                    <Bus size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-800 group-hover:text-[#154c2e] transition">
                      {lang === 'TH' ? 'การเดินทาง' : 'Transportation'}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {lang === 'TH' ? 'รถรับส่ง จุดจอดรถ และเส้นทางมางาน' : 'Shuttle bus, parking & routes'}
                    </p>
                  </div>
                </button>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{lang === 'TH' ? 'เกษตร 4 แฟร์ มก. ฉกส.' : 'KU CSC Kaset 4 Fair'}</span>
                <button
                  onClick={() => setActivitiesModalOpen(false)}
                  className="text-xs font-semibold text-[#154c2e] hover:underline cursor-pointer"
                >
                  {lang === 'TH' ? 'ปิดหน้าต่าง' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            2. Hero Banner Section
            ========================================================= */}
        {activeTab === 'home' && (
          <div className="flex flex-col items-center w-full">
            {/* ส่วนแบนเนอร์ศิลปินและการแสดง: กดดูรายละเอียดได้เต็มตา ไม่ล้นขอบจอ */}
            <div className={`w-full ${viewMode === 'desktop' ? 'max-w-6xl px-2 sm:px-4 pt-2 md:pt-4' : 'px-0 pt-0'}`}>
              <section
                onClick={() => openDetailPage(BANNER_EVENT)}
                className="relative w-full overflow-hidden flex items-center justify-center bg-transparent cursor-pointer group"
                title={lang === 'TH' ? 'คลิกเพื่อดูรายละเอียดศิลปินและกำหนดการทั้งหมด' : 'Click to view full artists lineup and schedules'}
              >
                <img
                  src="/events/banner-bg.jpg"
                  alt="แบนเนอร์ศิลปินและตารางการแสดง เกษตรแฟร์ นนทรีอีสาน"
                  className="w-full h-auto max-h-[460px] object-contain block group-hover:scale-[1.01] transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/65 backdrop-blur-xs text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
                  {lang === 'TH' ? ' คลิกดูรายละเอียดศิลปิน & ตารางงาน' : ' Click to view details'}
                </span>
              </section>
            </div>

            {/* ปุ่ม แผนที่การจัดงาน: อยู่ใต้แบนเนอร์ ไม่บังแบนเนอร์ศิลปิน */}
            <div className={`w-full flex items-center justify-center my-3 sm:my-4 ${viewMode === 'desktop' ? 'md:my-5' : 'my-3'} px-4`}>
              <button
                onClick={() => setActiveTab('map')}
                className={`btn-banner-yellow whitespace-nowrap text-[11px] sm:text-xs ${
                  viewMode === 'desktop' ? 'md:text-sm md:px-8 md:py-3' : 'px-4 py-2.5'
                } shrink-0 cursor-pointer shadow-md hover:scale-105 transition-transform duration-200`}
              >
                <MapPin size={16} className="shrink-0" />
                <span>{lang === 'TH' ? 'แผนที่การจัดงาน' : 'Event Map'}</span>
                <ChevronRight size={16} className="shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            3. เนื้อหาหลัก (Main Content)
            ========================================================= */}
        <main className="flex-1">
          {activeTab === 'map' ? (
            /* หน้าแผนผังงาน */
            <div className={`px-4 py-6 ${viewMode === 'desktop' ? 'max-w-5xl' : 'max-w-md'} mx-auto space-y-4 animate-fade-in`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg ${viewMode === 'desktop' ? 'md:text-2xl' : 'text-lg'} font-bold text-[#154c2e]`}>
                    {lang === 'TH' ? 'แผนผังงานเกษตรแฟร์ นนทรีอีสาน' : 'KASET FAIR Event Map (KU CSC)'}
                  </h2>
                  <p className="text-[11px] md:text-xs text-gray-500">
                    {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร' : 'Kasetsart University Chalermphrakiat Sakon Nakhon Province Campus'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                >
                  <span>←</span>
                  <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                <div className="relative overflow-auto max-h-[75vh] bg-white flex items-center justify-center">
                  <img
                    src="/kaset-map.jpg"
                    alt="KASET 4 FAIR Map"
                    className="w-full h-auto object-contain cursor-zoom-in hover:opacity-95 transition"
                    onClick={() => window.open('/kaset-map.jpg', '_blank')}
                  />
                </div>
                <div className="p-3 md:p-4 bg-emerald-50 text-xs md:text-sm text-[#154c2e] flex items-center justify-between">
                  <span className="text-[11px] md:text-xs">
                    {lang === 'TH' ? '💡 คลิกที่รูปเพื่อดูรายละเอียดรหัสอาคาร' : '💡 Click on the image to view building details'}
                  </span>
                  <a
                    href="/kaset-map.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#154c2e] text-white px-3.5 py-1.5 rounded-lg font-semibold text-[11px] md:text-xs shadow-xs hover:bg-[#0f3a22] transition"
                  >
                    {lang === 'TH' ? 'เปิดเต็มจอ' : 'Full Screen'}
                  </a>
                </div>
              </div>
            </div>
          ) : activeTab === 'activities' ? (
            /* หน้ากิจกรรมทั้งหมด (เปิดจากแถบเมนู 3 ขีด หรือปุ่มกิจกรรม) */
            <div className={`px-3 sm:px-4 py-4 md:py-6 ${viewMode === 'desktop' ? 'max-w-5xl' : 'max-w-md'} mx-auto space-y-5 animate-fade-in`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg ${viewMode === 'desktop' ? 'md:text-2xl' : 'text-lg'} font-bold text-[#154c2e]`}>
                    {lang === 'TH' ? 'กิจกรรมและนิทรรศการทั้งหมด' : 'All Activities & Exhibitions'}
                  </h2>
                  <p className="text-[11px] md:text-xs text-gray-500">
                    {lang === 'TH' ? 'รวมนิทรรศการ การประกวดแข่งขัน และกิจกรรมในงานเกษตรแฟร์' : 'All exhibitions, contests, and event activities'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                >
                  <span>←</span>
                  <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
                </button>
              </div>

              {/* รายการกิจกรรมและการประกวดทั้งหมด */}
              <div className={`grid grid-cols-1 ${viewMode === 'desktop' ? 'sm:grid-cols-2 md:grid-cols-3 gap-5' : 'gap-3.5'}`}>
                {cardsData.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openDetailPage(item)}
                    className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer group hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={lang === 'TH' ? item.title_th : item.title_en}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {lang === 'TH' ? 'คลิกดูรายละเอียด' : 'View Details'}
                      </span>
                    </div>

                    <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#154c2e] transition line-clamp-2 leading-snug">
                          {lang === 'TH' ? item.title_th : item.title_en}
                        </h3>
                        <div className="mt-2 space-y-1 text-[11px] text-gray-500">
                          <div className="flex items-center gap-1.5 line-clamp-1">
                            <MapPin size={13} className="shrink-0 text-amber-600" />
                            <span>{lang === 'TH' ? item.location_info_th : item.location_info_en}</span>
                          </div>
                          <div className="flex items-center gap-1.5 line-clamp-1">
                            <Calendar size={13} className="shrink-0 text-amber-600" />
                            <span>{lang === 'TH' ? item.time_info_th : item.time_info_en}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailPage(item);
                        }}
                        className="w-full bg-emerald-50 hover:bg-[#154c2e] text-[#154c2e] hover:text-white py-2 rounded-xl text-xs font-semibold transition border border-emerald-200 hover:border-[#154c2e] flex items-center justify-center gap-1"
                      >
                        <span>{lang === 'TH' ? 'อ่านรายละเอียดทั้งหมด' : 'Read Full Details'}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'detail' && selectedItem ? (
            /* หน้ารายละเอียดแบบเต็มหน้าจอ (แสดงรูปเต็มใบ ไม่ตัดขอบ ไม่ทับข้อความ) */
            <div className={`px-3 sm:px-4 py-4 md:py-6 ${viewMode === 'desktop' ? 'max-w-4xl' : 'max-w-md'} mx-auto space-y-4 animate-fade-in`}>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedItem(null);
                  }}
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 shrink-0 whitespace-nowrap inline-flex items-center gap-1"
                >
                  <span>←</span>
                  <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
                </button>
                <span className="text-[11px] md:text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibition & Contest'}
                </span>
              </div>

              {/* การ์ดรายละเอียด: แสดงรูปภาพเต็มใบแท้จริง ไม่ครอบตัด และพื้นหลังขาวสะอาด ไร้แถบสีเข้ม */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col">
                <div className="w-full bg-white p-0 sm:p-2 flex items-center justify-center min-h-[300px] max-h-[82vh]">
                  <img
                    src={selectedItem.image_url}
                    alt={lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                </div>

                <div className="p-4 sm:p-6 md:p-7 space-y-4">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#154c2e] leading-snug">
                    {lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-emerald-50/70 p-3 sm:p-4 rounded-2xl border border-emerald-100 text-xs sm:text-sm">
                    <div className="flex items-start gap-2 text-[#154c2e]">
                      <MapPin size={16} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>{lang === 'TH' ? 'สถานที่จัดงาน:' : 'Location:'}</strong>{' '}
                        {lang === 'TH' ? selectedItem.location_info_th : selectedItem.location_info_en}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-[#154c2e]">
                      <Calendar size={16} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>{lang === 'TH' ? 'เวลาเปิดเข้าชม:' : 'Time:'}</strong>{' '}
                        {lang === 'TH' ? selectedItem.time_info_th : selectedItem.time_info_en}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800">
                      {lang === 'TH' ? 'รายละเอียดกิจกรรม' : 'Event Details'}
                    </h3>
                    <div className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/80 p-3.5 sm:p-5 rounded-2xl border border-gray-100">
                      {lang === 'TH' ? selectedItem.description_th : selectedItem.description_en}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'more' ? (
            /* หน้าข้อมูลเพิ่มเติม: ข้อมูลการติดต่อมหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร */
            <div className={`px-3 sm:px-4 py-4 md:py-6 ${viewMode === 'desktop' ? 'max-w-4xl' : 'max-w-md'} mx-auto space-y-4 animate-fade-in`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`text-lg ${viewMode === 'desktop' ? 'md:text-2xl' : 'text-lg'} font-bold text-[#154c2e]`}>
                    {lang === 'TH' ? 'ข้อมูลการติดต่อมหาวิทยาลัย' : 'Contact Information'}
                  </h2>
                  <p className="text-[11px] md:text-xs text-gray-500">
                    {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร (มก.ฉกส.)' : 'Kasetsart University Chalermphrakiat Sakon Nakhon Province Campus'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                >
                  <span>←</span>
                  <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
                </button>
              </div>

              {/* ข้อมูลที่อยู่และช่องทางหลัก */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-emerald-100 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#154c2e] flex items-center justify-center shrink-0">
                    <Building size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#154c2e]">
                      {lang === 'TH' ? 'ที่ตั้งมหาวิทยาลัย' : 'Campus Address'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                      59 หมู่ 1 ถนนวปรอ 366 (ทางหลวงหมายเลข 227) ตำบลเชียงเครือ อำเภอเมือง จังหวัดสกลนคร 47000
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <a
                    href="tel:0610287788"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 transition border border-emerald-200 text-[#154c2e]"
                  >
                    <Phone size={18} className="text-[#154c2e] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-gray-500 font-medium">โทรศัพท์กลาง / ประชาสัมพันธ์</div>
                      <div className="text-xs sm:text-sm font-bold truncate">061-028-7788</div>
                    </div>
                  </a>

                  <a
                    href="tel:042725042"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 transition border border-emerald-200 text-[#154c2e]"
                  >
                    <Phone size={18} className="text-[#154c2e] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-gray-500 font-medium">โทรศัพท์สำนักงานวิทยาเขต</div>
                      <div className="text-xs sm:text-sm font-bold truncate">042-725-042</div>
                    </div>
                  </a>

                  <a
                    href="https://www.csc.ku.ac.th"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 transition border border-emerald-200 text-[#154c2e]"
                  >
                    <Globe size={18} className="text-[#154c2e] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-gray-500 font-medium">เว็บไซต์วิทยาเขต</div>
                      <div className="text-xs sm:text-sm font-bold truncate">www.csc.ku.ac.th</div>
                    </div>
                  </a>

                  <a
                    href="https://occ.csc.ku.ac.th"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 transition border border-emerald-200 text-[#154c2e]"
                  >
                    <Globe size={18} className="text-[#154c2e] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] text-gray-500 font-medium">สำนักงานวิทยาเขต</div>
                      <div className="text-xs sm:text-sm font-bold truncate">occ.csc.ku.ac.th</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* เบอร์โทรหน่วยงานภายในที่สำคัญ */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <Phone size={18} className="text-amber-600" />
                  <span>{lang === 'TH' ? 'หน่วยงานบริการนิสิตและการศึกษา' : 'Student & Academic Services'}</span>
                </h3>

                <div className="divide-y divide-gray-100 text-xs sm:text-sm">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-700">งานรับเข้าศึกษา (ป.ตรี/ป.โท)</span>
                    <a href="tel:0862241118" className="font-bold text-[#154c2e] hover:underline">086-224-1118, 042-725-052</a>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-700">งานทะเบียนและประมวลผล</span>
                    <a href="tel:0817391745" className="font-bold text-[#154c2e] hover:underline">081-739-1745</a>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-700">งานทุนการศึกษา (กยศ. / กรอ.)</span>
                    <a href="tel:0984854435" className="font-bold text-[#154c2e] hover:underline">098-485-4435</a>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-700">หน่วยหอพักนิสิต</span>
                    <a href="tel:0885108007" className="font-bold text-[#154c2e] hover:underline">088-510-8007</a>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-700">ห้องสมุดวิทยาเขต</span>
                    <a href="tel:042725093" className="font-bold text-[#154c2e] hover:underline">042-725-093</a>
                  </div>
                </div>
              </div>

              {/* คณะต่างๆ ภายในวิทยาเขต */}
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-100 space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                  <GraduationCap size={18} className="text-[#154c2e]" />
                  <span>{lang === 'TH' ? 'คณะวิชาภายในวิทยาเขต' : 'Faculties in Campus'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="font-bold text-gray-800">คณะทรัพยากรธรรมชาติและอุตสาหกรรมเกษตร</div>
                    <div className="text-gray-500 mt-1">โทร: 042-725-036, 081-739-1789</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="font-bold text-gray-800">คณะวิทยาศาสตร์และวิศวกรรมศาสตร์</div>
                    <div className="text-gray-500 mt-1">โทร: 042-725-033</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="font-bold text-gray-800">คณะศิลปศาสตร์และวิทยาการจัดการ</div>
                    <div className="text-gray-500 mt-1">โทร: 042-725-039, 081-739-1377</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="font-bold text-gray-800">คณะสาธารณสุขศาสตร์</div>
                    <div className="text-gray-500 mt-1">โทร: 093-329-6556, 042-725-023</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* หน้าหลัก: ส่วนการ์ดนิทรรศการและการประกวด + ไฮไลต์กำหนดการ */
            <div className={`pc-content-wrapper px-3 sm:px-4 ${viewMode === 'desktop' ? 'md:px-8 py-3 md:py-6 space-y-6 md:space-y-10' : 'py-3 space-y-5 max-w-[430px] mx-auto'}`}>
              
              {/* 3.1 ส่วนการ์ดนิทรรศการและการประกวด (บน Desktop แสดงการ์ด Grid 4 ช่อง สไตล์เกษตรกำแพงแสน) */}
              <section id="exhibitions">
                <div className="pc-section-header flex items-center justify-between mb-4 px-0.5">
                  <div>
                    <h2 className="text-base md:text-2xl font-bold text-[#154c2e] tracking-tight">
                      {lang === 'TH' ? 'ข่าวสาร / กิจกรรม' : 'News & Activities'}
                    </h2>
                    <div className="hidden md:block w-12 h-1 bg-[#154c2e] rounded-full mt-1.5" />
                  </div>
                  <button
                    onClick={() => { setActiveTab('activities'); }}
                    className="text-xs md:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-[#154c2e] hover:text-white px-3.5 py-1.5 rounded-full border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{lang === 'TH' ? 'ข่าวทั้งหมด' : 'All News'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* บน Desktop: แสดงเป็น Grid 4 การ์ดเรียงแถวหน้ากว้าง สวยงามแบบเว็บเกษตรกำแพงแสน */}
                {viewMode === 'desktop' ? (
                  <div className="hidden md:grid grid-cols-4 gap-5">
                    {cardsData.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openDetailPage(item)}
                        className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer group hover:-translate-y-1"
                      >
                        <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={lang === 'TH' ? item.title_th : item.title_en}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
                          <div>
                            <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#154c2e] transition line-clamp-2 leading-snug">
                              {lang === 'TH' ? item.title_th : item.title_en}
                            </h3>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-1.5 flex items-center gap-1">
                              <MapPin size={13} className="shrink-0 text-amber-600" />
                              <span>{lang === 'TH' ? item.location_info_th : item.location_info_en}</span>
                            </p>
                          </div>
                          <span className="text-[11px] font-semibold text-[#154c2e] group-hover:underline flex items-center gap-0.5">
                            {lang === 'TH' ? 'รายละเอียดเพิ่มเติม →' : 'Learn more →'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* บน Mobile (หรือหน้าจอเล็ก): สไลเดอร์ภาพเลื่อนโปร่งใสเฉพาะ 4 ไฮไลต์หลัก พร้อมจุด 4 จุด */}
                <div className={`relative w-full group py-1 ${viewMode === 'desktop' ? 'md:hidden' : 'block'}`}>
                  {/* กรอบแสดงภาพแบบโปร่งใส ไร้ขอบขาว กลมกลืนกับพื้นหลัง */}
                  <div className="relative w-full aspect-[1/1.25] sm:aspect-[1/1.2] max-h-[90vh] flex items-center justify-center">
                    {highlightCards.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => openDetailPage(item)}
                        className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out cursor-pointer ${
                          idx === currentSlide
                            ? 'opacity-100 scale-100 z-10'
                            : 'opacity-0 scale-95 pointer-events-none z-0'
                        }`}
                      >
                        <img
                          src={item.image_url}
                          alt={lang === 'TH' ? item.title_th : item.title_en}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  {/* แถบควบคุมด้านล่างรูปภาพ: รวมปุ่ม ❮ [จุด 4 จุด] ❯ ไว้ด้วยกัน ไม่บังรูปภาพ */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3.5">
                    {/* ปุ่มย้อนกลับ ❮ */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide((prev) => (prev - 1 + highlightCards.length) % highlightCards.length);
                      }}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#154c2e]/10 hover:bg-[#154c2e] text-[#154c2e] hover:text-white flex items-center justify-center transition cursor-pointer text-xs sm:text-sm font-bold border border-[#154c2e]/20 active:scale-95 shadow-2xs"
                      title="ภาพก่อนหน้า"
                    >
                      ❮
                    </button>

                    {/* จุด Dot Indicators 4 จุด */}
                    <div className="flex items-center gap-2">
                      {highlightCards.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentSlide
                              ? 'w-7 bg-[#154c2e] shadow-xs'
                              : 'w-2.5 bg-[#154c2e]/25 hover:bg-[#154c2e]/50'
                          }`}
                        />
                      ))}
                    </div>

                    {/* ปุ่มถัดไป ❯ */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide((prev) => (prev + 1) % highlightCards.length);
                      }}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#154c2e]/10 hover:bg-[#154c2e] text-[#154c2e] hover:text-white flex items-center justify-center transition cursor-pointer text-xs sm:text-sm font-bold border border-[#154c2e]/20 active:scale-95 shadow-2xs"
                      title="ภาพถัดไป"
                    >
                      ❯
                    </button>
                  </div>
                </div>
              </section>

              {/* 3.3 พื้นที่ว่างสำหรับใส่ไอเดียหรือฟีเจอร์ใหม่ในอนาคต */}
              <div className="py-2" />

            </div>
          )}
        </main>

        {/* =========================================================
            4. Footer สีเขียวเข้ม มก.
            ========================================================= */}
        <footer className={`bg-[#154c2e] text-white ${viewMode === 'desktop' ? 'p-4 md:px-8 md:py-6 mt-8 md:mt-12' : 'p-3 sm:p-3.5 mt-5'}`}>
          <div className="max-w-6xl mx-auto flex items-center gap-2.5 sm:gap-3 md:gap-5">
            <img
              src="/ku-logo.png"
              alt="KU Logo"
              className={`${viewMode === 'desktop' ? 'w-12 h-12 md:w-16 md:h-16' : 'w-10 h-10'} object-contain drop-shadow-md shrink-0`}
            />
            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className={`${viewMode === 'desktop' ? 'text-xs md:text-base' : 'text-[11.5px] sm:text-xs'} font-bold text-[#facc15] leading-tight`}>
                {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร' : 'Kasetsart University Chalermphrakiat Sakon Nakhon Province Campus'}
              </h4>
              <p className={`${viewMode === 'desktop' ? 'text-[9.5px] md:text-xs' : 'text-[9.5px]'} text-white/85 leading-snug`}>
                {lang === 'TH' ? '59 หมู่ 1 ถนนวปรอ. 366 ตำบลเชียงเครือ อำเภอเมืองสกลนคร จังหวัดสกลนคร 47000' : '59 Moo 1, VPOR 366 Rd., Chiang Khruea, Mueang Sakon Nakhon, Sakon Nakhon 47000'}
              </p>
              <p className={`${viewMode === 'desktop' ? 'text-[9px] md:text-xs' : 'text-[9px]'} text-white/70`}>
                {lang === 'TH' ? 'ติดต่อ: สำนักงานวิทยาเขต | 042-725-042, 061-028-7788' : 'Contact: Campus Office | 042-725-042, 061-028-7788'}
              </p>
              <p className={`${viewMode === 'desktop' ? 'text-[8.5px] md:text-[11px]' : 'text-[8.5px]'} text-white/50 pt-0.5`}>
                © Copyright Kasetsart University CSC | Kaset4fair
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
