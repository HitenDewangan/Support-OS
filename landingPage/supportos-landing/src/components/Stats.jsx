import React from 'react'
import './Stats.css'

const STATS = [
  { val: '4',    label: 'Stakeholder Roles' },
  { val: 'RAG',  label: 'Vector DB AI Engine' },
  { val: '0ms',  label: 'Cross-tenant Leakage' },
  { val: '∞',    label: 'Horizontal Scalability' },
]

export default function Stats() {
  return (
    <div className="stats-strip">
      {STATS.map((s, i) => (
        <div className="stat" key={i}>
          <div className="stat-val">{s.val}</div>
          <div className="stat-lbl">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
