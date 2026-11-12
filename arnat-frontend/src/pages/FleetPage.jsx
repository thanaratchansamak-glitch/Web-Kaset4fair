// src/pages/FleetPage.jsx
import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { initialCars } from "../data/cars";
import "./FleetPage.css";

export default function FleetPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Retrieve filter from query string if present (e.g. /fleet?category=Supercar or /fleet?brand=Ferrari)
  const categoryQuery = searchParams.get("category") || searchParams.get("brand") || "All";
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // 'default' | 'price-asc' | 'price-desc' | 'name-asc'

  // Update selectedCategory when query string changes
  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory((prev) => (prev !== categoryQuery ? categoryQuery : prev));
    }
  }, [categoryQuery]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
  };

  //  Main Category Tabs

  const categoryTabs = [
    { id: "All", name: `All Fleet (${initialCars.length} Models)` },
    { id: "Supercar & Sports Car", name: "Supercars & Sports" },
    { id: "Luxury Sedan", name: "Luxury Sedans" },
    { id: "Luxury SUV", name: "Luxury SUVs" },
    { id: "Luxury VIP Van", name: "VIP First-Class Vans" },
  ];

  //  Filter and sort cars

  const filteredCars = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    //  1. Filter by category, brand, and search term

    const result = initialCars.filter((car) => {
      const sel = selectedCategory.toLowerCase();
      const matchCat =
        selectedCategory === "All" ||
        car.category.toLowerCase() === sel ||
        car.brand.toLowerCase() === sel ||
        car.brand.toLowerCase().includes(sel) ||
        sel.includes(car.brand.toLowerCase());

      const matchSearch =
        !term ||
        car.model.toLowerCase().includes(term) ||
        car.brand.toLowerCase().includes(term) ||
        car.category.toLowerCase().includes(term) ||
        `${car.brand} ${car.model}`.toLowerCase().includes(term);

      return matchCat && matchSearch;
    });

    //  2. Sort by selected order

    if (sortBy === "price-asc") {
      // น้อยไปมาก (Low to High)
      result.sort((a, b) => a.dailyRate - b.dailyRate);
    } else if (sortBy === "price-desc") {
      // มากไปน้อย (High to Low)
      result.sort((a, b) => b.dailyRate - a.dailyRate);
    } else if (sortBy === "name-asc") {
      // A-Z (Alphabetical)
      result.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
    }

    return result;
  }, [selectedCategory, searchTerm, sortBy]);

  return (
    <div className="fleet-page-root">
      {/* Header Banner */}
      <section className="fleet-header-banner">
        <div className="fleet-container">
          <span className="banner-tag-gold">THANATOOTH LUXURY SHOWROOM</span>
          <h1 className="banner-title">Premier Luxury Fleet · {initialCars.length} Models (21 World Marque Houses)</h1>
          <p className="banner-subtitle">
            Curated collection of the world's most prestigious supercars, executive sedans, performance SUVs, and VIP luxury vans.
          </p>
        </div>
      </section>

      {/* Filter & Controls Section */}
      <section className="fleet-controls-section">
        <div className="fleet-container">
          {/* Category Tabs Row */}
          <div className="brand-tabs-scroll-wrap">
            {categoryTabs.map((tab) => (
              <button key={tab.id}
                type="button"
                className={`brand-tab-btn ${selectedCategory === tab.id ? "active" : ""}`}
                onClick={() => handleCategoryChange(tab.id)}
              >
                <span className="tab-name">{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Search & Sorting Bar */}
          <div className="fleet-filter-bar">
            {/* Search Input */}
            <div className="fleet-search-wrap">
              <input type="text"
                placeholder="Search by model or marque (e.g. Roma, GT3, Ghost, Bentayga, S-Class)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn-clear-search"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {/* Sorting Dropdown (น้อยไปมาก, มากไปน้อย, A-Z) */}
            <div className="fleet-price-select-wrap">
              <label>Sort By:</label>
              <select value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low to High (น้อยไปมาก)</option>
                <option value="price-desc">Price: High to Low (มากไปน้อย)</option>
                <option value="name-asc">Alphabetical: A - Z (A-Z)</option>
              </select>
            </div>

            {/* Results Counter */}
            <div className="fleet-count-tag">
              <strong>{filteredCars.length}</strong> Vehicles Available
            </div>
          </div>
        </div>
      </section>

      {/* Grid Showcase of Cars */}
      <section className="fleet-grid-section">
        <div className="fleet-container">
          {filteredCars.length === 0 ? (
            <div className="fleet-empty-card">
              <h3>No vehicles matched your search criteria</h3>
              <p>Try adjusting your search terms or clearing selected filters to view our full collection.</p>
              <button type="button"
                className="btn-reset-fleet-gold"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchTerm("");
                  setSortBy("default");
                  setSearchParams({});
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="cars-grid-container">
              {filteredCars.map((car) => {
                const isAvailable = car.status === "ว่าง" || car.status === "Available";
                const isReserved = car.status === "ถูกจอง" || car.status === "Reserved";

                return (
                  <div key={car.id} className="fleet-car-card">
                    {/* Photo with Overlay Badges */}
                    <div className="fleet-card-photo">
                      <img src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = car.fallbackImageUrl || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      <div className="card-top-badges">
                        <span className="badge-brand-chip">{car.brand}</span>
                        <span className="badge-cat-chip">{car.subCategory || car.category}</span>
                      </div>

                      {/* Status Badge */}
                      <span className={`badge-status-chip status-${isAvailable ? "available" : "reserved"}`}>
                        {isAvailable ? "Available" : isReserved ? "Reserved" : "In Service"}
                      </span>
                    </div>

                    {/* Card Details */}
                    <div className="fleet-card-body">
                      <div className="card-heading-group">
                        <span className="card-brand-label">{car.brand}</span>
                        <h3 className="card-model-title">{car.model}</h3>
                      </div>

                      {/* Specs Row */}
                      <div className="card-specs-row">
                        <span className="spec-tag" title="Horsepower">
                          {car.specs.horsepower}
                        </span>
                        <span className="spec-tag" title="0-100 km/h Acceleration">
                          {car.specs.acceleration}
                        </span>
                        <span className="spec-tag" title="Transmission">
                          {car.specs.transmission}
                        </span>
                        <span className="spec-tag" title="Passenger Seats">
                          {car.seats} Seats
                        </span>
                      </div>

                      {/* Description Summary */}
                      <p className="card-car-desc-summary">
                        {car.description}
                      </p>

                      {/* Daily Rate & Actions */}
                      <div className="card-footer-action-row">
                        <div className="card-rate-box">
                          <span className="rate-sub">Daily Rate</span>
                          <div className="rate-val">
                            ฿{car.dailyRate.toLocaleString()}
                            <small> / day</small>
                          </div>
                        </div>

                        <div className="card-btns-wrap">
                          {/* View Details Button */}
                          <Link to={`/fleet/${car.id}`}
                            className="btn-view-details"
                            title="View vehicle specifications and gallery"
                          >
                            View Details
                          </Link>
                          {/* Book Now Button */}
                          <Link to={`/book/${car.id}`}
                            className="btn-book-now-gold"
                            title="Reserve this vehicle immediately"
                          >
                            Reserve 
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
