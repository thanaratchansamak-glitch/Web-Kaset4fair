import React, { useState } from 'react';
import '../screens_css/Home.css';
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
  ShoppingBag
} from 'lucide-react';

// รายการการ์ด 4 ใบสำหรับส่วนนิทรรศการและการประกวด
const EXHIBITION_CARDS = [
  {
    id: 1,
    title_th: 'นิทรรศการเกษตรและนวัตกรรม',
    title_en: 'Agri & Innovation Expo',
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=85',
    icon: 'Sprout',
    description_th: 'จัดแสดงผลงานวิจัยและนวัตกรรมทางการเกษตรอัจฉริยะ (Smart Farming) โดรนเพื่อการเกษตร และพันธุ์พืชปรับปรุงใหม่ คณะทรัพยากรธรรมชาติและอุตสาหกรรมเกษตร มก. ฉกส.',
    description_en: 'Showcasing smart farming research, agricultural drones, and new crop varieties from Faculty of Natural Resources and Agro-Industry, KU CSC.',
    location_info_th: 'อาคารบริหารและวิชาการรวม (อาคาร 1) และลานนิทรรศการกลาง มก. ฉกส.',
    location_info_en: 'Administration & Academic Building (Bldg 1) & Central Plaza, KU CSC',
    time_info_th: '09:00 - 20:00 น.',
    time_info_en: '09:00 AM - 08:00 PM'
  },
  {
    id: 2,
    title_th: 'การประกวดโปสเตอร์และคลิป',
    title_en: 'Poster & Video Contest',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=85',
    icon: 'Video',
    description_th: 'การประกวดผลงานทางวิชาการ โปสเตอร์วิจัย และการประกวดคลิปสั้นสร้างสรรค์การเกษตรชิงรางวัลเกียรติยศ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร',
    description_en: 'Academic poster competitions and creative short agricultural video contests at KU CSC.',
    location_info_th: 'อาคารเรียนรวม (อาคาร 7) มก. ฉกส.',
    location_info_en: 'Lecture Hall Building (Bldg 7), KU CSC',
    time_info_th: '08:30 - 18:00 น.',
    time_info_en: '08:30 AM - 06:00 PM'
  },
  {
    id: 3,
    title_th: 'การประกวดพืชและสัตว์',
    title_en: 'Plant & Animal Contest',
    image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=85',
    icon: 'Leaf',
    description_th: 'การประกวดพืชสวน พืชไร่ ผลไม้ และสัตว์เศรษฐกิจพันธุ์ดี เช่น โคเนื้อภูพาน โคนม ปลากัดสวยงาม และสัตว์เลี้ยงในเขตภาคอีสานตอนบน',
    description_en: 'Horticultural crops, fruits, and economic livestock contests including Phuphan cattle, ornamental fish, and pets.',
    location_info_th: 'โซนฟาร์มพืชและสัตว์ทดลอง มก. ฉกส.',
    location_info_en: 'Experimental Farm & Livestock Zone, KU CSC',
    time_info_th: '09:00 - 18:00 น.',
    time_info_en: '09:00 AM - 06:00 PM'
  },
  {
    id: 4,
    title_th: 'นิทรรศการผลงานวิจัยและนวัตกรรม',
    title_en: 'Research & Innovation Expo',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85',
    icon: 'Microscope',
    description_th: 'นวัตกรรมทางวิทยาศาสตร์ การแพทย์ วิศวกรรมศาสตร์ เทคโนโลยีชีวภาพ และผลิตภัณฑ์ต้นแบบพร้อมต่อยอดสู่เชิงพาณิชย์ของ มก. สกลนคร',
    description_en: 'Scientific innovations, engineering, biotechnology, and commercial-ready prototypes of KU CSC.',
    location_info_th: 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารปฏิบัติการ มก. ฉกส.',
    location_info_en: 'Science Laboratories Building, KU CSC',
    time_info_th: '10:00 - 19:00 น.',
    time_info_en: '10:00 AM - 07:00 PM'
  }
];

export default function Home() {
  const [lang, setLang] = useState('TH');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activitiesModalOpen, setActivitiesModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);

  // สถานะโหมดการแสดงผลบน PC: 'desktop' (เว็บใหญ่เต็มจอ) หรือ 'mobile' (จำลองมือถือ)
  const [viewMode, setViewMode] = useState('desktop');

  // แท็บวันที่ของไฮไลต์กำหนดการประกวด (รองรับ 2 ภาษา)
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
  const filteredCards = EXHIBITION_CARDS.filter((item) =>
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
          {/* ฝั่งซ้าย: ตราสัญลักษณ์ มก. และข้อความมหาวิทยาลัยเกษตรศาสตร์ */}
          <div
            className="flex items-center gap-2 min-w-0 shrink-0 cursor-pointer"
            onClick={() => { setActiveTab('home'); setSelectedItem(null); }}
          >
            <img
              src="/ku-logo.png"
              alt="มหาวิทยาลัยเกษตรศาสตร์"
              className="w-9 h-9 md:w-10 md:h-10 object-contain drop-shadow-xs shrink-0"
            />
            <span className="text-[13px] sm:text-[14px] md:text-[15px] font-semibold text-[#1a5336] tracking-tight leading-none truncate">
              {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์' : 'Kasetsart University'}
            </span>
          </div>

          {/* เมนูกลางเฉพาะบนจอ PC ในโหมด Desktop (รองรับภาษา TH / EN) */}
          {viewMode === 'desktop' && (
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              <button
                onClick={() => { setActiveTab('home'); setSelectedItem(null); }}
                className={`pc-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              >
                {lang === 'TH' ? 'หน้าหลัก' : 'Home'}
              </button>
              <button
                onClick={() => { setActiveTab('shop'); setSelectedItem(null); }}
                className={`pc-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
              >
                {lang === 'TH' ? 'ร้านค้า' : 'Shop'}
              </button>
              <button
                onClick={() => setActivitiesModalOpen(true)}
                className={`pc-nav-item inline-flex items-center gap-1.5 ${['map', 'workshop', 'stage', 'transit'].includes(activeTab) || activitiesModalOpen ? 'active' : ''}`}
              >
                <span>{lang === 'TH' ? 'กิจกรรม' : 'Activities'}</span>
                <ChevronDown size={14} className="shrink-0 opacity-75 mt-0.5" />
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

                {/* 3. นิทรรศการและการประกวด */}
                <a
                  href="#exhibitions"
                  onClick={() => {
                    setActiveTab('home');
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
                      {lang === 'TH' ? 'การประกวดพืช สัตว์ นวัตกรรม' : 'Agricultural competitions'}
                    </p>
                  </div>
                </a>

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
          <section className={`pt-4 sm:pt-6 ${viewMode === 'desktop' ? 'md:pt-10' : 'md:pt-6'} pb-3 flex flex-col items-center px-4`}>
            <div className={`flex items-center justify-center gap-3 sm:gap-4 ${viewMode === 'desktop' ? 'md:gap-7 md:max-w-2xl' : 'max-w-[360px]'} w-full`}>
              {/* ตราสัญลักษณ์เกษตร 4 แฟร์ */}
              <img
                src="/emblem.png?v=2"
                alt="KASET 4 FAIR Emblem"
                className={`w-24 h-24 sm:w-28 sm:h-28 ${viewMode === 'desktop' ? 'md:w-44 md:h-44' : 'w-24 h-24'} object-contain shrink-0 mix-blend-multiply drop-shadow-sm`}
              />

              {/* ข้อความต้อนรับและชื่องาน */}
              <div className="text-left">
                <p className={`text-[#154c2e] font-semibold text-xs sm:text-sm ${viewMode === 'desktop' ? 'md:text-xl' : 'text-xs'} mb-0.5`}>
                  {lang === 'TH' ? 'ขอเชิญเที่ยวงาน' : 'Welcome to'}
                </p>
                <h1 className={`text-2xl sm:text-3xl ${viewMode === 'desktop' ? 'md:text-5xl' : 'text-2xl'} font-extrabold text-[#154c2e] tracking-tight leading-tight`}>
                  {lang === 'TH' ? (
                    <>เกษตร <span className="text-[#f59e0b]">4</span> แฟร์</>
                  ) : (
                    <>KASET <span className="text-[#f59e0b]">4</span> FAIR</>
                  )}
                </h1>
                <p className={`text-[#154c2e] font-bold text-xs sm:text-sm ${viewMode === 'desktop' ? 'md:text-xl md:mt-1.5' : 'text-xs'} mt-0.5`}>
                  {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์' : 'Kasetsart University'}
                </p>
              </div>
            </div>

            {/* 2 ปุ่ม Action ใต้ฮีโร่ */}
            <div className={`flex items-center gap-2 sm:gap-3 ${viewMode === 'desktop' ? 'md:gap-5' : 'gap-2.5'} w-full justify-center mt-4 sm:mt-5 ${viewMode === 'desktop' ? 'md:mt-8' : 'mt-4'} px-1`}>
              <a
                href="#exhibitions"
                className={`btn-banner-green whitespace-nowrap text-[11px] sm:text-xs ${viewMode === 'desktop' ? 'md:text-sm md:px-7 md:py-3' : 'px-3.5 py-2.5'} shrink-0`}
              >
                <span>{lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibitions & Contests'}</span>
                <ChevronRight size={16} className="shrink-0" />
              </a>
              <button
                onClick={() => setActiveTab('map')}
                className={`btn-banner-yellow whitespace-nowrap text-[11px] sm:text-xs ${viewMode === 'desktop' ? 'md:text-sm md:px-7 md:py-3' : 'px-3.5 py-2.5'} shrink-0 cursor-pointer`}
              >
                <MapPin size={16} className="shrink-0" />
                <span>{lang === 'TH' ? 'แผนที่การจัดงาน' : 'Event Map'}</span>
                <ChevronRight size={16} className="shrink-0" />
              </button>
            </div>
          </section>
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
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200"
                >
                  {lang === 'TH' ? '← หน้าหลัก' : '← Home'}
                </button>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                <div className="relative overflow-auto max-h-[75vh] bg-emerald-950 flex items-center justify-center">
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
          ) : activeTab === 'detail' && selectedItem ? (
            /* หน้ารายละเอียดแบบเต็มหน้าจอ */
            <div className={`px-4 py-6 ${viewMode === 'desktop' ? 'max-w-4xl' : 'max-w-md'} mx-auto space-y-4 animate-fade-in`}>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedItem(null);
                  }}
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 shrink-0"
                >
                  {lang === 'TH' ? '← หน้าหลัก' : '← Home'}
                </button>
                <span className="text-[11px] md:text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  {lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibition & Contest'}
                </span>
              </div>

              <div className={`bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 ${viewMode === 'desktop' ? 'md:grid md:grid-cols-2' : ''}`}>
                <div className="h-56 md:h-full overflow-hidden bg-gray-100">
                  <img
                    src={selectedItem.image_url}
                    alt={lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 md:p-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-bold text-[#154c2e] leading-snug">
                      {lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                    </h2>

                    <div className="space-y-2 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 text-xs md:text-sm">
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

                    <div className="space-y-1.5">
                      <h3 className="text-xs md:text-sm font-bold text-gray-800">
                        {lang === 'TH' ? 'รายละเอียดกิจกรรม' : 'Event Details'}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                        {lang === 'TH' ? selectedItem.description_th : selectedItem.description_en}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* หน้าหลัก: ส่วนการ์ดนิทรรศการและการประกวด + ไฮไลต์กำหนดการ */
            <div className={`pc-content-wrapper px-3 sm:px-4 ${viewMode === 'desktop' ? 'md:px-8 py-3 md:py-6 space-y-6 md:space-y-10' : 'py-3 space-y-5 max-w-[430px] mx-auto'}`}>
              
              {/* 3.1 ส่วนการ์ด 4 ใบ */}
              <section id="exhibitions">
                <div className="pc-section-header flex items-center justify-between mb-3 px-0.5">
                  <h2 className="text-base md:text-xl font-bold text-[#154c2e] tracking-tight">
                    {lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibitions & Contests'}
                  </h2>
                  <button
                    onClick={() => { setActiveTab('activities'); setMenuOpen(true); }}
                    className="text-xs md:text-sm text-gray-500 flex items-center gap-0.5 hover:text-[#154c2e] cursor-pointer"
                  >
                    <span>{lang === 'TH' ? 'ดูทั้งหมด' : 'View All'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* PC Grid (1 Row 4 Cards) แสดงเฉพาะตอนเลือกโหมด Desktop */}
                {viewMode === 'desktop' ? (
                  <div className="hidden md:grid pc-cards-grid">
                    {filteredCards.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => openDetailPage(item)}
                        className="pc-card-box"
                      >
                        <div className="pc-card-img-wrap">
                          <img
                            src={item.image_url}
                            alt={lang === 'TH' ? item.title_th : item.title_en}
                            className="pc-card-img"
                          />
                          <div className="pc-card-icon-badge">
                            {item.icon === 'Sprout' && <Sprout size={18} />}
                            {item.icon === 'Video' && <Video size={18} />}
                            {item.icon === 'Leaf' && <Leaf size={18} />}
                            {item.icon === 'Microscope' && <Microscope size={18} />}
                          </div>
                        </div>
                        <div className="pc-card-title-bar">
                          <span className="pc-card-title-text line-clamp-1">
                            {lang === 'TH' ? item.title_th : item.title_en}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Mobile Grid (2x2 Cards) แสดงบนมือถือ หรือเมื่อ PC สลับเป็นโหมด Mobile */}
                <div className={`grid ${viewMode === 'desktop' ? 'md:hidden' : ''} grid-cols-2 gap-3 sm:gap-3.5`}>
                  {filteredCards.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openDetailPage(item)}
                      className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col home-card-hover cursor-pointer"
                    >
                      <div className="relative h-28 sm:h-32 overflow-hidden bg-gray-100">
                        <img
                          src={item.image_url}
                          alt={lang === 'TH' ? item.title_th : item.title_en}
                          className="w-full h-full object-cover home-card-img-zoom"
                        />
                        <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-[#154c2e]">
                          {item.icon === 'Sprout' && <Sprout size={14} />}
                          {item.icon === 'Video' && <Video size={14} />}
                          {item.icon === 'Leaf' && <Leaf size={14} />}
                          {item.icon === 'Microscope' && <Microscope size={14} />}
                        </div>
                      </div>
                      <div className="p-2 sm:p-2.5 text-center flex-1 flex items-center justify-center min-h-[46px] bg-white">
                        <span className="text-[11.5px] sm:text-[12px] font-bold text-gray-800 leading-tight line-clamp-1">
                          {lang === 'TH' ? item.title_th : item.title_en}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3.2 ส่วนไฮไลต์กำหนดการประกวด (Schedule / Timetable) */}
              <section>
                <div className="mb-3 px-0.5">
                  <h2 className="text-base md:text-xl font-bold text-[#154c2e] tracking-tight">
                    {lang === 'TH' ? 'ไฮไลต์กำหนดการประกวด' : 'Contest Highlights'}
                  </h2>
                  <div className="pc-title-underline" />
                </div>

                <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${viewMode === 'desktop' ? 'md:gap-5' : 'gap-2.5'}`}>
                  {/* การ์ดซ้าย (การประกวดกล้วยไม้) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 md:gap-2">
                      {dates.map((d, idx) => (
                        <button
                          key={d.th}
                          onClick={() => setSelectedDateIdxLeft(idx)}
                          className={`flex-1 py-1 md:py-1.5 text-[10px] sm:text-[11px] md:text-xs font-semibold rounded-full transition cursor-pointer text-center ${
                            selectedDateIdxLeft === idx
                              ? 'bg-[#c5a059] text-white shadow-xs'
                              : 'bg-[#154c2e] text-white hover:bg-[#0f3a22]'
                          }`}
                        >
                          {lang === 'TH' ? d.th : d.en}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl p-3 md:p-5 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[145px] md:min-h-[160px]">
                      <div>
                        <div className="text-[11px] md:text-xs text-gray-700 font-semibold">
                          {lang === 'TH' ? `${dates[selectedDateIdxLeft].th}, 10:00น.` : `${dates[selectedDateIdxLeft].en}, 10:00 AM`}
                        </div>
                        <h4 className="text-xs md:text-sm font-bold text-gray-900 mt-1 line-clamp-1">
                          {lang === 'TH' ? 'การประกวดกล้วยไม้' : 'Orchid Contest'}
                        </h4>
                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                          {lang === 'TH' ? 'ณ ลานกิจกรรม มก. ฉกส.' : 'At Central Plaza, KU CSC'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 md:gap-2 mt-3 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => alert(lang === 'TH' ? 'เปิดรับลงทะเบียน ณ จุดจัดงาน' : 'Registration at the venue')}
                          className="flex-1 min-w-0 bg-[#154c2e] hover:bg-[#0f3a22] text-white text-[11px] sm:text-xs md:text-xs font-semibold py-1.5 md:py-2 px-1 rounded-full text-center transition cursor-pointer shadow-2xs whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center"
                        >
                          {lang === 'TH' ? 'ลงทะเบียน' : 'Register'}
                        </button>
                        <button
                          onClick={() => openDetailPage(EXHIBITION_CARDS[0])}
                          className="flex-1 min-w-0 border border-[#c5a059] text-[#c5a059] hover:bg-amber-50 text-[11px] sm:text-xs md:text-xs font-semibold py-1.5 md:py-2 px-1 rounded-full text-center transition cursor-pointer bg-white whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center"
                        >
                          {lang === 'TH' ? 'รายละเอียด' : 'Details'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* การ์ดขวา (การประกวดคลิปนวัตกรรม) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 md:gap-2">
                      {dates.map((d, idx) => (
                        <button
                          key={d.th}
                          onClick={() => setSelectedDateIdxRight(idx)}
                          className={`flex-1 py-1 md:py-1.5 text-[10px] sm:text-[11px] md:text-xs font-semibold rounded-full transition cursor-pointer text-center ${
                            selectedDateIdxRight === idx
                              ? 'bg-[#c5a059] text-white shadow-xs'
                              : 'bg-[#154c2e] text-white hover:bg-[#0f3a22]'
                          }`}
                        >
                          {lang === 'TH' ? d.th : d.en}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl p-3 md:p-5 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[145px] md:min-h-[160px]">
                      <div>
                        <div className="text-[11px] md:text-xs text-gray-700 font-semibold">
                          {lang === 'TH' ? `${dates[selectedDateIdxRight].th}, 11:00น.` : `${dates[selectedDateIdxRight].en}, 11:00 AM`}
                        </div>
                        <h4 className="text-xs md:text-sm font-bold text-gray-900 mt-1 line-clamp-1">
                          {lang === 'TH' ? 'การประกวดคลิปนวัตกรรม' : 'Innovation Video Contest'}
                        </h4>
                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                          {lang === 'TH' ? 'ห้องประชุม 1 อาคาร 7' : 'Meeting Room 1, Bldg 7'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 md:gap-2 mt-3 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => alert(lang === 'TH' ? 'เปิดรับลงทะเบียน ณ จุดจัดงาน' : 'Registration at the venue')}
                          className="flex-1 min-w-0 bg-[#154c2e] hover:bg-[#0f3a22] text-white text-[11px] sm:text-xs md:text-xs font-semibold py-1.5 md:py-2 px-1 rounded-full text-center transition cursor-pointer shadow-2xs whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center"
                        >
                          {lang === 'TH' ? 'ลงทะเบียน' : 'Register'}
                        </button>
                        <button
                          onClick={() => openDetailPage(EXHIBITION_CARDS[1])}
                          className="flex-1 min-w-0 border border-[#c5a059] text-[#c5a059] hover:bg-amber-50 text-[11px] sm:text-xs md:text-xs font-semibold py-1.5 md:py-2 px-1 rounded-full text-center transition cursor-pointer bg-white whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center"
                        >
                          {lang === 'TH' ? 'รายละเอียด' : 'Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3.3 ส่วนจุดสำคัญในงาน & การเดินทาง */}
              <section>
                <div
                  onClick={() => setActiveTab('map')}
                  className={`bg-white rounded-2xl p-3 ${viewMode === 'desktop' ? 'md:p-5' : 'p-3'} shadow-xs border border-gray-100 flex items-center justify-between gap-2.5 md:gap-6 cursor-pointer hover:shadow-md transition`}
                >
                  <div className="shrink-0">
                    <div className="text-xs md:text-base font-bold text-gray-900 leading-tight">
                      {lang === 'TH' ? 'จุดสำคัญในงาน' : 'Key Locations'}
                    </div>
                    <div className="text-xs md:text-base font-bold text-gray-900 leading-tight">
                      {lang === 'TH' ? '& การเดินทาง' : '& Transportation'}
                    </div>
                  </div>

                  <div className={`w-20 ${viewMode === 'desktop' ? 'md:w-36 md:h-20' : 'h-13'} rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0`}>
                    <img
                      src="/kaset-map.jpg"
                      alt="Map Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-1 md:gap-2 text-[11px] md:text-sm font-semibold text-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-800 hover:text-[#154c2e]">
                      <Bus size={15} className="text-[#154c2e] shrink-0" />
                      <span className="line-clamp-1">
                        {lang === 'TH' ? 'แผนที่งาน เกษตรแฟร์' : 'Kaset Fair Map'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800 hover:text-[#154c2e]">
                      <Train size={15} className="text-[#154c2e] shrink-0" />
                      <span className="line-clamp-1">
                        {lang === 'TH' ? 'วิธีการเดินทาง...' : 'How to get there...'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

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
