import React from 'react'
import './CTA.css'

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-bg" />

      <h2>Ship SupportOS.<br />Ship smarter support.</h2>
      <p>
        Join the waitlist and be first to deploy the most intelligent
        multi-tenant support platform built on the MERN stack.
      </p>

      <div className="cta-cards">
        <div className="cta-card">
          <div className="cta-card-label">Architecture</div>
          <div className="cta-card-val cyan">MERN + RAG</div>
        </div>
        <div className="cta-card">
          <div className="cta-card-label">Roles Supported</div>
          <div className="cta-card-val purple">4 Stakeholders</div>
        </div>
        <div className="cta-card">
          <div className="cta-card-label">Data Isolation</div>
          <div className="cta-card-val green">Guaranteed</div>
        </div>
      </div>

    </section>
  )
}
