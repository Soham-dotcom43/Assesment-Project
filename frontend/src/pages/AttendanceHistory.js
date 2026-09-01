import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—');

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/attendance/my-history', { params: { month } })
      .then(({ data }) => setRecords(data.records))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div>
      <div className="page-head">
        <h1>My attendance</h1>
        <p>A record of your check-ins, hours, and daily status.</p>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>History</h3>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5 }} />
        </div>

        {loading ? (
          <div className="loader">Loading…</div>
        ) : records.length === 0 ? (
          <div className="empty"><h3>No records for this month</h3><p>Your attendance will appear here once you check in.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th></tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.date}</td>
                    <td>{fmtTime(r.checkIn)}</td>
                    <td>{fmtTime(r.checkOut)}</td>
                    <td>{r.workingHours ? `${r.workingHours}h` : '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
