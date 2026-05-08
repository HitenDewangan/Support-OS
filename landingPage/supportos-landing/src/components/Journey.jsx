import React from 'react'
import './Journey.css'

const STEPS = [
  {
    num: '1',
    title: 'Unified Login & Role Detection',
    desc: 'All stakeholders log in through a single entry point. The system checks the database and redirects each user to their role-specific workspace automatically — no manual routing.',
    tag: 'RBAC + JWT Auth',
  },
  {
    num: '2',
    title: 'Tenant Selector Screen',
    desc: 'Customers see a "Where do you need help today?" screen. A grid shows previously interacted brands (Amazon, Zepto, Zomato). A search bar lets them initialize support for new companies on the fly.',
    tag: 'Multi-Tenant Context',
  },
  {
    num: '3',
    title: 'Tenant-Scoped AI Chat Session',
    desc: 'Selecting a brand sets a tenant_id context. The AI only retrieves knowledge from that company\'s Vector DB namespace — zero cross-brand data leakage guaranteed.',
    tag: 'Vector DB RAG',
  },
  {
    num: '4',
    title: 'Semantic Intent & Cross-Tenant Detection',
    desc: 'If a customer is on Amazon support but asks about a Zomato order, the AI detects the mismatch and prompts: "It seems you\'re asking about Zomato. Would you like to switch support contexts?"',
    tag: 'Real-Time Intent Analysis',
  },
  {
    num: '5',
    title: 'Human-in-the-Loop Escalation',
    desc: 'If the AI detects high frustration or an out-of-knowledge-base query, it automatically routes the session to an available Support Agent in real-time via Socket.IO.',
    tag: 'Auto-Escalation Engine',
  },
]

export default function Journey() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="eyebrow">Customer Journey</div>
      <h2 className="sec-title">The Intelligent Routing Flow</h2>
      <p className="sec-sub">
        From login to resolution — every step is automated, context-aware,
        and tenant-isolated.
      </p>

      <div className="flow-wrap">
        {STEPS.map((s) => (
          <div className="flow-step" key={s.num}>
            <div className="flow-num">{s.num}</div>
            <div className="flow-body">
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
              <span className="flow-tag">{s.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
