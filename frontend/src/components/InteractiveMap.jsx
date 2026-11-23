import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Plus,
  Minus,
  LocateFixed,
  Maximize2,
  Minimize2,
  FileImage,
  Navigation,
  ChevronDown,
  ChevronUp,
  X,
  Compass,
} from 'lucide-react';
import {
  CAMPUS_CENTER,
  MAP_LOCATIONS,
  ROAD_CLOSURES,
} from '../data/mapLocations';

export default function InteractiveMap({ lang, assetUrl, viewMode = 'desktop', onBackHome }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const langRef = useRef(lang);

  const [mapStyle, setMapStyle] = useState('street');

  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [openGroups, setOpenGroups] = useState({ event: false, parking: false, restroom: false });
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullMapsModal, setShowFullMapsModal] = useState(false);
  const [activeFullMapKey, setActiveFullMapKey] = useState('shops');
  const [gpsStatus, setGpsStatus] = useState('');

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  const eventLocs = MAP_LOCATIONS.filter((l) => l.category === 'event');
  const studentLocs = MAP_LOCATIONS.filter((l) => l.category === 'student');

  const filteredLocations =
    filterCat === 'all'
      ? MAP_LOCATIONS
      : MAP_LOCATIONS.filter((l) => l.category === filterCat);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CENTER,
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: true,
    });

    map.attributionControl.setPrefix(
      '<a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a>'
    );

    const streetLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; OpenStreetMap contributors',
        maxZoom: 19,
      }
    );
    streetLayer.addTo(map);
    tileLayerRef.current = streetLayer;

    MAP_LOCATIONS.forEach((loc) => {
      const isStudent = loc.category === 'student';
      const bg = isStudent ? '#15803d' : '#ca8a04';
      const icon = L.divIcon({
        className: 'k4f-custom-marker',
        html: `<div style="width:24px;height:24px;border-radius:9999px;background:${bg};color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;">${loc.number}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const accent = isStudent ? '#15803d' : '#a16207';
      const popupContent = () => {
        const th = langRef.current === 'TH';
        return `<div style="font-family:inherit;font-size:12px;font-weight:700;color:${accent};">${loc.number}. ${th ? loc.name_th : loc.name_en}</div><div style="font-size:11px;color:#4b5563;margin-top:2px;max-width:240px;">${th ? loc.detail_th : loc.detail_en}</div>`;
      };
      const popupOpts = { autoPan: false, offset: [0, -8] };

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
      marker.bindPopup(popupContent, popupOpts);
      marker.on('click', () => {
        setSelectedLoc(loc);
        map.flyTo([loc.lat, loc.lng], 19, { duration: 0.4 });
      });

      markersRef.current[loc.id] = marker;

      (loc.extraCoords || []).forEach((pt) => {
        const extraMarker = L.marker([pt.lat, pt.lng], { icon }).addTo(map);
        extraMarker.bindPopup(popupContent, popupOpts);
        extraMarker.on('click', () => {
          setSelectedLoc(loc);
          map.flyTo([pt.lat, pt.lng], 19, { duration: 0.4 });
        });
      });
    });

    // จุดห้ามผ่าน / ปิดถนน
    ROAD_CLOSURES.forEach((closure) => {
      const noEntryIcon = L.divIcon({
        className: 'k4f-no-entry-marker',
        html: `<div title="${closure.name_th}" style="width:22px;height:22px;border-radius:9999px;background:#dc2626;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><div style="width:12px;height:3.5px;background:#fff;border-radius:2px;"></div></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const closureMarker = L.marker([closure.lat, closure.lng], {
        icon: noEntryIcon,
        zIndexOffset: 500,
      }).addTo(map);
      closureMarker.bindPopup(
        `<div style="font-family:inherit;font-size:12px;font-weight:700;color:#b91c1c;">⛔ ${closure.name_th}</div><div style="font-size:11px;color:#4b5563;margin-top:2px;">${closure.name_en}</div>`
      );
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isFullscreen, viewMode]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const nextLayer =
      mapStyle === 'satellite'
        ? L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
          )
        : L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
            {
              attribution: 'Tiles &copy; Esri &mdash; OpenStreetMap contributors',
              maxZoom: 19,
            }
          );
    nextLayer.addTo(map);
    tileLayerRef.current = nextLayer;
  }, [mapStyle]);

  const handleSelectLocation = (loc) => {
    setSelectedLoc(loc);
    setPickerOpen(false);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([loc.lat, loc.lng], 18, { duration: 0.6 });
      map.once('moveend', () => markersRef.current[loc.id]?.openPopup());
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds(MAP_LOCATIONS.map((l) => [l.lat, l.lng]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsStatus(lang === 'TH' ? 'เบราว์เซอร์ไม่รองรับ GPS' : 'GPS not supported');
      return;
    }
    setGpsStatus(lang === 'TH' ? 'กำลังค้นหาตำแหน่ง...' : 'Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsStatus('');
        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }
          const userIcon = L.divIcon({
            className: 'k4f-user-dot',
            html: `<div style="width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,0.25);"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
          mapInstanceRef.current.flyTo([latitude, longitude], 18, { duration: 0.7 });
        }
      },
      () => {
        setGpsStatus(lang === 'TH' ? 'ไม่สามารถเข้าถึงตำแหน่งได้' : 'Location access denied');
        setTimeout(() => setGpsStatus(''), 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const fullMaps = [
    { key: 'shops', labelTh: 'ผังร้านค้า (2569)', labelEn: 'All Shops (2026)', src: '/maps/zone-shops-2026.jpg' },
    { key: 'exhibition', labelTh: 'ผังนิทรรศการ (14 จุด)', labelEn: 'Exhibition (14 Points)', src: '/maps/zone-exhibition-2026.jpg' },
    { key: 'student', labelTh: 'ผังโซนร้านค้านิสิต', labelEn: 'Student Shops', src: '/maps/zone-student-shops-2026.jpg' },
  ];

  const isDesktop = viewMode === 'desktop';

  const renderBadge = (loc) => (
    <span
      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${
        loc.category === 'student' ? 'bg-emerald-700' : 'bg-yellow-600'
      }`}
    >
      {loc.number}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className={`text-xl ${isDesktop ? 'md:text-3xl' : ''} font-bold text-[#154c2e]`}>
            {lang === 'TH' ? 'แผนที่ภายในงาน' : 'Event Interactive Map'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {lang === 'TH'
              ? 'แตะหมุดหรือเลือกรายการสถานที่ เพื่อดูรายละเอียดและนำทางด้วย Google Maps'
              : 'Tap a pin or choose a place to view details and navigate with Google Maps'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDesktop && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleFitAll}
                className="bg-white hover:bg-emerald-50 text-[#154c2e] font-semibold text-xs px-4 py-2 rounded-full border border-gray-200 shadow-2xs cursor-pointer transition"
              >
                {lang === 'TH' ? 'ดูทั้งแผนที่' : 'Show All'}
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                className="text-white font-semibold text-xs px-4 py-2 rounded-full shadow-xs cursor-pointer transition hover:brightness-105"
                style={{ background: 'linear-gradient(90deg, #0d9488 0%, #15803d 55%, #d4c46a 100%)' }}
              >
                {lang === 'TH' ? 'เต็มจอ' : 'Fullscreen'}
              </button>
              <button
                onClick={() => setShowFullMapsModal(true)}
                className="bg-white hover:bg-emerald-50 text-[#154c2e] font-semibold text-xs px-4 py-2 rounded-full border border-gray-200 shadow-2xs cursor-pointer transition inline-flex items-center gap-1.5"
              >
                <FileImage size={14} />
                <span>{lang === 'TH' ? 'ดูผังงานฉบับเต็ม' : 'Full Zone Maps'}</span>
              </button>
            </div>
          )}
          {onBackHome && (
            <button
              onClick={onBackHome}
              className="text-xs md:text-sm text-[#154c2e] font-semibold bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition cursor-pointer border border-emerald-200 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
            >
              <span>←</span>
              <span>{lang === 'TH' ? 'หน้าหลัก' : 'Home'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Location Picker Pill */}
      <div className={isDesktop ? 'md:hidden' : 'block'}>
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className="w-full rounded-full px-5 py-3.5 flex items-center justify-between text-left shadow-md cursor-pointer transition hover:brightness-105 active:scale-[0.99]"
          style={{
            background: 'linear-gradient(90deg, #0d9488 0%, #15803d 55%, #d4c46a 100%)',
          }}
        >
          <div className="flex items-center gap-3.5 text-white">
            <Compass size={24} className="shrink-0 opacity-95" />
            <div>
              <div className="text-base font-extrabold leading-tight">
                {lang === 'TH' ? 'เลือกสถานที่' : 'Select Location'}
              </div>
              <div className="text-[11px] text-white/90 font-medium">
                {lang === 'TH'
                  ? `เลือกดูสถานที่ภายในงาน ${MAP_LOCATIONS.length} แห่ง`
                  : `Browse ${MAP_LOCATIONS.length} locations in the fair`}
              </div>
            </div>
          </div>
          <span className="text-white/95 shrink-0">
            {pickerOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </span>
        </button>

        {pickerOpen && (
          <div className="mt-2 bg-white rounded-2xl shadow-lg border border-emerald-100 p-3 space-y-2.5 animate-fade-in">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', th: `ทั้งหมด (${MAP_LOCATIONS.length})`, en: `All (${MAP_LOCATIONS.length})` },
                { id: 'event', th: `โซนนิทรรศการ (${eventLocs.length})`, en: `Exhibition (${eventLocs.length})` },
                { id: 'student', th: `โซนนิสิต (${studentLocs.length})`, en: `Student Zone (${studentLocs.length})` },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCat(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer border transition ${
                    filterCat === cat.id
                      ? 'bg-[#154c2e] text-white border-[#154c2e]'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50'
                  }`}
                >
                  {lang === 'TH' ? cat.th : cat.en}
                </button>
              ))}
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full py-2.5 px-2 flex items-center gap-3 text-left hover:bg-emerald-50/70 rounded-xl transition cursor-pointer"
                >
                  {renderBadge(loc)}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-gray-900 truncate">
                      {lang === 'TH' ? loc.name_th : loc.name_en}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {lang === 'TH' ? loc.detail_th : loc.detail_en}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Desktop 2-column (Sidebar + Map) / Mobile 1-column */}
      <div className={isDesktop ? 'grid grid-cols-1 md:grid-cols-[290px_1fr] gap-4 items-stretch' : ''}>
        {/* Desktop Sidebar */}
        {isDesktop && (
          <aside className="hidden md:flex flex-col bg-emerald-50/40 rounded-2xl border border-emerald-100 p-3.5 space-y-3 max-h-[520px] overflow-y-auto">
            <h3 className="font-bold text-sm text-[#154c2e]">
              {lang === 'TH' ? `รายการสถานที่ (${MAP_LOCATIONS.length})` : `Locations (${MAP_LOCATIONS.length})`}
            </h3>

            {[
              { key: 'event', labelTh: `โซนนิทรรศการ (${eventLocs.length})`, labelEn: `Exhibition (${eventLocs.length})`, items: eventLocs },
              { key: 'student', labelTh: `โซนนิสิต Happy University (${studentLocs.length})`, labelEn: `Student Zone (${studentLocs.length})`, items: studentLocs },
            ].map((grp) => (
              <div key={grp.key} className="rounded-xl overflow-hidden border border-emerald-100/80 bg-white">
                <button
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [grp.key]: !prev[grp.key] }))}
                  className="w-full px-3.5 py-2.5 bg-emerald-100/60 hover:bg-emerald-100 text-left text-xs font-bold text-[#154c2e] flex items-center justify-between cursor-pointer transition"
                >
                  <span>{lang === 'TH' ? grp.labelTh : grp.labelEn}</span>
                  {openGroups[grp.key] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                {openGroups[grp.key] && (
                  <div className="divide-y divide-gray-100">
                    {grp.items.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleSelectLocation(loc)}
                        className={`w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-emerald-50 transition cursor-pointer ${
                          selectedLoc?.id === loc.id ? 'bg-emerald-50/90' : ''
                        }`}
                      >
                        {renderBadge(loc)}
                        <span className="text-xs font-semibold text-gray-800 line-clamp-1">
                          {lang === 'TH' ? loc.name_th : loc.name_en}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </aside>
        )}

        {/* Map Canvas Container */}
        <div
          className={`${
            isFullscreen
              ? 'fixed inset-0 z-50 bg-white p-3 flex flex-col'
              : 'relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col'
          }`}
        >
          {isFullscreen && (
            <div className="flex items-center justify-between pb-2">
              <span className="font-bold text-sm text-[#154c2e]">
                {lang === 'TH' ? 'แผนที่งานเกษตรแฟร์ นนทรีอีสาน' : 'Kaset Fair Interactive Map'}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Minimize2 size={14} />
                <span>{lang === 'TH' ? 'ย่อจอ' : 'Exit'}</span>
              </button>
            </div>
          )}

          <div
            className={`relative w-full ${
              isFullscreen ? 'flex-1 rounded-2xl overflow-hidden' : isDesktop ? 'h-[390px] md:h-[520px]' : 'h-[390px]'
            }`}
          >
            <div
              ref={mapContainerRef}
              className="w-full h-full z-10"
              style={{ backgroundColor: '#e2ebd5' }}
            />

            {/* ปุ่มควบคุมด้านขวาบน */}
            <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                <button
                  onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="w-10 h-10 flex items-center justify-center text-[#154c2e] hover:bg-emerald-50 border-b border-gray-100 cursor-pointer"
                  title="Zoom In"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="w-10 h-10 flex items-center justify-center text-[#154c2e] hover:bg-emerald-50 cursor-pointer"
                  title="Zoom Out"
                >
                  <Minus size={18} />
                </button>
              </div>

              <button
                onClick={handleLocateMe}
                className="w-10 h-10 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center text-[#154c2e] hover:bg-emerald-50 cursor-pointer"
                title={lang === 'TH' ? 'ตำแหน่งของฉัน' : 'My Location'}
              >
                <LocateFixed size={18} />
              </button>
            </div>

            {/* ปุ่มสลับมุมมอง แผนที่ / ดาวเทียม มุมซ้ายบน */}
            <div className="absolute top-3 left-3 z-20 bg-white/95 rounded-xl shadow-md border border-gray-200 p-1 flex items-center gap-1">
              <button
                onClick={() => setMapStyle('street')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  mapStyle === 'street' ? 'bg-[#154c2e] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {lang === 'TH' ? 'แผนที่' : 'Map'}
              </button>
              <button
                onClick={() => setMapStyle('satellite')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition ${
                  mapStyle === 'satellite' ? 'bg-[#154c2e] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {lang === 'TH' ? 'ดาวเทียม' : 'Satellite'}
              </button>
            </div>

            {gpsStatus && (
              <div className="absolute top-14 left-3 z-20 bg-black/75 text-white text-xs px-3 py-1.5 rounded-full">
                {gpsStatus}
              </div>
            )}
          </div>

          {/* การ์ดแสดงรายละเอียดเมื่อกดหมุด */}
          {selectedLoc && (
            <div className="bg-white border-t border-emerald-100 p-3 flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLoc.lat},${selectedLoc.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#154c2e] hover:bg-[#0f3a22] text-white px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Navigation size={16} />
                <span>{lang === 'TH' ? 'นำทาง Google Maps' : 'Navigate with Google Maps'}</span>
              </a>
              <button
                onClick={() => { setSelectedLoc(null); mapInstanceRef.current?.closePopup(); }}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Action Buttons below map */}
      <div className={isDesktop ? 'md:hidden space-y-2.5' : 'space-y-2.5'}>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleFitAll}
            className="bg-white hover:bg-emerald-50 text-[#154c2e] font-semibold text-xs py-2.5 px-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer transition"
          >
            {lang === 'TH' ? 'ดูทั้งแผนที่' : 'Show All Pins'}
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="bg-white hover:bg-emerald-50 text-[#154c2e] font-semibold text-xs py-2.5 px-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer transition inline-flex items-center justify-center gap-1.5"
          >
            <Maximize2 size={14} />
            <span>{lang === 'TH' ? 'เต็มจอ' : 'Fullscreen'}</span>
          </button>
        </div>

        <button
          onClick={() => setShowFullMapsModal(true)}
          className="w-full bg-white hover:bg-emerald-50 text-[#154c2e] font-semibold text-xs py-3 px-4 rounded-xl border border-gray-200 shadow-2xs cursor-pointer transition inline-flex items-center justify-center gap-2"
        >
          <FileImage size={16} />
          <span>{lang === 'TH' ? 'ดูผังงานฉบับเต็ม (JPG)' : 'View Full Zone Maps (JPG)'}</span>
        </button>
      </div>

      <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">
        {lang === 'TH'
          ? `โซนนิทรรศการ ${eventLocs.length} จุด · โซนนิสิต ${studentLocs.length} จุด`
          : `${eventLocs.length} exhibition points · ${studentLocs.length} student zone points`}
      </p>

      {/* Modal ดูผังงานฉบับเต็ม 3 รูป */}
      {showFullMapsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3"
          onClick={() => setShowFullMapsModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {fullMaps.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setActiveFullMapKey(m.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition ${
                      activeFullMapKey === m.key
                        ? 'bg-[#154c2e] text-white border-[#154c2e]'
                        : 'bg-emerald-50 text-[#154c2e] border-emerald-200'
                    }`}
                  >
                    {lang === 'TH' ? m.labelTh : m.labelEn}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFullMapsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 bg-gray-50 flex items-center justify-center">
              <img
                src={assetUrl(fullMaps.find((m) => m.key === activeFullMapKey)?.src || '/maps/zone-shops-2026.jpg')}
                alt="Full Zone Map"
                className="w-full h-auto object-contain rounded-xl cursor-zoom-in"
                onClick={() =>
                  window.open(
                    assetUrl(fullMaps.find((m) => m.key === activeFullMapKey)?.src || '/maps/zone-shops-2026.jpg'),
                    '_blank'
                  )
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
