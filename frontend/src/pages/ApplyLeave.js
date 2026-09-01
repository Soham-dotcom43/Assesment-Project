import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const ApplyLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/leaves/my');
    setLeaves(data.leaves);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await api.post('/leaves', form);
      setSuccess('Leave request submitted for review.');
      setForm({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally { setSubmitting(false); }
  };

  const cancel = async (id) => {
    await api.put(`/leaves/${id}/cancel`);
    load();
  };

  return (
    <div>
      <div className="page-head">
        <h1>Leave requests</h1>
        <p>Apply for time off and track the status of your requests.</p>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-title"><h3>Request history</h3></div>
          {loading ? (
            <div className="loader">Loading…</div>
          ) : leaves.length === 0 ? (
            <div className="empty"><h3>No leave requests yet</h3><p>Submit your first request using the form.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l._id}>
                      <td style={{ textTransform: 'capitalize' }}>{l.leaveType}</td>
                      <td>{l.startDate}</td>
                      <td>{l.endDate}</td>
                      <td>{l.days}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>
                        {l.status === 'pending' && (
                          <button className="btn btn-outline btn-sm" onClick={() => cancel(l._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title"><h3>New request</h3></div>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="leaveType">Leave type</label>
              <select id="leaveType" value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
                <option value="casual">Casual</option>
                <option value="sick">Sick</option>
                <option value="earned">Earned</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="startDate">Start date</label>
                <input id="startDate" type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="endDate">End date</label>
                <input id="endDate" type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="reason">Reason</label>
              <textarea id="reason" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Briefly describe why you're requesting leave" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
