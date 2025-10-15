import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOutAdmin } from "../firebase/services";
import "./Navigation.css";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Only show logout button on /videoinfo page
  const showLogoutButton = isAuthenticated && location.pathname === "/videoinfo";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      logout();
      navigate("/");
      closeMenu();
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
          {showLogoutButton && (
            <button onClick={handleLogout} className="nav-link logout-button">
              Logout
            </button>
          )}
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
            {showLogoutButton && (
              <button onClick={handleLogout} className="mobile-nav-link logout-button">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
