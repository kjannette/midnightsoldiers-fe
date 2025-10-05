import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="navigation">
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Midnight Soldiers
          </Link>
          <Link to="/news" className="nav-link">
            News
          </Link>
          <Link to="/rumors-lies" className="nav-link">
            Rumors & Lies
          </Link>
          <span className="nav-link disabled">Artists</span>
          <span className="nav-link disabled">Contact</span>
        </div>
        <div className="nav-subscribe">
          <Link to="/subscribe" className="nav-link">
            Subscribe
          </Link>
        </div>
      </nav>

      {/* Mobile Hamburger Menu */}
      <div className="mobile-nav-container">
        <button className="hamburger-button" onClick={toggleMenu}>
          お
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu">
          <button className="close-button" onClick={closeMenu}>
            ×
          </button>
          <div className="mobile-nav-links">
            <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
              Midnight Soldiers
            </Link>
            <Link to="/news" className="mobile-nav-link" onClick={closeMenu}>
              News
            </Link>
            <Link
              to="/rumors-lies"
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              Rumors & Lies
            </Link>
            <span className="mobile-nav-link disabled">Artists</span>
            <span className="mobile-nav-link disabled">Contact</span>
            <Link
              to="/subscribe"
              className="mobile-nav-link"
              onClick={closeMenu}
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
