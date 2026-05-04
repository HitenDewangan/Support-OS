import React from 'react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <div className="footer-logo-icon">🛟</div>
        SupportOS
      </div>
      <div className="footer-copy">
        © 2025 SupportOS. AI-Powered Multi-Tenant Customer Support Platform.
      </div>
      <div className="footer-links">
        <a href="#">PRD Docs</a>
        <a href="#">GitHub</a>
        <a href="#">Privacy</a>
      </div>
    </footer>
  )
}
