import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash, FaCheck, FaTimes, FaInbox } from 'react-icons/fa';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 10, price_per_hour: 0 });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') { navigate('/login'); return; }
    fetchBookings();
    fetchRooms();
  }, [navigate, token, user?.role]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/rooms', newRoom, { headers: { Authorization: `Bearer ${token}` } });
      setNewRoom({ name: '', capacity: 10, price_per_hour: 0 });
      fetchRooms();
    } catch (err) { setError('Gagal menyimpan lapangan.'); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchBookings();
    } catch (err) { alert('Gagal mengubah status.'); }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Hapus lapangan ini?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRooms();
    } catch (err) { alert('Gagal menghapus.'); }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Admin</p>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Dashboard</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { key: 'bookings', icon: <FaInbox size={14} />, label: 'Booking Masuk' },
            { key: 'rooms', icon: <FaPlus size={14} />, label: 'Kelola Lapangan' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              textAlign: 'left', padding: '10px 14px', border: 'none', borderRadius: 'var(--radius-md)',
              background: activeTab === tab.key ? 'var(--bg-hover)' : 'transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: '500', transition: 'all 0.15s',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === 'bookings' && (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Booking Masuk</h1>
            
            <div style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
              <table className="data-grid">
                <thead>
                  <tr>
                    <th>Pemesan</th>
                    <th>Lapangan</th>
                    <th>Jadwal</th>
                    <th>Harga</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{b.user?.name}</td>
                      <td>{b.room?.name}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(b.start_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        <span style={{ color: 'var(--text-tertiary)' }}> — </span>
                        {new Date(b.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Rp {parseFloat(b.total_price).toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`status-dot status-${b.status.toLowerCase()}`}>{b.status}</span>
                      </td>
                      <td>
                        {b.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => updateBookingStatus(b.id, 'APPROVED')} className="btn" style={{ padding: '6px 10px', background: 'rgba(34,197,94,0.1)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.15)' }}>
                              <FaCheck size={12} />
                            </button>
                            <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')} className="btn" style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)' }}>
                              <FaTimes size={12} />
                            </button>
                          </div>
                        )}
                        {b.status === 'APPROVED' && (
                          <button onClick={() => updateBookingStatus(b.id, 'COMPLETED')} className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Selesaikan</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-tertiary)' }}>Belum ada booking masuk.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Kelola Lapangan</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>Tambah Lapangan</h3>
                {error && <p style={{ color: 'var(--danger)', marginBottom: '12px', fontSize: '0.85rem' }}>{error}</p>}
                <form onSubmit={handleCreateRoom}>
                  <div className="form-group">
                    <label>Nama</label>
                    <input type="text" className="form-control" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} required placeholder="Nama lapangan" />
                  </div>
                  <div className="form-group">
                    <label>Kapasitas</label>
                    <input type="number" className="form-control" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Harga / Jam (Rp)</label>
                    <input type="number" className="form-control" value={newRoom.price_per_hour} onChange={e => setNewRoom({...newRoom, price_per_hour: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Simpan</button>
                </form>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>Daftar Lapangan</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {rooms.map(r => (
                    <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '2px' }}>{r.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Rp {parseFloat(r.price_per_hour).toLocaleString('id-ID')} / jam</div>
                      </div>
                      <button className="btn btn-danger" onClick={() => deleteRoom(r.id)} style={{ padding: '6px 10px' }}>
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                  {rooms.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Belum ada lapangan.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
