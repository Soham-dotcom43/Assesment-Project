import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'employee' ? '/' : '/hr');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Check your details and try again.');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="brand">Inner Eye Consultancy Services LLP</div>
        <div>
          <h1>One place to track who's in, who's out, and who's owed a day off.</h1>
          <p>Sign in to log your hours, request leave, or review your team's attendance for the day.</p>
        </div>
        <p style={{ fontSize: '0.8rem' }}>Employee Attendance Management System</p>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your account to continue.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Work email</label>
              <input
                id="email" type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@innereye.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password" type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="switch">
            New here? <Link to="/register">Create an employee account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
