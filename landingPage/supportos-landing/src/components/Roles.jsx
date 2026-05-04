import React from 'react'
import './Roles.css'

const ROLES = [
  {
    icon: '👑',
    label: 'Role',
    name: 'Superadmin',
    desc: 'Platform owner. Manages global tenants, billing, system-wide configuration, and infrastructure health across all brands.',
    path: '/superadmin/dashboard',
    mod: 'rc-sa',
  },
  {
    icon: '🏢',
    label: 'Role',
    name: 'Tenant Admin',
    desc: 'Client business owner. Manages brand-specific agents, configures the Vector DB knowledge base, and reviews service analytics.',
    path: '/tenant/admin',
    mod: 'rc-te',
  },
  {
    icon: '🎧',
    label: 'Role',
    name: 'Support Agent',
    desc: 'Human support staff. Receives only escalated tickets from the AI — complex or high-frustration sessions that need a human touch.',
    path: '/agent/workspace',
    mod: 'rc-ag',
  },
  {
    icon: '💬',
    label: 'Role',
    name: 'Customer',
    desc: 'End user. Interacts with the AI-powered semantic chatbot, selects their brand context, and gets instant, knowledge-grounded answers.',
    path: '/customer/portal',
    mod: 'rc-cu',
  },
]

export default function Roles() {
  return (
    <section className="section" id="roles">
      <div className="eyebrow">Access Control</div>
      <h2 className="sec-title">Four Roles. One Unified Login.</h2>
      <p className="sec-sub">
        Every stakeholder lands in the right place — automatically routed
        based on their role after a single authentication point.
      </p>

      <div className="roles-grid">
        {ROLES.map((r) => (
          <div className={`role-card ${r.mod}`} key={r.name}>
            <div className="role-icon">{r.icon}</div>
            <div className="role-label">{r.label}</div>
            <div className="role-name">{r.name}</div>
            <p className="role-desc">{r.desc}</p>
            <span className="role-path">→ {r.path}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
