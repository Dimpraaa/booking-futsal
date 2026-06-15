import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa';

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
      setBookingSuccess('Booking request sent! Awaiting Admin approval.');
      setTimeout(() => setSelectedRoom(null), 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div className="animate-slide-up">
          <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '24px', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
            Premium Futsal Booking Platform
          </span>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '24px', lineHeight: '1.1' }}>
            Book Your Arena.<br/>
            <span className="text-gradient">Dominate the Game.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Discover and book the best futsal courts in town. Real-time availability, instant confirmation, and world-class facilities.
          </p>
        </div>
      </div>

      {/* Arena Listings */}
      <div className="container animate-slide-up stagger-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2rem' }}>Available Arenas</h2>
            <p style={{ color: 'var(--text-tertiary)' }}>Select a court that fits your team's needs.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
          {rooms.map((room, idx) => (
            <div key={room.id} className="glass-card" style={{ padding: '0', animationDelay: `${idx * 0.1}s` }}>
              <div style={{ height: '200px', background: 'linear-gradient(to bottom, rgba(16, 20, 31, 0), var(--bg-surface)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                  <FaCheckCircle color="var(--success-color)" /> Available
                </div>
              </div>
              
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{room.name}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <FaMapMarkerAlt color="var(--accent-primary)" /> Standard FIFA Pitch
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <FaUsers color="var(--accent-primary)" /> Capacity: {room.capacity} Players
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Price per hour</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Rp {room.price_per_hour.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => setSelectedRoom(room)} style={{ padding: '10px 20px' }}>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
              <FaFutbol size={40} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>No arenas available right now.</h3>
              <p style={{ color: 'var(--text-tertiary)' }}>Please check back later or contact the administrator.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 9, 15, 0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Book {selectedRoom.name}</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>Set your schedule and dominate the pitch.</p>
              </div>
              <button onClick={() => setSelectedRoom(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '8px' }}>
                <FaTimes size={20} />
              </button>
            </div>
            
            {bookingError && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>{bookingError}</div>}
            {bookingSuccess && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{bookingSuccess}</div>}

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label><FaClock style={{ marginRight: '6px' }} /> Start Time</label>
                <input type="datetime-local" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label><FaClock style={{ marginRight: '6px' }} /> End Time</label>
                <input type="datetime-local" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Rate per hour</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Rp {selectedRoom.price_per_hour.toLocaleString('id-ID')}</strong>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" className="btn" onClick={() => setSelectedRoom(null)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
