import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaFutbol, FaSignOutAlt, FaUser, FaClipboardList } from 'react-icons/fa';

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
    <div className="navbar-wrapper animate-slide-up">
      <nav className="navbar-pill">
        <Link to="/" className="nav-brand">
          <FaFutbol className="text-gradient" /> 
          <span style={{ color: 'var(--text-primary)' }}>Arena</span>
          <span className="text-gradient">Pro</span>
        </Link>
        
        <div className="nav-links">
          {token ? (
            <>
              {user?.role === 'ADMIN' && (
                <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>Dashboard</Link>
              )}
              <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Pilih Lapangan</Link>
              <Link to="/my-bookings" className={`nav-item ${location.pathname === '/my-bookings' ? 'active' : ''}`}>
                <FaClipboardList size={14} style={{ marginRight: '4px' }} /> Booking Saya
              </Link>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '10px', paddingLeft: '20px', borderLeft: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                    <FaUser size={14} color="var(--accent-primary)"/>
                  </div>
                  {user?.name}
                </div>
                <button onClick={handleLogout} className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  <FaSignOutAlt /> Keluar
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">Masuk</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '10px 24px' }}>Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
