import React from "react";
import logo from "../assets/app logo.jpg";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="SupportOS logo" className="logo-icon" />
        <span className="nav-brand">SupportOS</span>
      </div>

      <ul className="nav-links">
        <li>
          <a href="#platform">Platform</a>
        </li>
        <li>
          <a href="#roles">Roles</a>
        </li>
        <li>
          <a href="#features">Features</a>
        </li>
        <li>
          <a href="#roadmap">Roadmap</a>
        </li>
      </ul>

      <div className="nav-right">
        <a className="btn-ghost" href="http://localhost:5173/login">
          Sign In
        </a>
      </div>
    </nav>
  );
}
