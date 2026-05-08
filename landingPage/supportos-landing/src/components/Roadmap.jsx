import React from 'react'
import './Roadmap.css'

const ITEMS = [
  {
    icon: '🎙️',
    title: 'Voice Support',
    desc: 'Real-time voice interaction with AI agents across all tenants.',
    badge: 'Q3 2025',
  },
  {
    icon: '🌐',
    title: 'Multi-Language AI',
    desc: 'Multilingual intent detection and RAG-grounded responses.',
    badge: 'Q4 2025',
  },
  {
    icon: '🤖',
    title: 'Autonomous Agents',
    desc: 'Multi-step task execution — refunds, rescheduling, lookups — without human intervention.',
    badge: '2026',
  },
  {
    icon: '📈',
    title: 'Advanced Analytics',
    desc: 'Deep performance dashboards for tenants to track agent efficiency and AI accuracy.',
    badge: '2026',
  },
]

export default function Roadmap() {
  return (
    <section className="section" style={{ paddingTop: 0 }} id="roadmap">
      <div className="eyebrow">Future Roadmap</div>
      <h2 className="sec-title">What's coming next</h2>
      <p className="sec-sub">SupportOS is just getting started. Here's what's on the horizon.</p>

      <div className="roadmap-list">
        {ITEMS.map((item) => (
          <div className="rm-item" key={item.title}>
            <div className="rm-icon">{item.icon}</div>
            <div className="rm-text">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
            <div className="rm-badge">{item.badge}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
