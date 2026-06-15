import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaClock, FaCheckCircle, FaTimes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const navigate = useNavigate();

  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try { setRooms((await axios.get('http://localhost:5000/api/rooms')).data); }
    catch (e) { console.error(e); }
  };

  const getAvailableDates = () => {
    const dates = []; const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      dates.push({
        value: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('id-ID', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return dates;
  };

  const fetchAvailability = async (roomId, date) => {
    setLoadingSlots(true);
    try { setSlots((await axios.get(`http://localhost:5000/api/rooms/${roomId}/availability?date=${date}`)).data.slots); }
    catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date); setSelectedSlots([]); setBookingStep(2);
    fetchAvailability(selectedRoom.id, date);
  };

  const handleSlotToggle = (hour) => {
    setSelectedSlots(prev => {
      if (prev.includes(hour)) return prev.filter(h => h < hour);
      const n = [...prev, hour].sort((a, b) => a - b);
      for (let i = 1; i < n.length; i++) { if (n[i] !== n[i-1]+1) return n.slice(0, i); }
      return n.length > 3 ? prev : n;
    });
  };

  const getSummary = () => {
    if (!selectedRoom || selectedSlots.length === 0) return null;
    const s = [...selectedSlots].sort((a, b) => a - b);
    return {
      startLabel: `${String(s[0]).padStart(2,'0')}:00`,
      endLabel: `${String(s[s.length-1]+1).padStart(2,'0')}:00`,
      duration: s.length,
      totalPrice: s.length * parseFloat(selectedRoom.price_per_hour),
      dateFormatted: new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };

  const handleConfirm = async () => {
    if (!token) { navigate('/login'); return; }
    const s = [...selectedSlots].sort((a, b) => a - b);
    setIsSubmitting(true); setBookingError('');
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        roomId: selectedRoom.id,
        start_time: `${selectedDate}T${String(s[0]).padStart(2,'0')}:00:00`,
        end_time: `${selectedDate}T${String(s[s.length-1]+1).padStart(2,'0')}:00:00`,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBookingSuccess('Booking berhasil dikirim.');
      setTimeout(closeModal, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking gagal.');
    } finally { setIsSubmitting(false); }
  };

  const openModal = (room) => {
    if (!token) { navigate('/login'); return; }
    setSelectedRoom(room); setBookingStep(1); setSelectedDate('');
    setSelectedSlots([]); setSlots([]); setBookingError(''); setBookingSuccess('');
  };

  const closeModal = () => {
    setSelectedRoom(null); setBookingStep(1); setSelectedDate('');
    setSelectedSlots([]); setSlots([]); setBookingError(''); setBookingSuccess('');
  };

  const summary = getSummary();

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="container" style={{ marginBottom: '48px' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-hover)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Arena Pro</p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '10px' }}>Pilihan Lapangan</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem', maxWidth: '420px' }}>
          Pilih lapangan, tentukan jadwal, langsung main.
        </p>
      </div>

      {/* Room Grid */}
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {rooms.map(room => (
            <div key={room.id} className="card card-interactive" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => openModal(room)}>
              <div style={{
                height: '180px',
                background: `linear-gradient(to bottom, transparent 40%, var(--bg-surface)), url("https://images.unsplash.com/photo-1521217078329-f8fc1becab68?q=80&w=1470&auto=format&fit=crop")`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              
              <div style={{ padding: '20px 24px 24px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '10px', letterSpacing: '-0.01em' }}>{room.name}</h3>
                
                <div style={{ display: 'flex', gap: '14px', marginBottom: '18px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaUsers size={12} /> {room.capacity} pemain
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                    Rp {parseFloat(room.price_per_hour).toLocaleString('id-ID')}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '400' }}> /jam</span>
                  </div>
                  <span className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem' }}>Booking</span>
                </div>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--text-tertiary)' }}>Belum ada lapangan yang terdaftar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={closeModal}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '28px 32px' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '600', letterSpacing: '-0.01em', marginBottom: '3px' }}>{selectedRoom.name}</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                  {bookingStep === 1 ? 'Pilih tanggal' : bookingStep === 2 ? 'Pilih jam' : 'Konfirmasi'}
                </p>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}><FaTimes size={16} /></button>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
              {[1,2,3].map(s => (
                <div key={s} style={{ flex: 1, height: '2px', borderRadius: '1px', background: s <= bookingStep ? 'var(--accent)' : 'var(--border-default)', transition: 'background 0.2s' }} />
              ))}
            </div>

            {bookingError && <div style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.1)' }}>{bookingError}</div>}
            {bookingSuccess && <div style={{ background: 'rgba(34,197,94,0.06)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.8rem', border: '1px solid rgba(34,197,94,0.1)' }}>{bookingSuccess}</div>}

            {/* Step 1: Date */}
            {bookingStep === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {getAvailableDates().map(d => (
                  <button key={d.value} onClick={() => handleDateSelect(d.value)} style={{
                    padding: '14px 4px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                    cursor: 'pointer', textAlign: 'center', background: 'var(--bg-base)', color: 'var(--text-primary)',
                    transition: 'all var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-subtle)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-base)'; }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.isToday ? 'Hari ini' : d.dayName}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', lineHeight: 1.2 }}>{d.dayNum}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{d.monthName}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Slots */}
            {bookingStep === 2 && (
              <div>
                {loadingSlots ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Memuat jadwal...</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '14px' }}>
                      {slots.map(slot => {
                        const booked = slot.status === 'booked';
                        const selected = selectedSlots.includes(slot.hour);
                        return (
                          <button key={slot.hour} disabled={booked} onClick={() => handleSlotToggle(slot.hour)} style={{
                            padding: '9px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: '500',
                            border: selected ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                            background: booked ? 'var(--bg-base)' : selected ? 'var(--accent-subtle)' : 'var(--bg-base)',
                            color: booked ? 'var(--text-tertiary)' : selected ? 'var(--accent-hover)' : 'var(--text-primary)',
                            cursor: booked ? 'not-allowed' : 'pointer', opacity: booked ? 0.35 : 1,
                            textDecoration: booked ? 'line-through' : 'none', transition: 'all var(--transition)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <span>{slot.label}</span>
                            {booked && <span style={{ fontSize: '0.65rem' }}>Terisi</span>}
                            {selected && <FaCheckCircle size={12} />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSlots.length > 0 && (
                      <div style={{ background: 'var(--accent-subtle)', padding: '9px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--accent-hover)', fontWeight: '500' }}>
                        {selectedSlots.length} jam dipilih — Rp {(selectedSlots.length * parseFloat(selectedRoom.price_per_hour)).toLocaleString('id-ID')}
                      </div>
                    )}

                    <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Pilih 1–3 slot berurutan.</p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" onClick={() => setBookingStep(1)} style={{ flex: 1, fontSize: '0.8rem' }}><FaArrowLeft size={10} /> Kembali</button>
                      <button className="btn btn-primary" disabled={selectedSlots.length === 0} onClick={() => setBookingStep(3)} style={{ flex: 2, fontSize: '0.8rem' }}>Lanjut <FaArrowRight size={10} /></button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {bookingStep === 3 && summary && (
              <div>
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.85rem' }}>
                    {[
                      ['Lapangan', selectedRoom.name],
                      ['Tanggal', summary.dateFormatted],
                      ['Waktu', `${summary.startLabel} – ${summary.endLabel}`],
                      ['Durasi', `${summary.duration} Jam`],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ fontWeight: '500' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '18px', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: '700' }}>Rp {summary.totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={() => setBookingStep(2)} style={{ flex: 1, fontSize: '0.8rem' }}><FaArrowLeft size={10} /> Ubah</button>
                  <button className="btn btn-primary" onClick={handleConfirm} disabled={isSubmitting} style={{ flex: 2, fontSize: '0.8rem' }}>
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
