import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtTime = (iso) => (iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—');

const STATUS_OPTIONS = ['present', 'late', 'half-day', 'absent', 'on-leave'];

const AttendanceRecords = () => {
  const [date, setDate] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/attendance/all', { params: { date } });
    setRecords(data.records);
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await api.put(`/attendance/${id}`, { status });
    setEditingId(null);
    load();
  };

  return (
    <div>
      <div className="page-head">
        <h1>Attendance records</h1>
        <p>Review and adjust daily attendance across the company.</p>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Records</h3>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5 }} />
        </div>

        {loading ? (
          <div className="loader">Loading…</div>
        ) : records.length === 0 ? (
          <div className="empty"><h3>No records for this date</h3><p>No one has checked in yet, or no adjustments have been made.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Employee</th><th>Department</th><th>Check-in</th><th>Check-out</th><th>Hours</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>{r.employee?.name} <span style={{ color: 'var(--ink-soft)', fontSize: '0.78rem' }}>({r.employee?.employeeId})</span></td>
                    <td>{r.employee?.department}</td>
                    <td>{fmtTime(r.checkIn)}</td>
                    <td>{fmtTime(r.checkOut)}</td>
                    <td>{r.workingHours ? `${r.workingHours}h` : '—'}</td>
                    <td>
                      {editingId === r._id ? (
                        <select defaultValue={r.status} onChange={(e) => updateStatus(r._id, e.target.value)} autoFocus onBlur={() => setEditingId(null)}>
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <StatusBadge status={r.status} />
                      )}
                    </td>
                    <td>
                      {editingId !== r._id && (
                        <button className="btn btn-outline btn-sm" onClick={() => setEditingId(r._id)}>Adjust</button>
                      )}
                    </td>
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

export default AttendanceRecords;
