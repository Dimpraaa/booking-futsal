import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaFutbol, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  // In a real app, we would get this from Context/Redux
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <FaFutbol /> <span>Arena</span>Futsal
        </Link>
        <div className="nav-links">
          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className="nav-link">Dashboard</Link>
              )}
              <Link to="/" className="nav-link">Sewa Lapangan</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid var(--border-color)', paddingLeft: '15px' }}>
                <span style={{ color: 'var(--text-muted)' }}><FaUserCircle /> {user?.name}</span>
                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
