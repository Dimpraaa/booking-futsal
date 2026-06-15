import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaFutbol, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <div className="navbar-wrapper">
      <nav className="navbar-pill">
        <Link to="/" className="nav-brand">
          <FaFutbol style={{ color: 'var(--accent)' }} /> Arena Pro
        </Link>
        
        <div className="nav-links">
          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>Dashboard</Link>
              )}
              <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Lapangan</Link>
              <Link to="/my-bookings" className={`nav-item ${location.pathname === '/my-bookings' ? 'active' : ''}`}>Booking Saya</Link>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '8px', paddingLeft: '16px', borderLeft: '1px solid var(--border-default)' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user?.name}</span>
                <button onClick={handleLogout} className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Masuk</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px' }}>Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
