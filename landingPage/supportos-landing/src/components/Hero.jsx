import React from 'react'
import './Hero.css'

/* ── Small sub-components ── */
function Badge() {
  return (
    <div className="hero-badge">
      <span className="badge-dot" />
      AI-Powered · Multi-Tenant · Real-Time
    </div>
  )
}

function LiveDot() {
  return <span className="live-dot" />
}

function Tag({ type, children }) {
  return <span className={`ticket-tag tag-${type}`}>{children}</span>
}

/* ── The 4 anti-gravity floating cards ── */
function FloatingCards() {
  return (
    <div className="float-zone" aria-hidden="true">

      {/* Card 1 — AI Routing accuracy */}
      <div className="fc fc-1">
        <div className="fc-head">AI Routing Engine</div>
        <div className="fc-val cyan">98.4%</div>
        <div className="fc-sub green">↑ Intent match accuracy</div>
        <div className="live-row">
          <LiveDot />
          Processing queries live
        </div>
      </div>

      {/* Card 2 — Active ticket queue */}
      <div className="fc fc-2">
        <div className="fc-head">Active Tickets</div>
        <div className="ticket-list">
          <div className="ticket-row">
            <span>#T-1042 — Refund</span>
            <Tag type="ai">AI</Tag>
          </div>
          <div className="ticket-row">
            <span>#T-1043 — Login</span>
            <Tag type="resolved">Done</Tag>
          </div>
          <div className="ticket-row">
            <span>#T-1044 — Delivery</span>
            <Tag type="human">Agent</Tag>
          </div>
        </div>
      </div>

      {/* Card 3 — Tenant selector */}
      <div className="fc fc-3">
        <div className="fc-head">Tenant Session</div>
        <div className="tenant-list">
          <div className="tenant-item active">🛒 Amazon Support</div>
          <div className="tenant-item">🍕 Zomato Support</div>
          <div className="tenant-item">⚡ Zepto Support</div>
        </div>
      </div>

      {/* Card 4 — Escalation alert */}
      <div className="fc fc-4">
        <div className="fc-head">Escalation Alert</div>
        <div className="fc-esc-msg">High frustration detected</div>
        <div className="fc-esc-route">⚡ Routing to human agent...</div>
      </div>

    </div>
  )
}

/* ── Main Hero ── */
export default function Hero() {
  return (
    <section className="hero" id="platform">
      <div className="hero-bg" />

      <div className="hero-grid">
        {/* Left — copy */}
        <div className="hero-left">
          <Badge />
          <h1>
            Customer Support,<br />
            <span className="grad">Intelligently Routed</span>
          </h1>
          <p>
            SupportOS is a multi-tenant platform that unifies AI query
            handling, smart agent escalation, and real-time chat — across
            every brand, at any scale.
          </p>
          <div className="hero-btns">
            <a className="btn-primary" href="http://localhost:5173/register">Get Early Access →</a>
          </div>
          <div className="trust-row">
            <div className="trust-dots">
              <span className="tdot" />
              <span className="tdot" />
              <span className="tdot" />
              <span className="tdot" />
            </div>
            Built on MERN · Socket.IO · Vector DB RAG
          </div>
        </div>

        {/* Right — anti-gravity cards */}
        <div className="hero-right">
          <FloatingCards />
        </div>
      </div>
    </section>
  )
}
