import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaTimesCircle } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchMyBookings();
  }, [token, navigate]);

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan booking ini?')) return;
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan.');
    }
  };

  const statusMap = {
    PENDING: { bg: 'rgba(245,158,11,0.1)', color: 'var(--warning)', label: 'Menunggu' },
    APPROVED: { bg: 'rgba(34,197,94,0.1)', color: 'var(--success)', label: 'Disetujui' },
    CANCELLED: { bg: 'rgba(239,68,68,0.1)', color: 'var(--danger)', label: 'Dibatalkan' },
    COMPLETED: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', label: 'Selesai' },
  };

  const getDuration = (s, e) => `${(new Date(e) - new Date(s)) / 3600000} Jam`;

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Booking Saya</h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>Riwayat dan status booking kamu.</p>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-tertiary)' }}>Memuat...</p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }}>Belum ada booking.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')} style={{ padding: '10px 24px' }}>Lihat Lapangan</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.map(b => {
              const st = statusMap[b.status] || statusMap.PENDING;
              return (
                <div key={b.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '1rem' }}>{b.room?.name || 'Lapangan'}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '500', background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>{new Date(b.start_time).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={11} />
                        {new Date(b.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        ({getDuration(b.start_time, b.end_time)})
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>Rp {parseFloat(b.total_price).toLocaleString('id-ID')}</span>
                    {b.status === 'PENDING' && (
                      <button onClick={() => handleCancel(b.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Batalkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
