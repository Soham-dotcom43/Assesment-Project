import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', department: '', designation: '',
  });
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your account.');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="brand">Inner Eye Consultancy Services LLP</div>
        <div>
          <h1>Set up your account in under a minute.</h1>
          <p>Once you're in, you can check in for the day, track your hours, and apply for leave whenever you need to.</p>
        </div>
        <p style={{ fontSize: '0.8rem' }}>Employee Attendance Management System</p>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p className="sub">New accounts are registered as employees by default.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" required value={form.name} onChange={update('name')} placeholder="Jordan Rivera" />
            </div>
            <div className="field">
              <label htmlFor="email">Work email</label>
              <input id="email" type="email" required value={form.email} onChange={update('email')} placeholder="you@innereye.com" />
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="department">Department</label>
                <input id="department" value={form.department} onChange={update('department')} placeholder="Engineering" />
              </div>
              <div className="field">
                <label htmlFor="designation">Designation</label>
                <input id="designation" value={form.designation} onChange={update('designation')} placeholder="Software Developer" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={6} value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
