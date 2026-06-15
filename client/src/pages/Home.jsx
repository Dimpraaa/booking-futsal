import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setBookingError('');
      setBookingSuccess('');
      await axios.post(
        'http://localhost:5000/api/bookings',
        { roomId: selectedRoom.id, start_time: startTime, end_time: endTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingSuccess('Booking request sent successfully! Awaiting Admin approval.');
      setSelectedRoom(null);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          Sewa Lapangan <span style={{ color: 'var(--primary)' }}>Futsal Terbaik</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Pilih lapangan, tentukan jam bermain, dan nikmati pertandingan bersama tim Anda.
        </p>
      </div>

      <div className="grid">
        {rooms.map(room => (
          <div key={room.id} className="card">
            <h3>{room.name}</h3>
            <p style={{ color: 'var(--text-muted)', margin: '10px 0' }}>{room.description || 'Fasilitas premium standar FIFA.'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span className="badge badge-approved">Kapasitas: {room.capacity} Orang</span>
              <strong style={{ color: 'var(--primary)' }}>Rp {room.price_per_hour}/Jam</strong>
            </div>
            <button 
              className="btn btn-outline" 
              style={{ width: '100%' }}
              onClick={() => setSelectedRoom(room)}
            >
              Booking Sekarang
            </button>
          </div>
        ))}
        {rooms.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>Belum ada data lapangan. Admin harus menambahkan lapangan terlebih dahulu.</p>}
      </div>

      {/* Booking Modal / Form Section */}
      {selectedRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Booking {selectedRoom.name}</h2>
              <button className="btn-outline" onClick={() => setSelectedRoom(null)} style={{ border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            
            {bookingError && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{bookingError}</div>}
            {bookingSuccess && <div style={{ color: 'var(--primary)', marginBottom: '16px' }}>{bookingSuccess}</div>}

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Waktu Mulai</label>
                <input type="datetime-local" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Waktu Selesai</label>
                <input type="datetime-local" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Harga per jam: Rp {selectedRoom.price_per_hour}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Konfirmasi Booking</button>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedRoom(null)}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
