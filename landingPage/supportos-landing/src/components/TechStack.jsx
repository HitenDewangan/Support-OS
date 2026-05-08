import React from 'react'
import './TechStack.css'

const STACK = [
  { icon: '🍃', name: 'MongoDB',    role: 'Database' },
  { icon: '🚂', name: 'Express.js', role: 'API Server' },
  { icon: '⚛️', name: 'React',      role: 'Frontend' },
  { icon: '🟢', name: 'Node.js',    role: 'Runtime' },
  { icon: '🔌', name: 'Socket.IO',  role: 'Real-Time' },
  { icon: '🗄️', name: 'Redis',      role: 'Pub/Sub Adapter' },
  { icon: '🧬', name: 'Vector DB',  role: 'RAG Engine' },
  { icon: '🤖', name: 'AI API',     role: 'Intent & NLU' },
]

export default function TechStack() {
  return (
    <section className="section">
      <div className="eyebrow">Tech Stack</div>
      <h2 className="sec-title">Powered by proven technology</h2>
      <p className="sec-sub">
        A modern MERN stack with real-time infrastructure and
        AI-native data retrieval.
      </p>

      <div className="stack-grid">
        {STACK.map((s) => (
          <div className="stack-card" key={s.name}>
            <div className="stack-icon">{s.icon}</div>
            <div className="stack-name">{s.name}</div>
            <div className="stack-role">{s.role}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
