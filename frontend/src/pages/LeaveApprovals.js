import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const LeaveApprovals = () => {
  const [status, setStatus] = useState('pending');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteDraft, setNoteDraft] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/leaves', { params: status ? { status } : {} });
    setLeaves(data.leaves);
    setLoading(false);
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const review = async (id, decision) => {
    await api.put(`/leaves/${id}/review`, { decision, reviewNote: noteDraft[id] || '' });
    load();
  };

  return (
    <div>
      <div className="page-head">
        <h1>Leave approvals</h1>
        <p>Approve or reject employee leave requests. Approved leave is deducted from balance automatically.</p>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Requests</h3>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5 }}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>

        {loading ? (
          <div className="loader">Loading…</div>
        ) : leaves.length === 0 ? (
          <div className="empty"><h3>Nothing here</h3><p>No leave requests match this filter.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {leaves.map((l) => (
              <div key={l._id} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div>
                    <strong>{l.employee?.name}</strong>
                    <span style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}> · {l.employee?.department} · balance {l.employee?.leaveBalance} day(s)</span>
                  </div>
                  <StatusBadge status={l.status} />
                </div>
                <p style={{ fontSize: '0.88rem', marginBottom: 6 }}>
                  <span style={{ textTransform: 'capitalize' }}>{l.leaveType}</span> leave · {l.startDate} to {l.endDate} · {l.days} day(s)
                </p>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: 12 }}>{l.reason}</p>

                {l.status === 'pending' && (
                  <>
                    <input
                      placeholder="Optional note for the employee"
                      value={noteDraft[l._id] || ''}
                      onChange={(e) => setNoteDraft({ ...noteDraft, [l._id]: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5, marginBottom: 10 }}
                    />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => review(l._id, 'approved')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => review(l._id, 'rejected')}>Reject</button>
                    </div>
                  </>
                )}
                {l.reviewNote && l.status !== 'pending' && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>Note: {l.reviewNote}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovals;
