import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);
    try {
      const payload = { phone };
      if (password) payload.password = password;
      await api.put('/employees/me/profile', payload);
      await refreshUser();
      setSuccess('Profile updated.');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-head">
        <h1>My profile</h1>
        <p>Your personal and employment details.</p>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-title"><h3>Employment details</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
            <Row label="Employee ID" value={user?.employeeId} />
            <Row label="Name" value={user?.name} />
            <Row label="Email" value={user?.email} />
            <Row label="Role" value={user?.role} />
            <Row label="Department" value={user?.department} />
            <Row label="Designation" value={user?.designation} />
            <Row label="Leave balance" value={`${user?.leaveBalance} day(s)`} />
            <Row label="Joined" value={user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '—'} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-title"><h3>Update details</h3></div>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="field">
              <label htmlFor="password">New password</label>
              <input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" />
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
    <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
    <strong style={{ textTransform: label === 'Role' ? 'capitalize' : 'none' }}>{value || '—'}</strong>
  </div>
);

export default Profile;
