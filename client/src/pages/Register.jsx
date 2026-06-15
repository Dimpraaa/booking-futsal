import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFutbol, FaArrowRight } from 'react-icons/fa';

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
      alert('Pendaftaran berhasil! Anda sekarang bisa masuk.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Pendaftaran gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="auth-form-wrapper animate-slide-up">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontSize: '1.2rem', fontWeight: '700' }}>
            <FaFutbol className="text-gradient" /> Arena<span className="text-gradient">Pro</span>
          </Link>
          
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Buat akun baru</h1>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Bergabunglah untuk mulai memesan lapangan futsal premium.</p>
          
          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Masukkan nama lengkap" />
            </div>
            <div className="form-group">
              <label>Alamat Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Masukkan alamat email" />
            </div>
            <div className="form-group">
              <label>Kata Sandi</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Buat kata sandi yang kuat" />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '14px' }} disabled={isLoading}>
              {isLoading ? 'Mendaftarkan...' : 'Daftar'} <FaArrowRight style={{ marginLeft: '4px' }} />
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
            Sudah punya akun? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Masuk di sini</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right">
        <div style={{ maxWidth: '400px', zIndex: 2 }} className="animate-slide-up stagger-2">
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', boxShadow: '0 0 40px rgba(0, 210, 255, 0.3)' }}>
            <FaFutbol size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Bergabung Sekarang.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            Buat akun untuk memesan lapangan premium secara instan. Amankan jadwal, undang tim Anda, dan tingkatkan pengalaman bermain futsal Anda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
