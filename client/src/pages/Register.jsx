import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFutbol, FaArrowRight } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER'); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Create an account</h1>
          <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Join us to start booking premium futsal arenas.</p>
          
          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full name</label>
              <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email address</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Create a strong password" />
            </div>
            <div className="form-group">
              <label>Role (Demo Purpose)</label>
              <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)} style={{ appearance: 'none' }}>
                <option value="USER" style={{ background: 'var(--bg-surface)' }}>Customer (User)</option>
                <option value="ADMIN" style={{ background: 'var(--bg-surface)' }}>Manager (Admin)</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '14px' }} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'} <FaArrowRight style={{ marginLeft: '4px' }} />
            </button>
          </form>
          
          <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign in here</Link>
          </p>
        </div>
      </div>
      
      <div className="auth-right">
        <div style={{ maxWidth: '400px', zIndex: 2 }} className="animate-slide-up stagger-2">
          <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px auto', boxShadow: '0 0 40px rgba(0, 210, 255, 0.3)' }}>
            <FaFutbol size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Manage with Ease.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            Register as an Admin to access the powerful dashboard. Manage arenas, approve bookings, and monitor your revenue effortlessly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
