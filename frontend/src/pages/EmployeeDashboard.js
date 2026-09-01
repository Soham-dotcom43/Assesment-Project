import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—');

const EmployeeDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data } = await api.get('/dashboard/me');
    setSummary(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async () => {
    setBusy(true); setError('');
    try {
      await api.post('/attendance/check-in');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally { setBusy(false); }
  };

  const handleCheckOut = async () => {
    setBusy(true); setError('');
    try {
      await api.post('/attendance/check-out');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally { setBusy(false); }
  };

  if (!summary) return <div className="loader">Loading your dashboard…</div>;

  const record = summary.todayRecord;

  return (
    <div>
      <div className="page-head">
        <h1>Good to see you</h1>
        <p>Here's where things stand today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.</p>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-value">{fmtTime(record?.checkIn)}</div>
          <div className="stat-label">Checked in</div>
        </div>
        <div className="stat accent-slate">
          <div className="stat-value">{fmtTime(record?.checkOut)}</div>
          <div className="stat-label">Checked out</div>
        </div>
        <div className="stat accent-green">
          <div className="stat-value">{summary.monthly.totalHours}h</div>
          <div className="stat-label">Hours this month</div>
        </div>
        <div className="stat accent-amber">
          <div className="stat-value">{summary.leaveBalance}</div>
          <div className="stat-label">Leave days remaining</div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-title"><h3>Today</h3>{record && <StatusBadge status={record.status} />}</div>
          <p style={{ color: 'var(--ink-soft)', marginBottom: 18, fontSize: '0.9rem' }}>
            {!record?.checkIn && "You haven't checked in yet today."}
            {record?.checkIn && !record?.checkOut && 'You are checked in. Remember to check out at the end of your day.'}
            {record?.checkIn && record?.checkOut && "You've completed your attendance for today."}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleCheckIn} disabled={busy || !!record?.checkIn}>
              Check in
            </button>
            <button className="btn btn-outline" onClick={handleCheckOut} disabled={busy || !record?.checkIn || !!record?.checkOut}>
              Check out
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title"><h3>This month</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Days present</span><strong>{summary.monthly.presentDays}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Days late</span><strong>{summary.monthly.lateDays}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Days on leave</span><strong>{summary.monthly.leaveDays}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pending leave requests</span><strong>{summary.pendingLeaveRequests}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
