import React, { useState, useEffect } from 'react';
import { Building2, Search, ShieldCheck, Users, Globe, MoreVertical, CheckCircle, XCircle, Plus, X, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import tenantService from '../../services/tenantService';
import useNotification from '../../hooks/useNotification';

const emptyForm = { name: '', email: '', companyName: '', tenantId: '', password: '' };

const TenantList = () => {
  const notification = useNotification();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [createLoading, setCreateLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loadTenants = () => {
    setLoading(true);
    tenantService.getTenants()
      .then((data) => setTenants(data.businesses || []))
      .catch(() => notification.error('Failed to load businesses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleApprove = async (id, name) => {
    setActionLoading(id + '_approve');
    try {
      await tenantService.approveTenant(id);
      notification.success(`${name} has been approved`);
      loadTenants();
    } catch (error) {
      notification.error(error.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject and delete ${name}? This cannot be undone.`)) return;
    setActionLoading(id + '_reject');
    try {
      await tenantService.rejectTenant(id);
      notification.success(`${name} has been rejected`);
      loadTenants();
    } catch (error) {
      notification.error(error.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await tenantService.createTenant(formData);
      notification.success(`Business "${formData.companyName}" created successfully`);
      setShowModal(false);
      setFormData(emptyForm);
      loadTenants();
    } catch (error) {
      notification.error(error.response?.data?.message || 'Failed to create tenant');
    } finally {
      setCreateLoading(false);
    }
  };

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.companyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && t.isApproved) ||
      (statusFilter === 'pending' && !t.isApproved);
    return matchesSearch && matchesStatus;
  });

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    color: 'var(--text-bright)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ color: 'var(--text-bright)', fontSize: '24px', fontWeight: '700' }}>Business Management</h1>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>Manage business tenants and approve registrations.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
          Create New Tenant
        </Button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}>
            <button
              onClick={() => { setShowModal(false); setFormData(emptyForm); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ color: 'var(--text-bright)', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Create New Tenant</h2>
            <p style={{ color: 'var(--text)', fontSize: '13px', marginBottom: '24px' }}>The business admin account will be created and approved immediately.</p>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Admin Name</label>
                <input
                  style={inputStyle}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Admin Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  placeholder="admin@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Business Name</label>
                <input
                  style={inputStyle}
                  placeholder="Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Business ID <span style={{ fontWeight: '400', color: 'var(--text)', fontSize: '12px' }}>(unique identifier customers use to register)</span></label>
                <input
                  style={inputStyle}
                  placeholder="acme-corp"
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Temporary Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    style={{ ...inputStyle, paddingRight: '40px' }}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  onClick={() => { setShowModal(false); setFormData(emptyForm); }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" fullWidth loading={createLoading}>
                  Create Tenant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
          <input
            placeholder="Search by name, company or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Active', 'Pending'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f.toLowerCase())}
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: statusFilter === f.toLowerCase() ? 'var(--accent)' : 'transparent', color: statusFilter === f.toLowerCase() ? 'white' : 'var(--text)', border: 'none' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text)' }}>Loading businesses...</div>
        ) : filtered.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
                  <th style={{ padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px' }}>BUSINESS</th>
                  <th style={{ padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px' }}>COMPANY</th>
                  <th style={{ padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px' }}>BUSINESS ID</th>
                  <th style={{ padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px' }}>STATUS</th>
                  <th style={{ padding: '16px', color: 'var(--text)', fontWeight: '600', fontSize: '13px' }}>REGISTERED</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: '700', fontSize: '14px' }}>
                          {tenant.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-bright)', fontWeight: '600', fontSize: '14px' }}>{tenant.name}</div>
                          <div style={{ color: 'var(--text)', fontSize: '12px' }}>{tenant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text)', fontSize: '13px' }}>
                        <Building2 size={14} />
                        {tenant.companyName || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {tenant.tenantId ? (
                        <code style={{ fontSize: '12px', backgroundColor: 'var(--bg)', padding: '3px 8px', borderRadius: '6px', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                          {tenant.tenantId}
                        </code>
                      ) : (
                        <span style={{ color: 'var(--text)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <Badge variant={tenant.isApproved ? 'success' : 'warning'}>
                        {tenant.isApproved ? 'APPROVED' : 'PENDING'}
                      </Badge>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text)', fontSize: '13px' }}>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!tenant.isApproved && (
                          <>
                            <Button
                              variant="primary"
                              size="small"
                              icon={CheckCircle}
                              loading={actionLoading === tenant._id + '_approve'}
                              onClick={() => handleApprove(tenant._id, tenant.name)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="small"
                              icon={XCircle}
                              loading={actionLoading === tenant._id + '_reject'}
                              onClick={() => handleReject(tenant._id, tenant.name)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {tenant.isApproved && (
                          <Button variant="ghost" size="small" icon={MoreVertical} onClick={() => notification.info(`Options for ${tenant.name}`)} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-bright)', fontSize: '18px', fontWeight: '700' }}>No businesses found</h3>
            <p style={{ color: 'var(--text)', fontSize: '14px', marginTop: '8px' }}>
              {searchQuery ? 'Try adjusting your search.' : 'No business registrations yet.'}
            </p>
          </div>
        )}
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
          <span style={{ fontSize: '13px', color: 'var(--text)' }}>
            Showing {filtered.length} of {tenants.length} businesses
          </span>
        </div>
      </div>
    </div>
  );
};

export default TenantList;
