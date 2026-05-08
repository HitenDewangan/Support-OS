import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, FileText, Shield, Upload, X, Paperclip } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import useNotification from '../../hooks/useNotification';
import useAuth from '../../hooks/useAuth';
import ticketService from '../../services/ticketService';

const TicketForm = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { selectedBusiness } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'technical',
    priority: 'medium',
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    notification.info(`${selected.length} file(s) attached.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      notification.error('Subject and description are required');
      return;
    }
    if (!selectedBusiness) {
      notification.error('Please select a business from login before submitting a ticket');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const { ticket } = await ticketService.createTicket({
        ...formData,
        businessId: selectedBusiness._id,
      });
      notification.success('Ticket submitted! Our AI is looking into it.');
      navigate(`/customer/chat/${ticket._id}`);
    } catch (err) {
      notification.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-bright)', marginBottom: '8px', paddingLeft: '4px' };
  const selectStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', fontSize: '15px', outline: 'none', appearance: 'none' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-bright)', marginBottom: '8px' }}>Create Support Ticket</h2>
          <p style={{ color: 'var(--text)', fontSize: '15px' }}>Describe your issue and our AI will respond immediately.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Input
            label="Issue Subject"
            placeholder="e.g. Dashboard not loading"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            icon={FileText}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select style={selectStyle} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing & Payments</option>
                <option value="account">Account Access</option>
                <option value="feature">Feature Request</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={selectStyle} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows="5"
              placeholder="Describe your issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', fontSize: '15px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Attachments (optional)</label>
            <div
              onClick={() => fileInputRef.current.click()}
              style={{ padding: '32px', border: '2px dashed var(--border)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg)' }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple onChange={handleFileChange} />
              <Upload size={32} style={{ color: 'var(--text)', marginBottom: '12px', opacity: 0.5 }} />
              <div style={{ fontWeight: '600', color: 'var(--text-bright)' }}>Click to upload</div>
              <div style={{ fontSize: '13px', color: 'var(--text)', marginTop: '4px' }}>PNG, JPG, PDF up to 10MB</div>
            </div>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
                {files.map((file, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'var(--accent-muted)', borderRadius: '8px' }}>
                    <Paperclip size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)' }}>{file.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
            <Button variant="ghost" type="button" onClick={() => navigate('/customer')}>Cancel</Button>
            <Button type="submit" variant="primary" icon={Send} loading={loading}>Submit Ticket</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
