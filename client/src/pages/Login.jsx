import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFutbol, FaArrowRight } from 'react-icons/fa';

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
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="auth-form-wrapper animate-slide-up">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontSize: '1.2rem', fontWeight: '700' }}>
            <FaFutbol className="text-gradient" /> Arena<span className="text-gradient">Pro</span>
          </Link>
          
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Welcome back.</h1>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '32px' }}>Sign in to manage your bookings and explore fields.</p>
          
          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email address</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="name@company.com"
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Password</label>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Forgot password?</a>
              </div>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', padding: '14px' }} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'} <FaArrowRight style={{ marginLeft: '4px' }} />
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Create an account</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right">
        <div style={{ maxWidth: '400px', zIndex: 2 }} className="animate-slide-up stagger-2">
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', boxShadow: '0 0 40px rgba(0, 210, 255, 0.3)' }}>
            <FaFutbol size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Elevate Your Game.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            Experience the most seamless futsal booking platform. Real-time availability, instant confirmations, and premium facilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
