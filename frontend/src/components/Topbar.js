import React from 'react';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-date">{today}</div>
      <div className="topbar-user">
        <span>{user?.name}</span>
        <div className="avatar">{initials}</div>
      </div>
    </header>
  );
};

export default Topbar;
