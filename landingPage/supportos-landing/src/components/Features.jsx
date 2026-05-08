import React from 'react'
import './Features.css'

const FEATURES = [
  {
    icon: '🧠',
    color: 'f-blue',
    title: 'RAG-Powered AI Responses',
    desc: 'Retrieval-Augmented Generation queries your tenant\'s Vector DB to return grounded, accurate answers — not hallucinations.',
  },
  {
    icon: '⚡',
    color: 'f-cyan',
    title: 'Real-Time Sync via Socket.IO',
    desc: 'All server instances stay in sync using Socket.IO with a Redis Adapter — stateless, scalable, zero message loss.',
  },
  {
    icon: '🔒',
    color: 'f-purple',
    title: 'Strict Data Isolation',
    desc: 'Agents and tenants are hard-partitioned by tenant_id. Zero access to outside data — enforced at the DB and Vector DB layer.',
  },
  {
    icon: '🤝',
    color: 'f-green',
    title: 'Human-in-the-Loop Routing',
    desc: 'Frustration signals and knowledge gaps trigger instant escalation to a live human agent — no manual handoff needed.',
  },
  {
    icon: '🏢',
    color: 'f-amber',
    title: 'Multi-Tenant Architecture',
    desc: 'Onboard unlimited brands under one platform. Each tenant gets isolated knowledge, agents, analytics, and configuration.',
  },
  {
    icon: '📊',
    color: 'f-pink',
    title: 'Tenant Analytics Dashboard',
    desc: 'Tenant admins monitor agent performance, AI accuracy, resolution rates, and customer satisfaction — all in one view.',
  },
]

export default function Features() {
  return (
    <section className="section features-section" id="features">
      <div className="eyebrow">Core Features</div>
      <h2 className="sec-title">Built for scale. Designed for trust.</h2>
      <p className="sec-sub">
        Every layer of SupportOS is engineered for data isolation,
        real-time sync, and intelligent automation.
      </p>

      <div className="feat-grid">
        {FEATURES.map((f) => (
          <div className="feat" key={f.title}>
            <div className={`feat-icon ${f.color}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
