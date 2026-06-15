import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // For demo purposes, we allow users to register as ADMIN to test the dashboard easily.
  // In a real app, role is usually set by system or superadmin.
  const [role, setRole] = useState('USER'); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Create an Account</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role (Demo Purpose)</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="USER">Customer (User)</option>
              <option value="ADMIN">Manager (Admin)</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>Register</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
