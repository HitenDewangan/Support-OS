import React from 'react';
import { Bot, User } from 'lucide-react';

const MessageBubble = ({ text, sender, timestamp, isAI }) => {
  const isAgent = sender === 'agent';

  if (isAI) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px', width: '100%' }}>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '78%' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, marginTop: '2px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
          }}>
            <Bot size={15} color="white" />
          </div>
          <div>
            <div style={{
              fontSize: '10px', fontWeight: '700', color: '#7c3aed',
              marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              AI Assistant
            </div>
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(168,85,247,0.05))',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '4px 16px 16px 16px',
              fontSize: '14px', lineHeight: '1.55', color: '#0f172a',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              {text}
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px', display: 'block' }}>{timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  if (isAgent) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px', width: '100%' }}>
        <div style={{ maxWidth: '75%' }}>
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            borderRadius: '16px 4px 16px 16px',
            fontSize: '14px', lineHeight: '1.55', color: '#ffffff',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}>
            {text}
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px', display: 'block', textAlign: 'right' }}>
            {timestamp}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '14px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '10px', maxWidth: '75%' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, marginTop: '2px',
          backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={15} color="#64748b" />
        </div>
        <div>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px 16px 16px 16px',
            fontSize: '14px', lineHeight: '1.55', color: '#0f172a',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            {text}
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px', display: 'block' }}>{timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
