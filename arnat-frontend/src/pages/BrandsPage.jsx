// src/pages/BrandsPage.jsx - Exact Car Marketplace Brand Grid
import { useNavigate } from "react-router-dom";
import "./BrandsPage.css";

// Premier Automotive Marque Houses
const marketplaceBrands = [
  { id: "Mercedes-Benz", name: "Mercedes-Benz", logo: "/images/brands/mercedes-benz.svg" },
  { id: "BMW", name: "BMW", logo: "/images/brands/bmw.svg" },
  { id: "Audi", name: "Audi", logo: "/images/brands/audi.svg" },
  { id: "Lexus", name: "Lexus", logo: "/images/brands/lexus.svg" },
  { id: "Porsche", name: "Porsche", logo: "/images/brands/porsche.svg" },
  { id: "Maserati", name: "Maserati", logo: "/images/brands/maserati.svg" },
  { id: "Honda", name: "Honda", logo: "/images/brands/honda.svg" },
  { id: "Nissan", name: "Nissan", logo: "/images/brands/nissan.svg" },
  { id: "Toyota", name: "Toyota", logo: "/images/brands/toyota.svg" },
  { id: "Lamborghini", name: "Lamborghini", logo: "/images/brands/lamborghini.svg" },
  { id: "Ferrari", name: "Ferrari", logo: "/images/brands/ferrari.svg" },
  { id: "Bentley", name: "Bentley", logo: "/images/brands/bentley.svg" },
  { id: "Rolls-Royce", name: "Rolls-Royce", logo: "/images/brands/rolls-royce.svg" },
  { id: "McLaren", name: "McLaren", logo: "/images/brands/mclaren.svg" },
  { id: "Range Rover", name: "Land Rover", logo: "/images/brands/land-rover.svg" },
  { id: "Mercedes-Maybach", name: "Maybach", logo: "/images/brands/mercedes-maybach.svg" },
  { id: "Chevrolet", name: "Chevrolet", logo: "/images/brands/chevrolet.svg" },
  { id: "Aston Martin", name: "Aston Martin", logo: "/images/brands/aston-martin.svg" },
  { id: "Tesla", name: "TESLA", logo: "/images/brands/tesla.svg" },
  { id: "Volvo", name: "Volvo", logo: "/images/brands/volvo.svg" },
  { id: "Ford", name: "Ford", logo: "/images/brands/ford.svg" },
];

export default function BrandsPage() {
  const navigate = useNavigate();

  const handleBrandClick = (brandId) => {
    navigate(`/fleet?brand=${encodeURIComponent(brandId)}`);
  };

  return (
    <div className="marketplace-brands-root">
      <div className="marketplace-brands-container">
        {/* Page Title */}
        <div className="brands-title-row">
          <h1 className="brands-main-heading">Search Luxury Cars by Brand</h1>
        </div>

        {/* Brand Grid */}
        <div className="brands-marketplace-grid">
          {marketplaceBrands.map((brand) => (
            <div
              key={brand.id}
              className="brand-portal-card"
              onClick={() => handleBrandClick(brand.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleBrandClick(brand.id);
                }
              }}
              title={`Explore ${brand.name} collection`}
            >
              {/* Upper Part: Brand Logo */}
              <div className="brand-portal-logo-wrap">
                <img
                  src={brand.logo}
                  alt={`${brand.name} Logo`}
                  className="brand-portal-logo-img"
                  loading="lazy"
                />
              </div>

              {/* Lower Part: Brand Name Label */}
              <div className="brand-portal-name-bar">
                <span className="brand-portal-name-text">{brand.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
