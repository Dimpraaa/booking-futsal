import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFutbol } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      alert('Akun berhasil dibuat. Silakan masuk.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mendaftar.');
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
          
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '8px' }}>Buat akun baru</h1>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px', fontSize: '0.9rem' }}>
            Daftar untuk mulai booking lapangan.
          </p>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama lengkap" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Alamat email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimal 8 karakter" />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px', padding: '11px' }} disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '28px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            Sudah punya akun? <Link to="/login" style={{ fontWeight: '500' }}>Masuk</Link>
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

export default Register;
