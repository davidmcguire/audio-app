import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          VoiceGram
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-item">
            Home
          </Link>
          <Link to="/requests" className="nav-item">
            My Requests
          </Link>
          <Link to="/about" className="nav-item">
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 