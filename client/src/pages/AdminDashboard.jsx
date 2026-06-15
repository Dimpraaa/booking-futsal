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
    if (!token || user?.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    fetchBookings();
    fetchRooms();
  }, [navigate, token, user?.role]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/rooms', newRoom, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewRoom({ name: '', capacity: 10, price_per_hour: 0 });
      fetchRooms();
      alert('Lapangan berhasil disimpan!');
    } catch (err) {
      setError('Gagal nyimpen lapangan, cek lagi datanya ya.');
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
    } catch (err) {
      alert('Gagal ngerubah status pesanan.');
    }
  };

  const deleteRoom = async (id) => {
    if(window.confirm('Yakin nih mau ngehapus lapangan ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchRooms();
      } catch (err) {
        alert('Gagal hapus lapangan.');
      }
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ paddingBottom: '32px', borderBottom: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Halaman Admin</p>
          <h2 style={{ fontSize: '1.5rem' }}>Kelola Sistem</h2>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px' }}>
          <button 
            onClick={() => setActiveTab('bookings')}
            style={{ textAlign: 'left', padding: '12px 16px', background: activeTab === 'bookings' ? 'var(--bg-glass-hover)' : 'transparent', border: '1px solid', borderColor: activeTab === 'bookings' ? 'var(--border-light)' : 'transparent', borderRadius: 'var(--radius-md)', color: activeTab === 'bookings' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}
          >
            <FaInbox /> Booking Masuk
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            style={{ textAlign: 'left', padding: '12px 16px', background: activeTab === 'rooms' ? 'var(--bg-glass-hover)' : 'transparent', border: '1px solid', borderColor: activeTab === 'rooms' ? 'var(--border-light)' : 'transparent', borderRadius: 'var(--radius-md)', color: activeTab === 'rooms' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500' }}
          >
            <FaPlus /> Kelola Lapangan
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'bookings' && (
          <div className="animate-slide-up">
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Daftar Booking Masuk</h1>
              <p style={{ color: 'var(--text-tertiary)' }}>Cek dan konfirmasi pesanan yang masuk dari pelanggan.</p>
            </div>
            
            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', background: 'var(--bg-surface)' }}>
              <table className="data-grid">
                <thead>
                  <tr>
                    <th>Nama Pemesan</th>
                    <th>Lapangan</th>
                    <th>Jadwal Main</th>
                    <th>Total Harga</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: '500' }}>{b.user?.name}</td>
                      <td>{b.room?.name}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(b.start_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}<br/>
                        <span style={{ color: 'var(--text-tertiary)' }}>s/d</span><br/>
                        {new Date(b.end_time).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>Rp {b.total_price.toLocaleString('id-ID')}</td>
                      <td>
                        <span className={`status-dot status-${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => updateBookingStatus(b.id, 'APPROVED')} className="btn" style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <FaCheck />
                            </button>
                            <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')} className="btn" style={{ padding: '8px 12px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                              <FaTimes />
                            </button>
                          </div>
                        )}
                        {b.status === 'APPROVED' && (
                          <button onClick={() => updateBookingStatus(b.id, 'COMPLETED')} className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Selesaikan</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)' }}>Belum ada pesanan yang masuk nih.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="animate-slide-up">
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Kelola Daftar Lapangan</h1>
              <p style={{ color: 'var(--text-tertiary)' }}>Tambah lapangan baru atau hapus yang udah gak dipakai.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              {/* Form Add Room */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>Tambah Lapangan</h3>
                {error && <p style={{ color: 'var(--danger-color)', marginBottom: '16px' }}>{error}</p>}
                <form onSubmit={handleCreateRoom}>
                  <div className="form-group">
                    <label>Nama Lapangan</label>
                    <input type="text" className="form-control" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} required placeholder="Contoh: Lapangan Sintetis A" />
                  </div>
                  <div className="form-group">
                    <label>Kapasitas (Orang)</label>
                    <input type="number" className="form-control" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Harga Sewa / Jam</label>
                    <input type="number" className="form-control" value={newRoom.price_per_hour} onChange={e => setNewRoom({...newRoom, price_per_hour: e.target.value})} required placeholder="Contoh: 150000" />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}><FaPlus /> Simpan Lapangan</button>
                </form>
              </div>

              {/* List Rooms */}
              <div>
                <h3 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>Lapangan Tersedia</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {rooms.map(r => (
                    <div key={r.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{r.name}</h4>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Rp {r.price_per_hour.toLocaleString('id-ID')} / jam</p>
                      </div>
                      <button className="btn btn-danger" onClick={() => deleteRoom(r.id)} style={{ padding: '10px' }}>
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  {rooms.length === 0 && <p style={{ color: 'var(--text-tertiary)' }}>Belum ada lapangan yang didaftarin.</p>}
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
