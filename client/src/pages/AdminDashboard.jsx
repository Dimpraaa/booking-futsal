import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 10, price_per_hour: 0 });
  const [error, setError] = useState('');
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
      fetchRooms(); // Refresh list
    } catch (err) {
      setError('Gagal membuat lapangan');
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings(); // Refresh list
    } catch (err) {
      alert('Gagal merubah status');
    }
  };

  const deleteRoom = async (id) => {
    if(window.confirm('Hapus lapangan ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/rooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchRooms();
      } catch (err) {
        alert('Gagal menghapus');
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column: Manage Rooms */}
        <div>
          <div className="card" style={{ marginBottom: '30px' }}>
            <h3>Tambah Lapangan Baru</h3>
            <hr style={{ borderColor: 'var(--border-color)', margin: '15px 0' }} />
            {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>Nama Lapangan</label>
                <input type="text" className="form-control" value={newRoom.name} onChange={e => setNewRoom({...newRoom, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Kapasitas</label>
                <input type="number" className="form-control" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Harga per Jam (Rp)</label>
                <input type="number" className="form-control" value={newRoom.price_per_hour} onChange={e => setNewRoom({...newRoom, price_per_hour: e.target.value})} required />
              </div>
              <button type="submit" className="btn">Simpan Lapangan</button>
            </form>
          </div>

          <div className="card">
            <h3>Daftar Lapangan</h3>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
              {rooms.map(r => (
                <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>{r.name} - Rp{r.price_per_hour}/jam</span>
                  <button className="btn-outline" style={{ border: 'none', color: 'var(--danger)', cursor: 'pointer' }} onClick={() => deleteRoom(r.id)}>Hapus</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Manage Bookings */}
        <div className="card">
          <h3>Daftar Pesanan Masuk</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Validasi pembayaran dan setujui jadwal di sini.</p>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Lapangan</th>
                  <th>Waktu</th>
                  <th>Total Tagihan</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.user?.name}</td>
                    <td>{b.room?.name}</td>
                    <td>
                      {new Date(b.start_time).toLocaleString('id-ID')} <br/> 
                      s/d <br/>
                      {new Date(b.end_time).toLocaleString('id-ID')}
                    </td>
                    <td><strong>Rp {b.total_price}</strong></td>
                    <td>
                      <span className={`badge badge-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => updateBookingStatus(b.id, 'APPROVED')} className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Setujui</button>
                          <button onClick={() => updateBookingStatus(b.id, 'CANCELLED')} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Tolak</button>
                        </div>
                      )}
                      {b.status === 'APPROVED' && (
                        <button onClick={() => updateBookingStatus(b.id, 'COMPLETED')} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>Selesai</button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Belum ada pesanan.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
