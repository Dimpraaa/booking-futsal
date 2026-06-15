import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFutbol } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '48px', fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            <FaFutbol style={{ color: 'var(--accent)' }} /> Arena Pro
          </Link>
          
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>Masuk ke akun</h1>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px', fontSize: '0.9rem' }}>
            Masukkan email dan password untuk melanjutkan.
          </p>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Alamat email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px', padding: '11px' }} disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            Belum punya akun? <Link to="/register" style={{ fontWeight: '500' }}>Daftar</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-right-content">
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--accent-subtle)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <FaFutbol size={24} color="var(--accent-hover)" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.02em' }}>Selamat Datang di Arena Pro.</h2>
        </div>
      </div>
    </div>
  );
};

export default Login;
