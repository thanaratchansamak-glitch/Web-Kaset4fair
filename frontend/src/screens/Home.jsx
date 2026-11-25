import React, { useState, useEffect, useRef } from 'react';
import '../screens_css/Home.css';
import { ALL_EVENTS, BANNER_EVENT, OPEN_HOUSE_EVENT, EXHIBITION_DETAIL_EVENT } from '../data/eventsData';
import { RECOMMENDED_SHOPS, ALL_STUDENT_SHOPS } from '../data/recommendedShops';
import { SPONSORS } from '../data/sponsorsData';
import InteractiveMap from '../components/InteractiveMap';
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

const assetUrl = (p) => (p && p.startsWith('/') ? `${import.meta.env.BASE_URL}${p.slice(1)}` : p);

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

  // ดึงข้อมูลจาก Backend SQLite (รองรับทั้ง dev proxy และ reverse proxy /kasetfair/)
  useEffect(() => {
    const apiBase = window.location.pathname.startsWith('/kasetfair')
      ? '/kasetfair/api'
      : '/api';
    const backendUrl = `${apiBase}/exhibitions`;

    fetch(backendUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          console.log('✅ โหลดข้อมูลจาก SQLite สำเร็จ:', data);
          setCardsData(data.filter((item) => item.id !== 12 && item.id !== 14));
        }
      })
      .catch((err) => {
        console.warn('⚠️ ไม่สามารถเชื่อมต่อ Backend SQLite ได้ (จะใช้ข้อมูลสำรองในเว็บแทน):', err.message);
      });
  }, []);
  // โหมดทดสอบ: แสดงปุ่มสลับ PC / Mobile เมื่อรันใน Dev Server (localhost:5173) หรือเปิดด้วย ?preview=1
  const isTestMode =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1');

  // แสดงผลอัตโนมัติตามขนาดหน้าจอ: >= 768px (PC, Notebook, iPad/Tablet) = 'desktop', มือถือ (< 768px) = 'mobile'
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 'desktop' : 'mobile'
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const updateViewMode = (e) => setViewMode(e.matches ? 'desktop' : 'mobile');
    setViewMode(mq.matches ? 'desktop' : 'mobile');
    mq.addEventListener('change', updateViewMode);
    return () => mq.removeEventListener('change', updateViewMode);
  }, []);

  // State สำหรับสไลด์เลื่อนรูปภาพนิทรรศการและการประกวดอัตโนมัติ
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTouchStartX = useRef(null);
  const shopScrollRef = useRef(null);
  const shopDragState = useRef({ down: false, startX: 0, scrollLeft: 0, moved: false });
  // State สำหรับสไลด์แบนเนอร์หลักด้านบน (สลับภาพอัตโนมัติ)
  const [currentBanner, setCurrentBanner] = useState(0);
  // State สำหรับ Lightbox ดูภาพโปสเตอร์ร้านค้านิสิตแบบเต็มจอ
  const [selectedShopIdx, setSelectedShopIdx] = useState(null);
  // State สำหรับขยายดูโลโก้ผู้สนับสนุน
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  const heroBanners = [
    {
      src: '/events/banner-bg.jpg',
      alt: 'แบนเนอร์ศิลปินและตารางการแสดง เกษตรแฟร์ นนทรีอีสาน',
      hintTh: 'คลิกดูรายละเอียดศิลปิน & ตารางงาน',
      hintEn: 'Click to view artists & schedule',
      onClick: () => openDetailPage(BANNER_EVENT),
    },
    {
      src: '/events/banner-student-zone.jpg',
      alt: 'ขอเชิญชวนอุดหนุนร้านค้า โซนร้านค้านิสิต งานเกษตรแฟร์นนทรีอีสาน ครั้งที่ 20',
      hintTh: 'คลิกดูร้านค้านิสิตทั้งหมด',
      hintEn: 'Click to view all student shops',
      onClick: () => setActiveTab('shop'),
    },
    {
      src: '/events/openhouse-2026.jpg',
      alt: 'OPEN HOUSE KU.CSC 2026: ONE KU ALL PATHS',
      hintTh: 'คลิกดูรายละเอียด OPEN HOUSE 2026',
      hintEn: 'Click to view OPEN HOUSE 2026 details',
      onClick: () => openDetailPage(OPEN_HOUSE_EVENT),
    },
  ];

  // ตั้งเวลาสลับภาพแบนเนอร์หลักอัตโนมัติทุกๆ 4.5 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroBanners.length]);



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

  // ค้นหาเฉพาะ ร้านค้านิสิต และ กิจกรรม/นิทรรศการ/การประกวด
  const q = searchQuery.trim().toLowerCase();
  const searchResults = q
    ? [
        ...ALL_STUDENT_SHOPS.filter((s) =>
          [s.name_th, s.name_en, s.desc_th, s.desc_en, s.tag_th, s.tag_en]
            .filter(Boolean)
            .some((t) => String(t).toLowerCase().includes(q))
        )
          .slice(0, 8)
          .map((s) => ({
            key: `sh-${s.id}`,
            badge: lang === 'TH' ? 'ร้านค้า' : 'Shop',
            badgeCls: 'bg-pink-100 text-pink-700',
            title: lang === 'TH' ? s.name_th : s.name_en,
            sub: lang === 'TH' ? s.desc_th : s.desc_en,
            onSelect: () => {
              const idx = ALL_STUDENT_SHOPS.findIndex((x) => x.id === s.id);
              setSearchOpen(false);
              setSearchQuery('');
              setActiveTab('shop');
              if (idx >= 0) setSelectedShopIdx(idx);
            },
          })),
        ...[BANNER_EVENT, OPEN_HOUSE_EVENT, EXHIBITION_DETAIL_EVENT, ...cardsData]
          .filter((item) =>
            [item.title_th, item.title_en, item.location_info_th, item.location_info_en, item.detail_th, item.detail_en]
              .filter(Boolean)
              .some((t) => String(t).toLowerCase().includes(q))
          )
          .slice(0, 8)
          .map((item) => ({
            key: `ev-${item.id}`,
            badge: lang === 'TH' ? 'กิจกรรม' : 'Event',
            badgeCls: 'bg-emerald-100 text-[#154c2e]',
            title: lang === 'TH' ? item.title_th : item.title_en,
            sub: lang === 'TH' ? item.location_info_th : item.location_info_en,
            onSelect: () => {
              setSearchOpen(false);
              setSearchQuery('');
              openDetailPage(item);
            },
          })),
      ]
    : [];

  return (
    <div className={`home-screen-wrapper view-${viewMode}`}>
      {/* ปุ่มสลับ PC / Mobile แสดงเฉพาะในโหมดทดสอบ (Dev Server หรือ ?preview=1) */}
      {isTestMode && (
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
      )}

      <div className={`home-mobile-container view-${viewMode}`}>

        {/* =====================
            1. Top Header Bar (Desktop & Mobile)
            ===================== */}
        <header className={`home-header view-${viewMode}`}>
          {/* ฝั่งซ้าย: ตราสัญลักษณ์เกษตรแฟร์ นนทรีอีสาน และข้อความเกษตรแฟร์ นนทรีอีสาน */}
          <div
            className="flex items-center gap-2.5 min-w-0 shrink-0 cursor-pointer group"
            onClick={() => { setActiveTab('home'); setSelectedItem(null); }}
          >
            <div className="relative">
              <img
                src={assetUrl('/emblem-pure.png')}
                alt="เกษตรแฟร์ นนทรีอีสาน"
                className="w-10 h-10 md:w-11 md:h-11 object-contain drop-shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[14.5px] sm:text-[15.5px] md:text-[17.5px] font-bold tracking-normal leading-tight text-[#154c2e] truncate">
                {lang === 'TH' ? (
                  <>เกษตรแฟร์ <span className="text-[#b45309] font-bold">นนทรีอีสาน</span></>
                ) : (
                  <>Kaset Fair <span className="text-[#b45309] font-bold">Nontri Isan</span></>
                )}
              </span>
              <span className="text-[10px] sm:text-[10.5px] md:text-[11px] font-medium text-[#154c2e]/75">
                {lang === 'TH' ? 'ครั้งที่ 20 · มก. ฉกส.' : '20th · KU CSC'}
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
                {lang === 'TH' ? 'กิจกรรม/ประกวด' : 'Activities'}
              </button>
              <button
                onClick={() => openDetailPage(EXHIBITION_DETAIL_EVENT)}
                className={`pc-nav-item ${activeTab === 'detail' && selectedItem?.id === 14 ? 'active' : ''}`}
              >
                {lang === 'TH' ? 'นิทรรศการ' : 'Exhibition'}
              </button>
              <button
                onClick={() => {
                  const conf = cardsData.find(c => c.id === 10 || c.title_th?.includes('ประชุมวิชาการ')) || cardsData[cardsData.length - 1];
                  openDetailPage(conf);
                }}
                className={`pc-nav-item ${activeTab === 'detail' && selectedItem?.id === 10 ? 'active' : ''}`}
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
          <div className="bg-emerald-50/95 backdrop-blur-xs px-4 py-3 border-b border-emerald-100 z-30 shadow-sm">
            <div className="max-w-xl mx-auto space-y-2.5">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-emerald-700/70 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchOpen(false);
                    } else if (e.key === 'Enter' && searchResults.length > 0) {
                      searchResults[0].onSelect();
                    }
                  }}
                  placeholder={
                    lang === 'TH'
                      ? 'ค้นหาร้านค้า, กิจกรรม, การประกวด...'
                      : 'Search shops, activities, contests...'
                  }
                  className="w-full bg-white text-sm pl-10 pr-9 py-2 rounded-full border border-emerald-200 focus:outline-none focus:border-[#154c2e] shadow-xs"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* คำค้นหายอดนิยมเมื่อยังไม่ได้พิมพ์ */}
              {!q ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-gray-500 font-medium mr-0.5">
                    {lang === 'TH' ? 'แนะนำ:' : 'Try:'}
                  </span>
                  {(lang === 'TH'
                    ? ['หมูปิ้ง', 'บัวลอย', 'ข้าวซอย', 'ประกวด', 'นิทรรศการ']
                    : ['Grill', 'Cafe', 'Halal', 'Contest', 'Exhibition']
                  ).map((kw) => (
                    <button
                      key={kw}
                      onClick={() => setSearchQuery(kw)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-[#154c2e] hover:text-white text-[#154c2e] border border-emerald-200 transition cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="bg-white rounded-2xl border border-emerald-100 shadow-md max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {searchResults.map((res) => (
                    <button
                      key={res.key}
                      onClick={res.onSelect}
                      className="w-full px-3.5 py-2.5 flex items-start gap-2.5 text-left hover:bg-emerald-50/70 transition cursor-pointer"
                    >
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${res.badgeCls}`}>
                        {res.badge}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-900 line-clamp-1">{res.title}</div>
                        {res.sub && <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{res.sub}</div>}
                      </div>
                      <ChevronRight size={14} className="text-gray-400 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-emerald-100 px-4 py-3 text-center text-xs text-gray-500">
                  {lang === 'TH' ? `ไม่พบผลลัพธ์สำหรับ "${searchQuery}"` : `No results found for "${searchQuery}"`}
                </div>
              )}
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
                  <img src={assetUrl('/ku-logo.png')} alt="KU" className="w-8 h-8 object-contain drop-shadow-xs" />
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${activeTab === 'home'
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${activeTab === 'map'
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
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${activeTab === 'activities'
                    ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'activities' ? 'bg-[#154c2e] text-[#facc15]' : 'bg-emerald-100/60 text-[#154c2e]'}`}>
                    <Calendar size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'กิจกรรม/ประกวด' : 'Activities'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'ข่าวประชาสัมพันธ์และการประกวด' : 'News & Contests'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    openDetailPage(EXHIBITION_DETAIL_EVENT);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${activeTab === 'detail' && selectedItem?.id === 14
                    ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'detail' && selectedItem?.id === 14 ? 'bg-[#154c2e] text-[#facc15]' : 'bg-lime-100/70 text-lime-700'}`}>
                    <Sprout size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'นิทรรศการ' : 'Exhibition'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'รายละเอียดนิทรรศการ 14 จุด' : '14 Exhibition Points'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const conf = cardsData.find(c => c.id === 10 || c.title_th?.includes('ประชุมวิชาการ')) || cardsData[cardsData.length - 1];
                    openDetailPage(conf);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${activeTab === 'detail' && selectedItem?.id === 10
                    ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'detail' && selectedItem?.id === 10 ? 'bg-[#154c2e] text-[#facc15]' : 'bg-sky-100/70 text-sky-700'}`}>
                    <GraduationCap size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'ประชุมวิชาการ' : 'Conference'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'งานประชุมวิชาการระดับชาติ' : 'Academic Conference'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('shop'); setSelectedItem(null); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${activeTab === 'shop'
                    ? 'bg-emerald-50 text-[#154c2e] border border-emerald-300 shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeTab === 'shop' ? 'bg-[#154c2e] text-[#facc15]' : 'bg-orange-100/70 text-orange-700'}`}>
                    <ShoppingBag size={18} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{lang === 'TH' ? 'ร้านค้า' : 'Shop'}</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {lang === 'TH' ? 'โซนร้านค้าและอาหาร' : 'Shops & Food Zones'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('more'); setSelectedItem(null); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition menu-item-hover cursor-pointer ${activeTab === 'more'
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

        {/* =====================
            2. Hero Banner Section
            ===================== */}
        {activeTab === 'home' && (
          <div className="flex flex-col items-center w-full">
            {/* ส่วนแบนเนอร์หลัก (สลับภาพอัตโนมัติ + กดเลื่อนได้) */}
            <div className={`w-full ${viewMode === 'desktop' ? 'max-w-6xl px-2 sm:px-4 pt-2 md:pt-4' : 'px-0 pt-0'}`}>
              <section
                onClick={() => heroBanners[currentBanner]?.onClick()}
                className="relative w-full overflow-hidden rounded-none sm:rounded-2xl flex items-center justify-center bg-transparent cursor-pointer group"
                title={lang === 'TH' ? heroBanners[currentBanner]?.hintTh : heroBanners[currentBanner]?.hintEn}
              >
                {/* ภาพฐานสำหรับคงสัดส่วนความสูงไม่ให้กระตุกตอนสลับ */}
                <img
                  src={assetUrl(heroBanners[0].src)}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-auto max-h-[460px] object-contain block opacity-0 pointer-events-none select-none"
                />
                {heroBanners.map((b, idx) => (
                  <img
                    key={b.src}
                    src={assetUrl(b.src)}
                    alt={b.alt}
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
                      idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  />
                ))}

                {/* จุดบอกตำแหน่งแบนเนอร์ */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full">
                  {heroBanners.map((b, idx) => (
                    <button
                      key={b.src}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBanner(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentBanner ? 'w-5 bg-[#facc15]' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                      aria-label={`Banner ${idx + 1}`}
                    />
                  ))}
                </div>

                <span className="hidden sm:inline-block absolute bottom-2 right-2 z-20 bg-black/65 backdrop-blur-xs text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-medium shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
                  {lang === 'TH' ? heroBanners[currentBanner]?.hintTh : heroBanners[currentBanner]?.hintEn}
                </span>
              </section>
            </div>

            {/* ปุ่ม แผนที่การจัดงาน: อยู่ใต้แบนเนอร์ ไม่บังแบนเนอร์ศิลปิน */}
            <div className={`w-full flex items-center justify-center my-3 sm:my-4 ${viewMode === 'desktop' ? 'md:my-5' : 'my-3'} px-4`}>
              <button
                onClick={() => setActiveTab('map')}
                className={`btn-banner-yellow whitespace-nowrap text-[11px] sm:text-xs ${viewMode === 'desktop' ? 'md:text-sm md:px-8 md:py-3' : 'px-4 py-2.5'
                  } shrink-0 cursor-pointer shadow-md hover:scale-105 transition-transform duration-200`}
              >
                <MapPin size={16} className="shrink-0" />
                <span>{lang === 'TH' ? 'แผนที่การจัดงาน' : 'Event Map'}</span>
                <ChevronRight size={16} className="shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* =====================
            3. เนื้อหาหลัก (Main Content)
            ===================== */}
        <main className="flex-1">
          {activeTab === 'map' ? (
            /* หน้าแผนผังงานแบบ Interactive Leaflet (ใช้ข้อมูล Vector OSM ในตัว ไม่ติด API Key) */
            <div className={`px-3 sm:px-4 py-4 md:py-6 ${viewMode === 'desktop' ? 'max-w-6xl' : 'max-w-md'} mx-auto animate-fade-in`}>
              <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-4 sm:p-6 shadow-sm border border-emerald-100/70">
                <InteractiveMap
                  lang={lang}
                  assetUrl={assetUrl}
                  viewMode={viewMode}
                  onBackHome={() => setActiveTab('home')}
                />
              </div>
            </div>
          ) : activeTab === 'activities' ? (
            /* หน้ากิจกรรมทั้งหมด (การ์ด Grid สไตล์เดียวกับหน้าร้านค้า) */
            <div className={`px-3 sm:px-4 py-4 md:py-8 ${viewMode === 'desktop' ? 'max-w-6xl' : 'max-w-md'} mx-auto animate-fade-in`}>
              <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-emerald-100/70 space-y-6">
                <div className={`flex flex-col ${viewMode === 'desktop' ? 'md:flex-row md:items-center justify-between' : ''} gap-3 border-b border-gray-100 pb-4`}>
                  <div className="min-w-0">
                    <h2 className={`text-lg ${viewMode === 'desktop' ? 'md:text-3xl' : 'text-lg'} font-bold text-[#154c2e] tracking-tight flex items-center gap-2 leading-snug`}>
                      <Calendar size={viewMode === 'desktop' ? 26 : 20} className="shrink-0" />
                      <span>{lang === 'TH' ? 'ข่าวประชาสัมพันธ์และกิจกรรม' : 'News & Activities'}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                      {lang === 'TH'
                        ? `รวมนิทรรศการ กิจกรรม และการประกวดทั้งหมด ${cardsData.length} รายการ · แตะเพื่อดูรายละเอียด`
                        : `${cardsData.length} exhibitions, contests & events · Tap for full details`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('home')}
                      className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                    >
                      <span>←</span>
                      <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
                    </button>
                  </div>
                </div>

                {/* รายการกิจกรรมสไตล์การ์ด Grid เดียวกับหน้าร้านค้า */}
                <div
                  className={
                    viewMode === 'desktop'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 md:gap-5'
                      : 'grid grid-cols-2 gap-3'
                  }
                >
                  {cardsData.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => openDetailPage(item)}
                      className="bg-white rounded-2xl overflow-hidden border border-emerald-100/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
                    >
                      <div className="relative aspect-[3/4] bg-emerald-50/40 overflow-hidden">
                        <img
                          src={assetUrl(item.image_url)}
                          alt={lang === 'TH' ? item.title_th : item.title_en}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-2.5 sm:p-3 flex flex-col gap-1 flex-1 justify-between">
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#154c2e] transition line-clamp-2 leading-snug">
                          {lang === 'TH' ? item.title_th : item.title_en}
                        </h3>
                        <p className="text-[10.5px] sm:text-xs text-gray-500 line-clamp-1">
                          {lang === 'TH' ? item.location_info_th : item.location_info_en}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'detail' && selectedItem ? (
            /* หน้ารายละเอียดสไตล์บทความข่าวประชาสัมพันธ์ (หัวข้อใหญ่บนสุด -> โปสเตอร์เต็มใบ -> เนื้อหาอ่านง่าย) */
            <div className={`px-3 sm:px-4 py-4 md:py-8 ${viewMode === 'desktop' ? 'max-w-3xl' : 'max-w-md'} mx-auto space-y-4 animate-fade-in`}>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveTab('activities');
                    setSelectedItem(null);
                  }}
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-white/95 px-3.5 py-1.5 rounded-full hover:bg-emerald-50 transition cursor-pointer border border-emerald-200 shrink-0 whitespace-nowrap inline-flex items-center gap-1 shadow-2xs"
                >
                  <span>←</span>
                  <span>{lang === 'TH' ? 'กิจกรรมทั้งหมด' : 'All Activities'}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setSelectedItem(null);
                  }}
                  className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 shrink-0 whitespace-nowrap inline-flex items-center gap-1"
                >
                  <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
                </button>
              </div>

              <article className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm border border-emerald-100/70 space-y-6">
                {/* 1. หัวข้อใหญ่ด้านบนสุด */}
                <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#154c2e] leading-snug tracking-tight">
                  {lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                </h1>

                {/* 2. รูปโปสเตอร์เต็มใบ */}
                <div className="w-full overflow-hidden rounded-xl bg-white border border-gray-100">
                  <img
                    src={assetUrl(selectedItem.image_url)}
                    alt={lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                    className="w-full h-auto object-contain block"
                  />
                </div>

                {/* 3. หัวข้อย่อยสีเขียว + เนื้อหาบทความอ่านง่าย */}
                <div className="space-y-4 pt-1">
                  <h2 className="text-lg sm:text-xl font-bold text-emerald-600 leading-snug">
                    {lang === 'TH' ? selectedItem.title_th : selectedItem.title_en}
                  </h2>

                  <div className="text-[15px] sm:text-base text-gray-800 leading-relaxed whitespace-pre-line">
                    {lang === 'TH' ? selectedItem.description_th : selectedItem.description_en}
                  </div>
                </div>

                {/* 4. สรุปกำหนดการและสถานที่ด้านล่าง */}
                <div className="pt-5 border-t border-gray-100 space-y-2.5 text-[15px] sm:text-base text-gray-800">
                  <h3 className="font-bold text-emerald-600 flex items-center gap-2">
                    <span>📌</span>
                    <span>{lang === 'TH' ? 'กำหนดการและสถานที่จัดงาน' : 'Schedule & Venue'}</span>
                  </h3>
                  <ul className="space-y-1.5 pl-1">
                    <li>
                      • <strong>{lang === 'TH' ? 'วันและเวลา:' : 'Date & Time:'}</strong>{' '}
                      {lang === 'TH' ? selectedItem.time_info_th : selectedItem.time_info_en}
                    </li>
                    <li>
                      • <strong>{lang === 'TH' ? 'สถานที่:' : 'Location:'}</strong>{' '}
                      {lang === 'TH' ? selectedItem.location_info_th : selectedItem.location_info_en}
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          ) : activeTab === 'shop' ? (
            /* หน้าร้านค้า: รวมโปสเตอร์ร้านค้านิสิตทั้งหมด (ไม่มีภาพแผนที่แล้ว) */
            <div className={`px-3 sm:px-4 py-4 md:py-8 ${viewMode === 'desktop' ? 'max-w-6xl' : 'max-w-md'} mx-auto space-y-5 animate-fade-in`}>
              <div className="bg-white/95 backdrop-blur-xs rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-emerald-100/70 space-y-6">
                <div className={`flex flex-col ${viewMode === 'desktop' ? 'md:flex-row md:items-center justify-between' : ''} gap-3 border-b border-gray-100 pb-4`}>
                  <div className="min-w-0">
                    <h2 className={`text-lg ${viewMode === 'desktop' ? 'md:text-3xl' : 'text-lg'} font-bold text-[#154c2e] flex items-center gap-2 leading-snug`}>
                      <ShoppingBag size={viewMode === 'desktop' ? 26 : 20} className="shrink-0" />
                      <span>{lang === 'TH' ? 'ร้านค้านิสิต & ของอร่อยในงาน' : 'Student Shops & Fair Food'}</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
                      {lang === 'TH'
                        ? `รวมร้านค้าผู้ประกอบการหน้าใหม่วัยใส ${ALL_STUDENT_SHOPS.length} ร้าน · แตะที่ภาพเพื่อขยายดูเมนูและราคา`
                        : `${ALL_STUDENT_SHOPS.length} student shops · Tap any poster to zoom in`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setActiveTab('home')}
                      className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                    >
                      <span>←</span>
                      <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
                    </button>
                  </div>
                </div>

                {/* แกลเลอรีโปสเตอร์ร้านค้านิสิตทั้งหมด 31 ร้าน */}
                <div
                  className={
                    viewMode === 'desktop'
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 md:gap-5'
                      : 'grid grid-cols-2 gap-3'
                  }
                >
                  {ALL_STUDENT_SHOPS.map((shop, idx) => (
                    <div
                      key={shop.id}
                      onClick={() => setSelectedShopIdx(idx)}
                      className="bg-white rounded-2xl overflow-hidden border border-emerald-100/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-1"
                    >
                      <div className="relative aspect-[3/4] bg-emerald-50/40 overflow-hidden">
                        <img
                          src={assetUrl(shop.image)}
                          alt={lang === 'TH' ? shop.name_th : shop.name_en}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1">
                        <div className="text-[10px] font-semibold text-emerald-700 line-clamp-1">
                          {lang === 'TH' ? shop.tag_th : shop.tag_en}
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#154c2e] transition line-clamp-1">
                          {lang === 'TH' ? shop.name_th : shop.name_en}
                        </h3>
                        <p className="text-[10.5px] sm:text-xs text-gray-500 line-clamp-2 leading-snug">
                          {lang === 'TH' ? shop.desc_th : shop.desc_en}
                        </p>
                      </div>
                    </div>
                  ))}
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
                            src={assetUrl(item.image_url)}
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

                {/* บน Mobile (หรือหน้าจอเล็ก): สไลเดอร์ภาพเลื่อนโปร่งใสเฉพาะ 4 ไฮไลต์หลัก ปัดนิ้วซ้าย-ขวาได้ */}
                <div
                  className={`relative w-full group py-1 touch-pan-y ${viewMode === 'desktop' ? 'md:hidden' : 'block'}`}
                  onTouchStart={(e) => {
                    slideTouchStartX.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (slideTouchStartX.current === null) return;
                    const dx = e.changedTouches[0].clientX - slideTouchStartX.current;
                    slideTouchStartX.current = null;
                    if (Math.abs(dx) > 40) {
                      setCurrentSlide((prev) =>
                        dx < 0
                          ? (prev + 1) % highlightCards.length
                          : (prev - 1 + highlightCards.length) % highlightCards.length
                      );
                    }
                  }}
                >
                  {/* กรอบแสดงภาพแบบโปร่งใส ไร้ขอบขาว กลมกลืนกับพื้นหลัง */}
                  <div className="relative w-full aspect-[1/1.25] sm:aspect-[1/1.2] max-h-[90vh] flex items-center justify-center">
                    {highlightCards.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => openDetailPage(item)}
                        className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out cursor-pointer ${idx === currentSlide
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-95 pointer-events-none z-0'
                          }`}
                      >
                        <img
                          src={assetUrl(item.image_url)}
                          alt={lang === 'TH' ? item.title_th : item.title_en}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                  </div>

                  {/* จุด Dot Indicators 4 จุด */}
                  <div className="flex items-center justify-center gap-2 mt-3.5">
                    {highlightCards.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide
                          ? 'w-7 bg-[#154c2e] shadow-xs'
                          : 'w-2.5 bg-[#154c2e]/25 hover:bg-[#154c2e]/50'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* 3.2 แถบร้านค้าแนะนำ */}
              <section id="recommended-shops">
                <div className="pc-section-header flex items-center justify-between mb-3.5 md:mb-4 px-0.5">
                  <div>
                    <h2 className="text-base md:text-2xl font-bold text-[#154c2e] tracking-tight flex items-center gap-2">
                      <ShoppingBag size={viewMode === 'desktop' ? 22 : 18} className="text-[#154c2e] shrink-0" />
                      <span>{lang === 'TH' ? 'ร้านค้าแนะนำ' : 'Recommended Shops'}</span>
                    </h2>
                    <div className="hidden md:block w-12 h-1 bg-[#154c2e] rounded-full mt-1.5" />
                  </div>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="text-xs md:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-[#154c2e] hover:text-white px-3.5 py-1.5 rounded-full border border-emerald-200 transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>{lang === 'TH' ? 'ดูทั้งหมด' : 'All'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* แถบการ์ดร้านค้าแนะนำ: ปัดนิ้ว/ลากเลื่อนแนวนอนไร้ scrollbar บนมือถือ / Grid 3 ช่องบน Desktop */}
                <div
                  ref={shopScrollRef}
                  onMouseDown={(e) => {
                    const el = shopScrollRef.current;
                    if (!el) return;
                    shopDragState.current = {
                      down: true,
                      startX: e.pageX - el.offsetLeft,
                      scrollLeft: el.scrollLeft,
                      moved: false,
                    };
                  }}
                  onMouseMove={(e) => {
                    if (!shopDragState.current.down || !shopScrollRef.current) return;
                    const x = e.pageX - shopScrollRef.current.offsetLeft;
                    const walk = x - shopDragState.current.startX;
                    if (Math.abs(walk) > 6) {
                      shopDragState.current.moved = true;
                    }
                    shopScrollRef.current.scrollLeft = shopDragState.current.scrollLeft - walk;
                  }}
                  onMouseUp={() => {
                    shopDragState.current.down = false;
                  }}
                  onMouseLeave={() => {
                    shopDragState.current.down = false;
                  }}
                  className={
                    viewMode === 'desktop'
                      ? 'no-scrollbar flex md:grid md:grid-cols-3 gap-3.5 md:gap-4 overflow-x-auto md:overflow-visible pb-1 md:pb-0 snap-x snap-mandatory touch-pan-x select-none'
                      : 'no-scrollbar flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory touch-pan-x select-none cursor-grab active:cursor-grabbing'
                  }
                >
                  {RECOMMENDED_SHOPS.map((shop, idx) => (
                    <div
                      key={shop.id}
                      onClick={() => {
                        if (shopDragState.current.moved) {
                          shopDragState.current.moved = false;
                          return;
                        }
                        setSelectedShopIdx(idx);
                      }}
                      className={`${
                        viewMode === 'desktop' ? 'min-w-[225px] md:min-w-0' : 'min-w-[195px] max-w-[205px]'
                      } snap-start bg-white rounded-2xl overflow-hidden border border-emerald-100/90 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group hover:-translate-y-0.5`}
                    >
                      <div className="relative aspect-[4/4.6] bg-emerald-50/40 overflow-hidden">
                        <img
                          src={assetUrl(shop.image)}
                          alt={lang === 'TH' ? shop.name_th : shop.name_en}
                          draggable={false}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 flex flex-col flex-1 justify-between gap-1.5">
                        <div>
                          <div className="text-[10px] font-semibold text-emerald-700">
                            {lang === 'TH' ? shop.tag_th : shop.tag_en}
                          </div>
                          <h3 className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#154c2e] transition line-clamp-1 mt-0.5">
                            {lang === 'TH' ? shop.name_th : shop.name_en}
                          </h3>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-snug">
                            {lang === 'TH' ? shop.desc_th : shop.desc_en}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3.3 ผู้สนับสนุนการจัดงาน (Official Sponsors) เหนือ Footer หน้าแรก */}
              <section id="sponsors" className="pt-1 md:pt-2">
                <div className="flex items-center gap-3 mb-3.5 md:mb-4 px-0.5">
                  <div className="h-[1px] flex-1 bg-emerald-900/15" />
                  <h2 className="text-xs sm:text-sm md:text-base font-bold text-[#154c2e] tracking-wide uppercase">
                    {lang === 'TH' ? 'ผู้สนับสนุนการจัดงาน' : 'Official Sponsors'}
                  </h2>
                  <div className="h-[1px] flex-1 bg-emerald-900/15" />
                </div>

                <div
                  className={
                    viewMode === 'desktop'
                      ? 'grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4'
                      : 'grid grid-cols-3 gap-2.5'
                  }
                >
                  {SPONSORS.map((sp) => (
                    <div
                      key={sp.id}
                      onClick={() => setSelectedSponsor(sp)}
                      title={lang === 'TH' ? sp.name_th : sp.name_en}
                      className="bg-white rounded-2xl border border-emerald-100/90 shadow-xs hover:shadow-md transition-all duration-300 p-2.5 sm:p-3.5 aspect-[4/3] flex items-center justify-center cursor-pointer group hover:-translate-y-0.5"
                    >
                      <img
                        src={assetUrl(sp.logo)}
                        alt={lang === 'TH' ? sp.name_th : sp.name_en}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>

            </div>
          )}
        </main>

        {/* Modal Lightbox ดูโปสเตอร์ร้านค้านิสิตแบบเต็มจอ */}
        {selectedShopIdx !== null && ALL_STUDENT_SHOPS[selectedShopIdx] && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
            onClick={() => setSelectedShopIdx(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#154c2e] truncate">
                    {lang === 'TH'
                      ? ALL_STUDENT_SHOPS[selectedShopIdx].name_th
                      : ALL_STUDENT_SHOPS[selectedShopIdx].name_en}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {selectedShopIdx + 1} / {ALL_STUDENT_SHOPS.length}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedShopIdx(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50 p-2 sm:p-3 flex items-center justify-center">
                <img
                  src={assetUrl(ALL_STUDENT_SHOPS[selectedShopIdx].image)}
                  alt={ALL_STUDENT_SHOPS[selectedShopIdx].name_th}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-xl"
                />
              </div>
              <div className="px-4 py-2.5 bg-emerald-50/70 border-t border-emerald-100 space-y-0.5">
                <div className="text-[11px] font-bold text-emerald-800">
                  {lang === 'TH'
                    ? ALL_STUDENT_SHOPS[selectedShopIdx].tag_th
                    : ALL_STUDENT_SHOPS[selectedShopIdx].tag_en}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {lang === 'TH'
                    ? ALL_STUDENT_SHOPS[selectedShopIdx].desc_th
                    : ALL_STUDENT_SHOPS[selectedShopIdx].desc_en}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal ขยายดูโลโก้ผู้สนับสนุน */}
        {selectedSponsor && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedSponsor(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                <div className="text-xs sm:text-sm font-bold text-[#154c2e] truncate">
                  {lang === 'TH' ? selectedSponsor.name_th : selectedSponsor.name_en}
                </div>
                <button
                  onClick={() => setSelectedSponsor(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 bg-white flex items-center justify-center">
                <img
                  src={assetUrl(selectedSponsor.logo)}
                  alt={selectedSponsor.name_th}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================
            4. Footer สีเขียวเข้ม มก.
            ===================== */}
        <footer className={`bg-[#154c2e] text-white ${viewMode === 'desktop' ? 'p-4 md:px-8 md:py-6 mt-8 md:mt-12' : 'p-3 sm:p-3.5 mt-5'}`}>
          <div className="max-w-6xl mx-auto flex items-center gap-2.5 sm:gap-3 md:gap-5">
            <img
              src={assetUrl('/ku-logo.png')}
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
                © Copyright Kasetsart University CSC | Kasetfair
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
