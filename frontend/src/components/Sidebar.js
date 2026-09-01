import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        Inner&nbsp;Eye
        <span>ATTENDANCE SYSTEM</span>
      </div>

      <nav className="sidebar-nav">
        {isHR ? (
          <>
            <NavLink to="/hr" end className={({ isActive }) => (isActive ? 'active' : '')}>Overview</NavLink>
            <NavLink to="/hr/attendance" className={({ isActive }) => (isActive ? 'active' : '')}>Attendance records</NavLink>
            <NavLink to="/hr/leaves" className={({ isActive }) => (isActive ? 'active' : '')}>Leave approvals</NavLink>
            <NavLink to="/hr/employees" className={({ isActive }) => (isActive ? 'active' : '')}>Employee directory</NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>My profile</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Overview</NavLink>
            <NavLink to="/attendance" className={({ isActive }) => (isActive ? 'active' : '')}>My attendance</NavLink>
            <NavLink to="/leaves" className={({ isActive }) => (isActive ? 'active' : '')}>Leave requests</NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>My profile</NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-foot">
        Signed in as {user?.name} ({user?.role})
        <button onClick={logout}>Sign out</button>
      </div>
    </aside>
  );
};

export default Sidebar;
