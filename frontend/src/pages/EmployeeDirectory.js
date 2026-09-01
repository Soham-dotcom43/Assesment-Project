import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', department: '', designation: '', role: 'employee' };

const EmployeeDirectory = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get('/employees', { params: search ? { search } : {} });
    setEmployees(data.employees);
    setLoading(false);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const onCreate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.post('/employees', form);
      setSuccess('Employee added.');
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const toggleActive = async (emp) => {
    if (emp.isActive) {
      await api.delete(`/employees/${emp._id}`);
    } else {
      await api.put(`/employees/${emp._id}`, { isActive: true });
    }
    load();
  };

  return (
    <div>
      <div className="page-head">
        <h1>Employee directory</h1>
        <p>Search employees, and add new accounts directly.</p>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>All employees ({employees.length})</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              placeholder="Search by name, email, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 5 }}
            />
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Close' : 'Add employee'}
            </button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={onCreate} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 18, marginBottom: 20 }}>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}
            <div className="form-row">
              <div className="field">
                <label>Full name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Department</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="field">
                <label>Designation</label>
                <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Temporary password</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              {user?.role === 'admin' && (
                <div className="field">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
            </div>
            <button className="btn btn-primary">Save employee</button>
          </form>
        )}

        {loading ? (
          <div className="loader">Loading…</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Leave balance</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.name}<br /><span style={{ color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{emp.email}</span></td>
                    <td>{emp.department}</td>
                    <td style={{ textTransform: 'capitalize' }}>{emp.role}</td>
                    <td>{emp.leaveBalance}</td>
                    <td>{emp.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      {user?.role === 'admin' && (
                        <button className="btn btn-outline btn-sm" onClick={() => toggleActive(emp)}>
                          {emp.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
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

export default EmployeeDirectory;
