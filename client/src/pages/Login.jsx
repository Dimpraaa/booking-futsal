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
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '48px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            <FaFutbol style={{ color: 'var(--accent)' }} /> Arena Pro
          </Link>
          
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '8px' }}>Masuk ke akun</h1>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px', fontSize: '0.95rem' }}>Masukkan email dan password untuk melanjutkan.</p>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
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
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            Belum punya akun? <Link to="/register">Daftar</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right">
        <div style={{ maxWidth: '360px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px' }}>Selamat Datang di Arena Pro.</h2>
        </div>
      </div>
    </div>
  );
};

export default Login;
