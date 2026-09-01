import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';

const HRDashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/dashboard/hr').then(({ data }) => setSummary(data));
  }, []);

  if (!summary) return <div className="loader">Loading dashboard…</div>;

  return (
    <div>
      <div className="page-head">
        <h1>HR overview</h1>
        <p>Headcount and attendance snapshot for {summary.date}.</p>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-value">{summary.totalEmployees}</div>
          <div className="stat-label">Active employees</div>
        </div>
        <div className="stat accent-green">
          <div className="stat-value">{summary.presentToday}</div>
          <div className="stat-label">Present today</div>
        </div>
        <div className="stat accent-amber">
          <div className="stat-value">{summary.lateToday}</div>
          <div className="stat-label">Late today</div>
        </div>
        <div className="stat accent-slate">
          <div className="stat-value">{summary.onLeaveToday}</div>
          <div className="stat-label">On leave today</div>
        </div>
        <div className="stat accent-red">
          <div className="stat-value">{summary.absentToday}</div>
          <div className="stat-label">Absent today</div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-title">
            <h3>Pending leave requests</h3>
            <Link to="/hr/leaves" className="btn btn-outline btn-sm">Review all</Link>
          </div>
          {summary.recentLeaveRequests.length === 0 ? (
            <div className="empty"><h3>Nothing pending</h3><p>All leave requests have been reviewed.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Employee</th><th>From</th><th>To</th><th>Status</th></tr></thead>
                <tbody>
                  {summary.recentLeaveRequests.map((l) => (
                    <tr key={l._id}>
                      <td>{l.employee?.name}</td>
                      <td>{l.startDate}</td>
                      <td>{l.endDate}</td>
                      <td><StatusBadge status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title"><h3>Headcount by department</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
            {summary.departmentBreakdown.map((d) => (
              <div key={d.department} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{d.department}</span>
                <strong>{d.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
