import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTimesCircle, FaFutbol } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMyBookings();
  }, [token, navigate]);

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort: newest first
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (err) {
      console.error('Gagal memuat data booking', err);
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
      alert(err.response?.data?.message || 'Gagal membatalkan booking.');
    }
  };

  const getStatusStyle = (status) => {
    const map = {
      PENDING: { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)', label: 'Menunggu Konfirmasi' },
      APPROVED: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', border: 'rgba(16, 185, 129, 0.2)', label: 'Disetujui' },
      CANCELLED: { bg: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', border: 'rgba(244, 63, 94, 0.2)', label: 'Dibatalkan' },
      COMPLETED: { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.2)', label: 'Selesai' },
    };
    return map[status] || map.PENDING;
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getDuration = (start, end) => {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
    return `${diff} Jam`;
  };

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container animate-slide-up">
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Booking Saya</h1>
          <p style={{ color: 'var(--text-tertiary)' }}>Riwayat dan status seluruh booking lapangan kamu.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)' }}>Memuat data...</div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
            <FaFutbol size={48} color="var(--text-tertiary)" style={{ marginBottom: '20px' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Belum ada booking</h3>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}>Kamu belum pernah melakukan booking. Yuk pilih lapangan!</p>
            <button className="btn btn-primary" onClick={() => navigate('/')} style={{ padding: '12px 32px' }}>
              Lihat Lapangan
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bookings.map(b => {
              const st = getStatusStyle(b.status);
              return (
                <div key={b.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  {/* Left: Info */}
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{b.room?.name || 'Lapangan'}</h3>
                      <span style={{
                        padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem',
                        fontWeight: '600', background: st.bg, color: st.color, border: `1px solid ${st.border}`
                      }}>
                        {st.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaCalendarAlt size={13} color="var(--accent-primary)" />
                        {new Date(b.start_time).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaClock size={13} color="var(--accent-primary)" />
                        {new Date(b.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ({getDuration(b.start_time, b.end_time)})
                      </div>
                    </div>
                  </div>

                  {/* Right: Price + Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Rp {parseFloat(b.total_price).toLocaleString('id-ID')}
                      </div>
                    </div>
                    {b.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="btn"
                        style={{ padding: '10px 16px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', border: '1px solid rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                      >
                        <FaTimesCircle size={14} /> Batalkan
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
