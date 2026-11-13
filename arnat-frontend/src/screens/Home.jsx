import React, { useState, useEffect } from 'react';
import '../screens_css/Home.css';
import {
  Search,
  MapPin,
  ChevronRight,
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
  X
} from 'lucide-react';

// รายการการ์ด 4 ใบสำหรับส่วนนิทรรศการและการประกวด (ตามภาพ Mockup)
const EXHIBITION_CARDS = [
  {
    id: 1,
    title_th: 'นิทรรศการเกษตรและนวัตกรรม',
    title_en: 'Agri & Innovation Exhibition',
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
    icon: 'Sprout',
    description_th: 'จัดแสดงผลงานวิจัยและนวัตกรรมทางการเกษตรอัจฉริยะ (Smart Farming) โดรนเพื่อการเกษตร และพันธุ์พืชปรับปรุงใหม่จากคณะต่างๆ ของ มก.',
    description_en: 'Showcasing smart farming research, agricultural drones, and new crop varieties from KU faculties.',
    location_info: 'อาคารจักรพันธ์เพ็ญศิริ และลานนิทรรศการกลาง',
    time_info: '09:00 - 20:00 น.'
  },
  {
    id: 2,
    title_th: 'การประกวดโปสเตอร์และคลิป',
    title_en: 'Poster & Video Contest',
    image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    icon: 'Video',
    description_th: 'การประกวดผลงานทางวิชาการ โปสเตอร์วิจัย และการประกวดคลิปสั้นสร้างสรรค์การเกษตรชิงรางวัลเกียรติยศ',
    description_en: 'Academic poster competitions and creative short agricultural video contests.',
    location_info: 'อาคารสารนิเทศ 50 ปี',
    time_info: '08:30 - 18:00 น.'
  },
  {
    id: 3,
    title_th: 'การประกวดพืชและสัตว์เศรษฐกิจ',
    title_en: 'Plant & Livestock Contest',
    image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    icon: 'Leaf',
    description_th: 'การประกวดพืชสวน พืชไร่ ผลไม้ และสัตว์เศรษฐกิจพันธุ์ดี เช่น โคเนื้อ โคนม ปลากัดสวยงาม และสัตว์เลี้ยง',
    description_en: 'Horticultural crops, fruits, and economic livestock contests including cattle, ornamental fish, and pets.',
    location_info: 'โซนฟาร์มพืชและสัตว์ทดลอง',
    time_info: '09:00 - 18:00 น.'
  },
  {
    id: 4,
    title_th: 'นิทรรศการผลงานวิจัยและนวัตกรรม',
    title_en: 'Research & Innovation Expo',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    icon: 'Microscope',
    description_th: 'นวัตกรรมทางวิทยาศาสตร์ การแพทย์ เทคโนโลยีชีวภาพ และผลิตภัณฑ์ต้นแบบพร้อมต่อยอดสู่เชิงพาณิชย์',
    description_en: 'Scientific innovations, biotechnology, and commercial-ready prototypes.',
    location_info: 'ห้องปฏิบัติการกลาง และโถงวิจัยวิทยาศาสตร์',
    time_info: '10:00 - 19:00 น.'
  }
];

export default function Home() {
  const [lang, setLang] = useState('TH');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);

  // ฟังก์ชันเปิดหน้ารายละเอียดแบบเต็มหน้า (แทน Pop-up)
  const openDetailPage = (item) => {
    setSelectedItem(item);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // แท็บวันที่ของไฮไลต์กำหนดการประกวด
  const [selectedDateLeft, setSelectedDateLeft] = useState('26 ก.พ.');
  const [selectedDateRight, setSelectedDateRight] = useState('26 ก.พ.');

  // กรองการ์ดตามคำค้นหา
  const filteredCards = EXHIBITION_CARDS.filter((item) =>
    item.title_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-screen-wrapper">
      {/* กรอบหน้าจอมือถือ (Mobile Container) */}
      <div className="home-mobile-container">
        
        {/* 1. Top Header Bar */}
        <header className="home-header">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/ku-logo.png"
              alt="มหาวิทยาลัยเกษตรศาสตร์"
              className="w-9 h-9 object-contain drop-shadow-xs shrink-0"
            />
            <span className="text-[13.5px] sm:text-[14.5px] font-semibold text-[#1a5336] tracking-tight leading-none truncate">
              มหาวิทยาลัยเกษตรศาสตร์
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* ปุ่มค้นหา */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer bg-white shadow-xs"
              title="ค้นหา"
            >
              {searchOpen ? <X size={16} /> : <Search size={16} />}
            </button>

            {/* ปุ่มสลับภาษา TH | EN */}
            <div className="flex items-center text-xs font-semibold border border-gray-200 rounded-full overflow-hidden bg-white shadow-xs">
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

            {/* ปุ่มแถบเมนู */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full bg-[#154c2e] hover:bg-[#0f3a22] border-2 border-[#c5a059] flex items-center justify-center text-amber-300 shadow-sm transition active:scale-95 cursor-pointer shrink-0"
              title="เมนูนำทาง"
            >
              {menuOpen ? <X size={16} /> : <MenuIcon size={16} />}
            </button>
          </div>
        </header>

        {/* ช่องค้นหา (แสดงเมื่อกดแว่นขยาย) */}
        {searchOpen && (
          <div className="bg-emerald-50/90 backdrop-blur-xs px-4 py-2.5 border-b border-emerald-100 z-20">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'TH' ? 'ค้นหานิทรรศการ, การประกวด...' : 'Search exhibitions, contests...'}
              className="w-full bg-white text-sm px-3.5 py-2 rounded-full border border-emerald-200 focus:outline-none focus:border-[#154c2e] shadow-xs"
              autoFocus
            />
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
              {/* Menu Drawer Header */}
              <div className="bg-[#154c2e] text-white p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <img src="/ku-logo.png" alt="KU" className="w-8 h-8 object-contain drop-shadow-xs" />
                  <div>
                    <h3 className="text-sm font-bold leading-tight">เกษตรแฟร์</h3>
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

              {/* Menu List */}
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
                    <div className="font-bold">{lang === 'TH' ? 'หน้าแรก' : 'Home'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">หน้าหลักของงาน</div>
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
                    <div className="text-[10px] text-gray-400 font-normal">ผังมหาวิทยาลัย</div>
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
                    <div className="text-[10px] text-gray-400 font-normal">ตารางประกวดและกิจกรรม</div>
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
                    <div className="text-[10px] text-gray-400 font-normal">ข้อมูลติดต่อและอื่นๆ</div>
                  </div>
                </button>
              </div>

              {/* Menu Drawer Footer */}
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center text-[11px] text-gray-400">
                มหาวิทยาลัยเกษตรศาสตร์
              </div>
            </div>
          </div>
        )}

        {/* เนื้อหาหลัก */}
        <main className="px-3 sm:px-4 py-3 space-y-5 flex-1">
          {activeTab === 'map' ? (
            /* หน้าแผนผังงาน */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#154c2e]">
                    {lang === 'TH' ? 'แผนผังงานเกษตรแฟร์' : 'KASET 4 FAIR Event Map'}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์ 72 พรรษาบรมราชินีนาถ' : 'Kasetsart University'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs text-[#154c2e] font-semibold bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200"
                >
                  {lang === 'TH' ? '← หน้าแรก' : '← Home'}
                </button>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                <div className="relative overflow-auto max-h-[65vh] bg-emerald-950 flex items-center justify-center">
                  <img
                    src="/kaset-map.jpg"
                    alt="KASET 4 FAIR Map"
                    className="w-full h-auto object-contain cursor-zoom-in hover:opacity-95 transition"
                    onClick={() => window.open('/kaset-map.jpg', '_blank')}
                  />
                </div>
                <div className="p-3 bg-emerald-50 text-xs text-[#154c2e] flex items-center justify-between">
                  <span className="text-[11px]">💡 คลิกที่รูปเพื่อดูรายละเอียดรหัสอาคาร</span>
                  <a
                    href="/kaset-map.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#154c2e] text-white px-3 py-1 rounded-lg font-semibold text-[11px] shadow-xs hover:bg-[#0f3a22] transition"
                  >
                    {lang === 'TH' ? 'เปิดเต็มจอ' : 'Full Screen'}
                  </a>
                </div>
              </div>
            </div>
          ) : activeTab === 'detail' && selectedItem ? (
            /* หน้ารายละเอียดแบบเต็มหน้าจอ (เหมือนหน้าแผนที่) */
            <div className="space-y-4 animate-fade-in pb-4">
              {/* แถบปุ่มย้อนกลับด้านบน */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedItem(null);
                  }}
                  className="text-xs text-[#154c2e] font-semibold bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 shrink-0"
                >
                  {lang === 'TH' ? '← หน้าแรก' : '← Home'}
                </button>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  {lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibition & Contest'}
                </span>
              </div>

              {/* การ์ดเนื้อหาเต็มหน้าจอ */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                <div className="h-52 sm:h-56 overflow-hidden bg-gray-100">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title_th}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[#154c2e] leading-snug">
                    {lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                  </h2>

                  {/* กล่องแสดงสถานที่และเวลา */}
                  {(selectedItem.location_info || selectedItem.time_info) && (
                    <div className="space-y-2 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 text-xs">
                      {selectedItem.location_info && (
                        <div className="flex items-start gap-2 text-[#154c2e]">
                          <MapPin size={16} className="shrink-0 mt-0.5 text-amber-600" />
                          <span>
                            <strong>{lang === 'TH' ? 'สถานที่จัดงาน:' : 'Location:'}</strong> {selectedItem.location_info}
                          </span>
                        </div>
                      )}
                      {selectedItem.time_info && (
                        <div className="flex items-start gap-2 text-[#154c2e]">
                          <Calendar size={16} className="shrink-0 mt-0.5 text-amber-600" />
                          <span>
                            <strong>{lang === 'TH' ? 'เวลาเปิดเข้าชม:' : 'Time:'}</strong> {selectedItem.time_info}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* คำอธิบายรายละเอียด */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-gray-800">
                      {lang === 'TH' ? 'รายละเอียดกิจกรรม' : 'Details'}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {lang === 'TH' ? selectedItem.description_th : selectedItem.description_en}
                    </p>
                  </div>

                  {/* ปุ่มดำเนินการด้านล่าง */}
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setActiveTab('map')}
                      className="flex-1 bg-[#e5b822] hover:bg-[#d4a817] text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MapPin size={15} />
                      <span>{lang === 'TH' ? 'ดูจุดจัดงานบนแผนที่' : 'View on Map'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('home');
                        setSelectedItem(null);
                      }}
                      className="flex-1 bg-[#154c2e] hover:bg-[#0f3a22] text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                    >
                      {lang === 'TH' ? 'กลับหน้าแรก' : 'Back to Home'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 2. Hero Section: โลโก้กลมด้านซ้าย + ข้อความด้านขวา + 2 ปุ่มด้านล่าง */}
              <section className="pt-2 pb-1 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[360px]">
                  {/* โลโก้รูปวงกลม */}
                  <img
                    src="/emblem.png?v=2"
                    alt="KASET 4 FAIR Emblem"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain shrink-0 mix-blend-multiply drop-shadow-none"
                  />

                  {/* ข้อความด้านขวา */}
                  <div className="text-left">
                    <p className="text-[#154c2e] font-semibold text-xs mb-0.5">
                      {lang === 'TH' ? 'ขอเชิญเที่ยวงาน' : 'Welcome to'}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#154c2e] tracking-tight leading-tight">
                      {lang === 'TH' ? (
                        <>เกษตร <span className="text-amber-500">4</span> แฟร์</>
                      ) : (
                        <>KASET <span className="text-amber-500">4</span> FAIR</>
                      )}
                    </h1>
                    <p className="text-[#154c2e] font-bold text-xs sm:text-sm mt-0.5">
                      {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์' : 'Kasetsart University'}
                    </p>
                  </div>
                </div>

                {/* 2 ปุ่ม Action ใต้ฮีโร่ */}
                <div className="flex items-center gap-2 sm:gap-3 w-full justify-center mt-4 sm:mt-5 px-1">
                  <a
                    href="#exhibitions"
                    className="btn-banner-green whitespace-nowrap text-[11px] sm:text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 shrink-0"
                  >
                    <span>{lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibitions & Contests'}</span>
                    <ChevronRight size={14} className="shrink-0" />
                  </a>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="btn-banner-yellow whitespace-nowrap text-[11px] sm:text-xs px-3.5 sm:px-4 py-2 sm:py-2.5 shrink-0"
                  >
                    <MapPin size={14} className="shrink-0" />
                    <span>{lang === 'TH' ? 'แผนที่การจัดงาน' : 'Event Map'}</span>
                    <ChevronRight size={14} className="shrink-0" />
                  </button>
                </div>
              </section>

              {/* 3. ส่วนการ์ด 4 ใบ (2x2): นิทรรศการและการประกวด */}
              <section id="exhibitions" className="pt-2">
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <h2 className="text-base font-bold text-[#154c2e]">
                    {lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibitions & Contests'}
                  </h2>
                  <button
                    onClick={() => { setActiveTab('activities'); setMenuOpen(true); }}
                    className="text-xs text-gray-500 flex items-center hover:text-[#154c2e] cursor-pointer"
                  >
                    <span>{lang === 'TH' ? 'ดูทั้งหมด' : 'View All'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
                  {filteredCards.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openDetailPage(item)}
                      className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col home-card-hover cursor-pointer"
                    >
                      <div className="relative h-28 sm:h-32 overflow-hidden bg-gray-100">
                        <img
                          src={item.image_url}
                          alt={item.title_th}
                          className="w-full h-full object-cover home-card-img-zoom"
                        />
                        {/* ไอคอนกลมที่มุมล่างซ้ายของการ์ด */}
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

              {/* 4. ส่วนไฮไลต์กำหนดการประกวด (Schedule / Timetable) */}
              <section className="pt-2">
                <h2 className="text-base font-bold text-[#154c2e] mb-3 px-0.5">
                  {lang === 'TH' ? 'ไฮไลต์กำหนดการประกวด' : 'Contest Highlights'}
                </h2>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {/* การ์ดซ้าย (การประกวดกล้วยไม้) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {['25 ก.พ.', '26 ก.พ.', '27 ก.พ.'].map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDateLeft(date)}
                          className={`flex-1 py-1 text-[10px] sm:text-[11px] font-semibold rounded-full transition cursor-pointer text-center ${
                            selectedDateLeft === date
                              ? 'bg-[#c5a059] text-white shadow-xs'
                              : 'bg-[#154c2e] text-white hover:bg-[#0f3a22]'
                          }`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[145px]">
                      <div>
                        <div className="text-[11px] text-gray-700 font-semibold">{selectedDateLeft}, 10:00น.</div>
                        <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">การประกวดกล้วยไม้</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">ณ ลานกิจกรรม</p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => alert('เปิดรับลงทะเบียน ณ จุดจัดงาน')}
                          className="flex-1 bg-[#154c2e] hover:bg-[#0f3a22] text-white text-[10px] font-semibold py-1.5 rounded-full text-center transition cursor-pointer shadow-2xs"
                        >
                          ลงทะเบียน
                        </button>
                        <button
                          onClick={() => openDetailPage(EXHIBITION_CARDS[0])}
                          className="flex-1 border border-[#c5a059] text-[#c5a059] hover:bg-amber-50 text-[10px] font-semibold py-1.5 rounded-full text-center transition cursor-pointer bg-white"
                        >
                          รายละเอียด
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* การ์ดขวา (การประกวดคลิปนวัตกรรม) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1">
                      {['25 ก.พ.', '26 ก.พ.', '27 ก.พ.'].map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDateRight(date)}
                          className={`flex-1 py-1 text-[10px] sm:text-[11px] font-semibold rounded-full transition cursor-pointer text-center ${
                            selectedDateRight === date
                              ? 'bg-[#c5a059] text-white shadow-xs'
                              : 'bg-[#154c2e] text-white hover:bg-[#0f3a22]'
                          }`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[145px]">
                      <div>
                        <div className="text-[11px] text-gray-700 font-semibold">{selectedDateRight}, 11:00น.</div>
                        <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">การประกวดคลิปนวัตกรรม</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">ห้องประชุม 1</p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => alert('เปิดรับลงทะเบียน ณ จุดจัดงาน')}
                          className="flex-1 bg-[#154c2e] hover:bg-[#0f3a22] text-white text-[10px] font-semibold py-1.5 rounded-full text-center transition cursor-pointer shadow-2xs"
                        >
                          ลงทะเบียน
                        </button>
                        <button
                          onClick={() => openDetailPage(EXHIBITION_CARDS[1])}
                          className="flex-1 border border-[#c5a059] text-[#c5a059] hover:bg-amber-50 text-[10px] font-semibold py-1.5 rounded-full text-center transition cursor-pointer bg-white"
                        >
                          รายละเอียด
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. ส่วนจุดสำคัญในงาน & การเดินทาง */}
              <section className="pt-2">
                <div
                  onClick={() => setActiveTab('map')}
                  className="bg-white rounded-2xl p-3 shadow-xs border border-gray-100 flex items-center justify-between gap-2.5 cursor-pointer hover:shadow-md transition"
                >
                  <div className="shrink-0">
                    <div className="text-xs font-bold text-gray-900 leading-tight">จุดสำคัญในงาน</div>
                    <div className="text-xs font-bold text-gray-900 leading-tight">& การเดินทาง</div>
                  </div>

                  <div className="w-20 h-13 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img
                      src="/kaset-map.jpg"
                      alt="Map Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-[11px] font-semibold text-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-800 hover:text-[#154c2e]">
                      <Bus size={14} className="text-[#154c2e] shrink-0" />
                      <span className="line-clamp-1">แผนที่งาน เกษตรแฟร์</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-800 hover:text-[#154c2e]">
                      <Train size={14} className="text-[#154c2e] shrink-0" />
                      <span className="line-clamp-1">วิธีการเดินทาง...</span>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>

        {/* 6. Footer สีเขียวเข้ม มก. */}
        <footer className="bg-[#154c2e] text-white p-4 mt-6">
          <div className="flex items-center gap-3.5">
            <img
              src="/ku-logo.png"
              alt="KU Logo"
              className="w-14 h-14 object-contain drop-shadow-md shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="text-sm font-bold text-[#facc15] leading-tight">มหาวิทยาลัยเกษตรศาสตร์</h4>
              <p className="text-[10.5px] text-white/85 leading-snug">
                มหาวิทยาลัยเกษตรศาสตร์ 50 ปี, ลานกิจกรรม 10, มหาวิทยาลัยเกษตรศาสตร์
              </p>
              <p className="text-[10px] text-white/70">
                ติดต่อ: แผนกกิจกรรมนิสิต | 095-237-6555
              </p>
              <p className="text-[9px] text-white/50 pt-0.5">
                © Copyright Kasetsart University | Kaset4fair
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}