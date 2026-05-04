import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { useSocket } from '../../hooks/useSocket';
import ticketService from '../../services/ticketService';
import useAuth from '../../hooks/useAuth';

const ChatWindow = ({ ticketId, contactName = 'Support', senderRole = 'customer', aiSuggestion, onAISuggestionUsed }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherTyperName, setOtherTyperName] = useState('');
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const { on, emit } = useSocket(ticketId);

  // Load existing messages
  useEffect(() => {
    if (!ticketId) return;
    ticketService.getTicketById(ticketId)
      .then(({ messages: msgs }) => setMessages(msgs || []))
      .catch(() => {});
  }, [ticketId]);

  // Listen for new messages and typing via socket
  useEffect(() => {
    if (!ticketId) return;

    const offMessage = on('new-message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    const offTyping = on('user-typing', ({ isTyping, senderName }) => {
      setIsOtherTyping(isTyping);
      setOtherTyperName(senderName || '');
    });

    return () => {
      offMessage?.();
      offTyping?.();
    };
  }, [ticketId, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleTyping = () => {
    emit('typing', { ticketId, isTyping: true, senderName: user?.name });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emit('typing', { ticketId, isTyping: false, senderName: user?.name });
    }, 1500);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !ticketId) return;

    setSending(true);
    const text = inputText.trim();
    setInputText('');
    emit('typing', { ticketId, isTyping: false });

    try {
      await ticketService.addMessage(ticketId, text);
      // Socket will broadcast the new message back
    } catch (err) {
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const useAISuggestion = () => {
    if (!aiSuggestion) return;
    setInputText(aiSuggestion);
    onAISuggestionUsed?.();
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const containerStyle = {
    display: 'flex', flexDirection: 'column', height: '100%',
    backgroundColor: 'var(--surface)', borderRadius: '16px',
    border: '1px solid var(--border)', overflow: 'hidden',
    boxShadow: 'var(--shadow)',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#ffffff' }}>
        <div style={{ position: 'relative' }}>
          <Avatar name={contactName} size="medium" />
          <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '9px', height: '9px', backgroundColor: 'var(--success)', borderRadius: '50%', border: '2px solid white' }} />
        </div>
        <div>
          <div style={{ fontWeight: '700', color: 'var(--text-bright)', fontSize: '15px' }}>{contactName}</div>
          <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flexGrow: 1, padding: '20px 24px', overflowY: 'auto', backgroundColor: '#f8fafc', backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(124,58,237,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.02) 0%, transparent 50%)', display: 'flex', flexDirection: 'column', gap: '0' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text)', fontSize: '14px', marginTop: '40px', opacity: 0.6 }}>
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            text={msg.content}
            sender={msg.sender === senderRole ? 'agent' : msg.sender === 'ai' ? 'ai' : 'customer'}
            timestamp={formatTime(msg.createdAt)}
            isAI={msg.sender === 'ai'}
          />
        ))}
        {isOtherTyping && <TypingIndicator name={otherTyperName} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
        {/* AI Suggestion banner (shown to agents) */}
        {aiSuggestion && senderRole === 'agent' && (
          <div style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-border)', borderRadius: '12px', padding: '10px 14px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>
              <Sparkles size={14} fill="currentColor" /> AI Suggested Reply
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-bright)', lineHeight: '1.4' }}>"{aiSuggestion}"</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="primary" size="small" onClick={useAISuggestion}>Use Reply</Button>
              <Button variant="outline" size="small" onClick={() => setInputText(aiSuggestion)}>Edit</Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            placeholder="Type a message…"
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); handleTyping(); }}
            disabled={!ticketId}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '14px',
              border: '1.5px solid var(--border)', outline: 'none', fontSize: '14px',
              backgroundColor: '#f8fafc', transition: 'border-color 0.2s, background-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.backgroundColor = '#fff'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.backgroundColor = '#f8fafc'; }}
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim() || !ticketId}
            style={{
              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
              background: (sending || !inputText.trim()) ? '#e2e8f0' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: (sending || !inputText.trim()) ? '#94a3b8' : 'white', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: (sending || !inputText.trim()) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: (sending || !inputText.trim()) ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
            }}
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
