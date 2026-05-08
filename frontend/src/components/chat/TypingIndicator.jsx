import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator = ({ name }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '14px' }}>
    <div style={{
      width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
    }}>
      <Bot size={15} color="white" />
    </div>
    <div>
      {name && (
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {name}
        </div>
      )}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '12px 16px', backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '4px 16px 16px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <style>{`
          @keyframes dotPulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50%       { opacity: 1;   transform: scale(1);   }
          }
        `}</style>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            animation: 'dotPulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  </div>
);

export default TypingIndicator;
