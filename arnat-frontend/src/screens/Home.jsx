import React, { useState, useEffect } from 'react';
import '../screens_css/Home.css';
import {
  Search,
  MapPin,
  ChevronRight,
  Music,
  ShoppingBag,
  Home as HomeIcon,
  Calendar,
  MoreHorizontal,
  Menu as MenuIcon,
  X
} from 'lucide-react';

// ข้อมูลเริ่มต้นสำหรับแสดงผลเสมอ (ป้องกันปัญหาเปิดบนมือถือแล้วการ์ดหาย)
const DEFAULT_DATA = {
  highlights: [
    {
      id: 1,
      type: 'highlight',
      title_th: 'นิทรรศการเกษตรและนวัตกรรม',
      title_en: 'Agri & Innovation Exhibition',
      image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
      description_th: 'จัดแสดงผลงานวิจัยและนวัตกรรมทางการเกษตรอัจฉริยะ (Smart Farming) โดรนเพื่อการเกษตร และพันธุ์พืชปรับปรุงใหม่จากคณะต่างๆ ของ มก.',
      location_info: 'อาคารจักรพันธ์เพ็ญศิริ และลานนิทรรศการกลาง',
      time_info: '09:00 - 20:00 น.'
    },
    {
      id: 2,
      type: 'highlight',
      title_th: 'การประกวดโปสเตอร์และคลิปวิดีโอ',
      title_en: 'Poster & Video Contest',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      description_th: 'การประกวดผลงานทางวิชาการ โปสเตอร์วิจัย และการประกวดคลิปสั้นสร้างสรรค์การเกษตร',
      location_info: 'อาคารสารนิเทศ 50 ปี',
      time_info: '08:30 - 18:00 น.'
    }
  ],
  menus: [
    {
      id: 3,
      type: 'menu',
      title_th: 'การแสดงเวทีกลาง',
      title_en: 'Main Stage Shows',
      icon_name: 'Music',
      image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80',
      description_th: 'ชมการแสดงดนตรีโฟล์คซอง วงดนตรีลูกทุ่งชมรมนิสิต ศิลปวัฒนธรรมพื้นบ้าน และการแสดงพิเศษทุกค่ำคืน',
      location_info: 'เวทีกลาง ลานหน้าอาคารเทพศาสตร์สถิตย์',
      time_info: '17:00 - 22:00 น.'
    },
    {
      id: 4,
      type: 'menu',
      title_th: 'ร้านค้าและโซนช้อปปิ้ง',
      title_en: 'Shops & Shopping Zone',
      icon_name: 'ShoppingBag',
      image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=500&q=80',
      description_th: 'รวบรวมร้านค้านิสิต ผลิตภัณฑ์แปรรูปทางการเกษตร อาหารขึ้นชื่อ OTOP และสินค้าชุมชนกว่า 1,000 ร้านค้า',
      location_info: 'โซน A - G ตลอดแนวถนนสายหลัก',
      time_info: '10:00 - 22:00 น.'
    }
  ]
};

export default function Home() {
  const [lang, setLang] = useState('TH');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);

  // กำหนดค่าเริ่มต้นเป็นการ์ด 4 ใบเสมอ
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลอัปเดตจาก Backend (ถ้าต่อ Backend ได้จะดึงข้อมูลสด ถ้าต่อไม่ได้จะใช้ข้อมูลชุดเริ่มต้น)
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await fetch(`/api/home?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.highlights?.length || json.menus?.length) {
            setData(json);
          }
        }
      } catch {
        // ใช้ DEFAULT_DATA ที่มีอยู่แล้ว ไม่เกิด Error หน้าขาว
      }
    };
    fetchHomeData();
  }, [searchQuery]);

  // รวมรายการการ์ดทั้ง 4 ใบ: 2 ไฮไลต์ (นิทรรศการ, ประกวด) + 2 เมนู (เวทีกลาง, ร้านค้า)
  const displayCards = [
    ...(data.highlights || []).slice(0, 2),
    ...(data.menus || []).slice(0, 2)
  ];

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

            {/* ปุ่มแถบเมนู (สีเขียวเข้มขอบทอง ป้ายเด่นชัด ไม่หลุดธีม มก.) */}
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
              placeholder={lang === 'TH' ? 'ค้นหานิทรรศการ, ร้านค้า, การแสดง...' : 'Search exhibitions, shops, shows...'}
              className="w-full bg-white text-sm px-3.5 py-2 rounded-full border border-emerald-200 focus:outline-none focus:border-[#154c2e] shadow-xs"
              autoFocus
            />
          </div>
        )}

        {/* Side Drawer เมนูเลื่อนสไลด์ออกมาจากด้านข้างขวาแบบสมูทและรวดเร็ว */}
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
                  onClick={() => { setActiveTab('home'); setMenuOpen(false); }}
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
                  onClick={() => { setActiveTab('map'); setMenuOpen(false); }}
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
                  onClick={() => { setActiveTab('activities'); setMenuOpen(false); }}
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
                  onClick={() => { setActiveTab('more'); setMenuOpen(false); }}
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
        <main className="px-3 sm:px-4 py-3 space-y-4 flex-1">
          {activeTab === 'map' ? (
            /* หน้าแผนผังงาน */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#154c2e]">
                    {lang === 'TH' ? 'แผนผังงานเกษตรแฟร์' : 'Kaset Fair Event Map'}
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
                    alt="Kaset Fair Map"
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
          ) : (
            <>
              {/* 2. Hero Section: โลโก้กลมด้านซ้าย + ข้อความด้านขวา + 2 ปุ่มด้านล่าง */}
              <section className="pt-2 pb-1 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[360px]">
                  {/* โลโก้รูปวงกลม (ข้าว วัว ปลา) */}
                  <img
                    src="/emblem.png?v=2"
                    alt="Kaset Fair Emblem"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain shrink-0 mix-blend-multiply drop-shadow-none"
                  />

                  {/* ข้อความด้านขวา */}
                  <div className="text-left">
                    <p className="text-[#154c2e] font-semibold text-xs mb-0.5">
                      {lang === 'TH' ? 'ขอเชิญเที่ยวงาน' : 'Welcome to'}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#154c2e] tracking-tight leading-tight">
                      {lang === 'TH' ? 'เกษตรแฟร์' : 'KASET FAIR'}
                    </h1>
                    <p className="text-[#154c2e] font-bold text-xs sm:text-sm mt-0.5">
                      {lang === 'TH' ? 'มหาวิทยาลัยเกษตรศาสตร์' : 'Kasetsart University'}
                    </p>
                  </div>
                </div>

                {/* 2 ปุ่ม Action ใต้ฮีโร่ (ปรับ whitespace-nowrap ให้ตัวหนังสือไม่ตกบรรทัด) */}
                <div className="flex items-center gap-2 sm:gap-3 w-full justify-center mt-4 sm:mt-5 px-1">
                  <a
                    href="#exhibitions"
                    className="btn-banner-green whitespace-nowrap text-[11px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 shrink-0"
                  >
                    <span>{lang === 'TH' ? 'นิทรรศการและการประกวด' : 'Exhibitions & Contests'}</span>
                    <ChevronRight size={14} className="shrink-0" />
                  </a>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="btn-banner-yellow whitespace-nowrap text-[11px] sm:text-xs px-3 sm:px-4 py-2 sm:py-2.5 shrink-0"
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
                  {displayCards.map((item, index) => {
                    const hasIcon = item.icon_name && (item.icon_name === 'Music' || item.icon_name === 'ShoppingBag');
                    return (
                      <div
                        key={item.id || index}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col home-card-hover cursor-pointer"
                      >
                        <div className="relative h-28 sm:h-32 overflow-hidden bg-gray-100">
                          <img
                            src={item.image_url}
                            alt={item.title_th}
                            className="w-full h-full object-cover home-card-img-zoom"
                          />
                          {/* ไอคอนกลมที่มุมล่างซ้ายของการ์ดเวทีกลางและร้านค้า */}
                          {hasIcon && (
                            <div className="absolute bottom-2 left-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-[#154c2e]">
                              {item.icon_name === 'Music' && <Music size={14} />}
                              {item.icon_name === 'ShoppingBag' && <ShoppingBag size={14} />}
                            </div>
                          )}
                        </div>
                        <div className="p-2 sm:p-2.5 text-center flex-1 flex items-center justify-center min-h-[46px] bg-white">
                          <span className="text-[11.5px] sm:text-[12px] font-bold text-gray-800 leading-tight line-clamp-1">
                            {lang === 'TH' ? item.title_th : item.title_en}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </main>

        {/* Modal แสดงรายละเอียดเมื่อกดการ์ด */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-[380px] w-full overflow-hidden shadow-2xl animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 bg-gray-100">
                <img src={selectedItem.image_url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#154c2e]">
                  {lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                </h3>

                {/* แสดงป้ายสถานที่และเวลา */}
                {(selectedItem.location_info || selectedItem.time_info) && (
                  <div className="mt-3 space-y-1.5 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-xs">
                    {selectedItem.location_info && (
                      <div className="flex items-start gap-2 text-[#154c2e]">
                        <MapPin size={15} className="shrink-0 mt-0.5 text-amber-600" />
                        <span><strong>สถานที่:</strong> {selectedItem.location_info}</span>
                      </div>
                    )}
                    {selectedItem.time_info && (
                      <div className="flex items-start gap-2 text-[#154c2e]">
                        <Calendar size={15} className="shrink-0 mt-0.5 text-amber-600" />
                        <span><strong>เวลา:</strong> {selectedItem.time_info}</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  {lang === 'TH'
                    ? (selectedItem.description_th || selectedItem.content_th)
                    : (selectedItem.description_en || selectedItem.content_en)}
                </p>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="mt-4 w-full bg-[#154c2e] hover:bg-[#0f3a22] text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                >
                  {lang === 'TH' ? 'ปิดหน้าต่าง' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
