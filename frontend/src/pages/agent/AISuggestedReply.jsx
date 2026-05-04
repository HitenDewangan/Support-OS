import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Edit2, Zap, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import aiService from '../../services/aiService';

const AISuggestedReply = ({ ticketId, onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    if (!ticketId) return;
    setLoading(true);
    try {
      const data = await aiService.getSuggestedReply(ticketId);
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [ticketId]);

  const cardStyle = {
    padding: '24px', backgroundColor: 'var(--accent-muted)',
    border: '1px solid var(--accent-border)', borderRadius: '16px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  };

  const suggestionStyle = {
    padding: '14px', backgroundColor: 'rgba(255,255,255,0.6)',
    border: '1px solid var(--border)', borderRadius: '12px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '800', fontSize: '15px' }}>
          <Sparkles size={20} fill="currentColor" /> AI MAGIC REPLIES
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: '600' }}>
            <Zap size={11} style={{ display: 'inline', marginRight: '3px' }} />GEMINI AI
          </span>
          <button onClick={fetchSuggestions} disabled={loading} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex', padding: '4px' }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text)', fontSize: '13px' }}>
          Generating AI suggestions...
        </div>
      ) : suggestions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text)', fontSize: '13px' }}>
          No suggestions yet.{' '}
          <button onClick={fetchSuggestions} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            Generate
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {suggestions.map((s, i) => (
            <div key={i} style={suggestionStyle}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {s.tone} • {s.confidence}% Match
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-bright)', lineHeight: '1.5' }}>"{s.text}"</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="primary" size="small" icon={Check} onClick={() => onSelect?.(s.text)}>Use Reply</Button>
                <Button variant="outline" size="small" icon={Edit2} onClick={() => onSelect?.(s.text)}>Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AISuggestedReply;
