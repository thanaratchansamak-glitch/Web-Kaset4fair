// src/pages/AboutPage.jsx
import { useState } from "react";
import "./AboutPage.css";

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Long-Term Luxury Rental (Weekly / Monthly)",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim()) {
      alert("Please provide your name and email address.");
      return;
    }
    setSubmitted(true);
    alert(` Thank you, ${contactForm.name}! Your inquiry has been forwarded to our VIP Concierge team. We will contact you within 15 minutes.`);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      subject: "Long-Term Luxury Rental (Weekly / Monthly)",
      message: "",
    });
  };

  return (
    <div className="about-page-root">
      {/* Hero Header */}
      <section className="about-hero-banner">
        <div className="about-container">
          <span className="about-tag-gold">ABOUT THANATOOTH LUXURY DRIVE</span>
          <h1 className="about-title">Prestige Automotive Excellence</h1>
          <p className="about-subtitle">
            Thailand's foremost premier exotic supercar, grand tourer, and executive SUV rental service — pairing high-performance engineering with white-glove hospitality.
          </p>
        </div>
      </section>

      <div className="about-container main-content-wrap">
        {/* ================= 1. Heritage & Vision ================= */}
        <section className="about-history-section">
          <div className="history-text-col">
            <span className="section-sub-gold">OUR HERITAGE & VISION</span>
            <h2>Redefining Elite Mobility in Southeast Asia</h2>
            <p>
              Founded upon an uncompromising passion for automotive perfection, Thanatooth Luxury Auto curates the most exclusive fleet of supercars, luxury sedans, and high-performance SUVs in Thailand — representing prestigious houses including Rolls-Royce, Bentley, Ferrari, Lamborghini, Porsche, Mercedes-Maybach, and Aston Martin.
            </p>
            <p>
              Every vehicle in our collection adheres to certified factory maintenance standards, undergoing a rigorous 150-point technical inspection, professional multi-stage ceramic detailing, and medical-grade sanitization before each client handover.
            </p>

            <div className="stats-three-grid">
              <div className="stat-card">
                <strong>100%</strong>
                <span>Mint Condition Fleet</span>
              </div>
              <div className="stat-card">
                <strong>24/7</strong>
                <span>VIP Concierge Service</span>
              </div>
              <div className="stat-card">
                <strong>80+</strong>
                <span>Curated Luxury Models</span>
              </div>
            </div>
          </div>

          <div className="history-graphic-col">
            <div className="vip-badge-card">
              <div className="about-official-logo-wrap">
                <img src="/images/logo.jpg"
                  alt="Thanatooth Luxury Auto Official Emblem"
                  className="about-official-logo-img"
                />
              </div>
              <h3>THANATOOTH LUXURY AUTO</h3>
              <p className="vip-badge-tagline">PREMIUM CAR RENTAL · FIRST CLASS SERVICE</p>
              <p className="vip-badge-desc">
                Punctual white-glove delivery, 100% comprehensive zero-excess insurance, and dedicated 24/7 VIP personal concierge throughout your rental.
              </p>
            </div>
          </div>
        </section>

        {/* ================= 2. Rental Terms & Policies ================= */}
        <section className="about-terms-section">
          <div className="terms-header-center">
            <span className="section-sub-gold">RENTAL TERMS & POLICIES</span>
            <h2>Rental Terms & Client Eligibility Policies</h2>
            <p>Transparent, straightforward requirements crafted for peace of mind, privacy, and safety.</p>
          </div>

          <div className="terms-grid-cards">
            <div className="term-card">
              <h3>1. Eligibility & Credentials</h3>
              <ul>
                <li>Primary renter must be at least 20 years of age.</li>
                <li>Valid National Identification Card or International Passport for overseas clients.</li>
                <li>Valid domestic driving license (minimum 6 months validity) or International Driving Permit (IDP).</li>
              </ul>
            </div>

            <div className="term-card">
              <h3>2. Security Deposit & Payment</h3>
              <ul>
                <li>Refundable security deposit varies by vehicle tier (฿35,000 - ฿60,000).</li>
                <li>Major credit cards, wire transfers, and digital corporate payments accepted.</li>
                <li>100% deposit returned promptly within 24 hours following flawless vehicle return.</li>
              </ul>
            </div>

            <div className="term-card">
              <h3>3. Fuel & Vehicle Return</h3>
              <ul>
                <li>Full-to-Full fuel policy (delivered with a full tank, returned with a full tank).</li>
                <li>Optional pre-paid fuel package available upon delivery.</li>
                <li>Complimentary 1-hour grace period for vehicle returns without surcharge.</li>
              </ul>
            </div>

            <div className="term-card">
              <h3>4. Insurance & Geographical Coverage</h3>
              <ul>
                <li>Complimentary first-class commercial insurance covering collision, theft, and passengers.</li>
                <li>Optional Zero Excess waiver available for complete peace of mind.</li>
                <li>Driving permitted nationwide across Thailand on paved public roadways.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================= 3. Locations & Contact Form ================= */}
        <section className="about-contact-section">
          {/* Col 1: Showroom Locations */}
          <div className="locations-col">
            <span className="section-sub-gold">OUR LOCATIONS</span>
            <h2>Showrooms & VIP Handover Lounges</h2>
            <p>Strategically stationed across prime business hubs, luxury centers, and airport terminals.</p>

            <div className="locations-list">
              <div className="loc-card">
                <div className="loc-badge">Flagship Center</div>
                <h4>Thanatooth Headquarters & Luxury Center</h4>
                <p> Rama 9 Road, Bang Kapi, Huai Khwang, Bangkok 10310</p>
                <span className="loc-time"> Open Daily: 08:00 AM – 10:00 PM</span>
              </div>

              <div className="loc-card">
                <div className="loc-badge">Airport Delivery Hub</div>
                <h4>Suvarnabhumi Airport VIP Arrival Lounge</h4>
                <p> Suvarnabhumi International Airport, Passenger Terminal 2nd Floor, Gate 4</p>
                <span className="loc-time"> Open 24 Hours Daily</span>
              </div>

              <div className="loc-card">
                <div className="loc-badge">City Center VIP Valet</div>
                <h4>Siam Paragon Exclusive Valet Service</h4>
                <p> Siam Paragon Luxury Mall, Level B1, Pillar G12, Pathum Wan, Bangkok</p>
                <span className="loc-time"> Open Daily: 10:00 AM – 09:00 PM</span>
              </div>
            </div>
          </div>

          {/* Col 2: Contact Form */}
          <div className="contact-form-col">
            <div className="contact-card-box">
              <h3> Inquire with VIP Concierge</h3>
              <p>Submit your itinerary details and our concierge will reach out with a bespoke quotation.</p>

              <form onSubmit={handleContactSubmit}>
                <div className="c-field">
                  <label>Full Name *</label>
                  <input type="text"
                    placeholder="e.g. Thanathat Chaichana"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="c-field">
                  <label>Email Address *</label>
                  <input type="email"
                    placeholder="e.g. customer@domain.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="c-field">
                  <label>Contact Phone</label>
                  <input type="tel"
                    placeholder="e.g. +66 81 234 5678"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  />
                </div>

                <div className="c-field">
                  <label>Subject of Inquiry</label>
                  <select value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  >
                    <option value="Long-Term Luxury Rental (Weekly / Monthly)">Long-Term Luxury Rental (Weekly / Monthly)</option>
                    <option value="Wedding, Media Production & Commercial Shoots">Wedding, Media Production & Commercial Shoots</option>
                    <option value="Executive Chauffeur & Corporate Delegation">Executive Chauffeur & Corporate Delegation</option>
                    <option value="Special Supercar Edition Reservation">Special Supercar Edition Reservation</option>
                    <option value="General Concierge Inquiry">General Concierge Inquiry</option>
                  </select>
                </div>

                <div className="c-field">
                  <label>Additional Requests & Itinerary Details</label>
                  <textarea rows="3"
                    placeholder="Mention your preferred model, rental duration, delivery destination, or bespoke requests..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn-send-contact-gold">
                  <span>Send Inquiry Now </span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
