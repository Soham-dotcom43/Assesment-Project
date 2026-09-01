import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = ({ children }) => (
  <div className="app-shell">
    <Sidebar />
    <div className="main-area">
      <Topbar />
      <main className="content">{children}</main>
    </div>
  </div>
);

export default Layout;
