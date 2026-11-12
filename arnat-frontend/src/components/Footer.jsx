// src/components/Footer.jsx
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="lux-site-footer">
      <div className="lux-footer-inner">
        <div className="footer-top-grid">
          {/* Col 1: Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-logo-row">
              <div className="footer-logo-crest">
                <img src="/images/logo.jpg"
                  alt="Thanatooth Luxury Auto Logo"
                  className="footer-logo-img"
                />
              </div>
              <div className="footer-brand-title-group">
                <span className="footer-brand-name">Thanatooth Luxury Auto</span>
                <span className="footer-brand-tagline">PREMIUM CAR RENTAL</span>
              </div>
            </div>
            <p className="footer-desc">
              Premier luxury supercar, sedan, and SUV rental service. Experience peerless automotive distinction with comprehensive insurance and 24/7 VIP airport concierge delivery.
            </p>
            <div className="footer-badges-strip">
              <span className="f-badge">Certified Mint Condition</span>
              <span className="f-badge">100% Comprehensive Coverage</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Quick Navigation</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/fleet">All Fleet (80 Models)</Link></li>
              <li><Link to="/brands">Browse Brands</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/about">About Us & Policies</Link></li>
            </ul>
          </div>

          {/* Col 3: Brand Fleet */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Luxury Houses</h4>
            <ul className="footer-links-list">
              <li><Link to="/fleet?brand=Porsche">Porsche (911, Panamera, Macan)</Link></li>
              <li><Link to="/fleet?brand=Ferrari">Ferrari (Roma, Portofino M)</Link></li>
              <li><Link to="/fleet?brand=Rolls-Royce">Rolls-Royce (Ghost, Cullinan)</Link></li>
              <li><Link to="/fleet?brand=Bentley">Bentley (Continental GT, Bentayga)</Link></li>
              <li><Link to="/fleet?brand=Mercedes-Benz">Mercedes-Benz & Maybach</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Locations */}
          <div className="footer-contact-col">
            <h4 className="footer-heading">Showrooms & Concierge</h4>
            <ul className="footer-contact-list">
              <li><strong>Suvarnabhumi Airport:</strong> VIP Arrival Lounge, 2nd Fl.</li>
              <li><strong>Head Showroom:</strong> Thanatooth Tower, Rama 9, Bangkok</li>
              <li><strong>24/7 VIP Hotline:</strong> +66 2-999-8888, +66 81-888-9999</li>
              <li><strong>Email:</strong> concierge@thanatooth-luxury.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p>© 2026 Thanatooth Luxury Drive. All Rights Reserved. React Multi-Page Application.</p>
          <div className="footer-tech-stack" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              to="/admin"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Open Concierge Admin Console in separate tab"
            >
              <span>Staff Portal</span>
              <span style={{ fontSize: "10px" }}>↗</span>
            </Link>
            <span>•</span>
            <span>React 19</span> • <span>React Router v7</span> • <span>Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

