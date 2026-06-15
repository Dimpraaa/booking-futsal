import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaClock, FaCheckCircle, FaTimes, FaFutbol, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

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
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
    } catch (error) {
      console.error('Gagal memuat data lapangan', error);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
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
    try {
      const res = await axios.get(`http://localhost:5000/api/rooms/${roomId}/availability?date=${date}`);
      setSlots(res.data.slots);
    } catch (err) {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setBookingStep(2);
    fetchAvailability(selectedRoom.id, date);
  };

  const handleSlotToggle = (hour) => {
    setSelectedSlots(prev => {
      if (prev.includes(hour)) return prev.filter(h => h < hour);
      const newSlots = [...prev, hour].sort((a, b) => a - b);
      for (let i = 1; i < newSlots.length; i++) {
        if (newSlots[i] !== newSlots[i - 1] + 1) return newSlots.slice(0, i);
      }
      if (newSlots.length > 3) return prev;
      return newSlots;
    });
  };

  const getBookingSummary = () => {
    if (!selectedRoom || selectedSlots.length === 0) return null;
    const sorted = [...selectedSlots].sort((a, b) => a - b);
    const startHour = sorted[0];
    const endHour = sorted[sorted.length - 1] + 1;
    const duration = sorted.length;
    const totalPrice = duration * parseFloat(selectedRoom.price_per_hour);
    return {
      startLabel: `${String(startHour).padStart(2, '0')}:00`,
      endLabel: `${String(endHour).padStart(2, '0')}:00`,
      duration,
      totalPrice,
      dateFormatted: new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };

  const handleBookingConfirm = async () => {
    if (!token) { navigate('/login'); return; }
    const sorted = [...selectedSlots].sort((a, b) => a - b);
    const startHour = sorted[0];
    const endHour = sorted[sorted.length - 1] + 1;

    setIsSubmitting(true);
    setBookingError('');
    try {
      await axios.post('http://localhost:5000/api/bookings', {
        roomId: selectedRoom.id,
        start_time: `${selectedDate}T${String(startHour).padStart(2, '0')}:00:00`,
        end_time: `${selectedDate}T${String(endHour).padStart(2, '0')}:00:00`,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setBookingSuccess('Booking berhasil dikirim.');
      setTimeout(() => closeModal(), 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (room) => {
    if (!token) { navigate('/login'); return; }
    setSelectedRoom(room);
    setBookingStep(1);
    setSelectedDate('');
    setSelectedSlots([]);
    setSlots([]);
    setBookingError('');
    setBookingSuccess('');
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setBookingStep(1);
    setSelectedDate('');
    setSelectedSlots([]);
    setSlots([]);
    setBookingError('');
    setBookingSuccess('');
  };

  const summary = getBookingSummary();

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Header */}
      <div className="container" style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>Pilihan Lapangan</h1>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>Pilih lapangan, tentukan jadwal, langsung main.</p>
      </div>

      {/* Room Grid */}
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {rooms.map(room => (
            <div key={room.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '180px', background: 'linear-gradient(to bottom, transparent, var(--bg-surface)), url("https://images.unsplash.com/photo-1521217078329-f8fc1becab68?q=80&w=1470&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '12px' }}>{room.name}</h3>
                
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaUsers size={13} style={{ color: 'var(--text-tertiary)' }} /> {room.capacity} pemain
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      Rp {parseFloat(room.price_per_hour).toLocaleString('id-ID')}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '400' }}> /jam</span>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => openModal(room)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--text-tertiary)' }}>Belum ada lapangan yang terdaftar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '4px' }}>{selectedRoom.name}</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  {bookingStep === 1 ? 'Pilih tanggal' : bookingStep === 2 ? 'Pilih jam' : 'Konfirmasi booking'}
                </p>
              </div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                <FaTimes size={18} />
              </button>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= bookingStep ? 'var(--accent)' : 'var(--border-default)', transition: 'background 0.2s' }} />
              ))}
            </div>

            {bookingError && <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>{bookingError}</div>}
            {bookingSuccess && <div style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.85rem' }}>{bookingSuccess}</div>}

            {/* Step 1: Date */}
            {bookingStep === 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {getAvailableDates().map(d => (
                  <button key={d.value} onClick={() => handleDateSelect(d.value)} style={{
                    padding: '14px 6px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                    cursor: 'pointer', textAlign: 'center', background: 'var(--bg-base)', color: 'var(--text-primary)', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.borderColor = 'var(--border-default)'}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{d.isToday ? 'Hari ini' : d.dayName}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '600' }}>{d.dayNum}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.monthName}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Slots */}
            {bookingStep === 2 && (
              <div>
                {loadingSlots ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Memuat jadwal...</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                      {slots.map(slot => {
                        const isBooked = slot.status === 'booked';
                        const isSelected = selectedSlots.includes(slot.hour);
                        return (
                          <button key={slot.hour} disabled={isBooked} onClick={() => handleSlotToggle(slot.hour)} style={{
                            padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: '500',
                            border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                            background: isBooked ? 'var(--bg-base)' : isSelected ? 'var(--accent-subtle)' : 'var(--bg-base)',
                            color: isBooked ? 'var(--text-tertiary)' : isSelected ? 'var(--accent)' : 'var(--text-primary)',
                            cursor: isBooked ? 'not-allowed' : 'pointer', opacity: isBooked ? 0.4 : 1,
                            textDecoration: isBooked ? 'line-through' : 'none', transition: 'all 0.15s',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <span>{slot.label}</span>
                            {isBooked && <span style={{ fontSize: '0.7rem' }}>Terisi</span>}
                            {isSelected && <FaCheckCircle size={13} />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSlots.length > 0 && (
                      <div style={{ background: 'var(--bg-base)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                        {selectedSlots.length} jam — Rp {(selectedSlots.length * parseFloat(selectedRoom.price_per_hour)).toLocaleString('id-ID')}
                      </div>
                    )}

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Pilih 1–3 slot berurutan.</p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" onClick={() => setBookingStep(1)} style={{ flex: 1, fontSize: '0.85rem' }}>
                        <FaArrowLeft size={11} /> Kembali
                      </button>
                      <button className="btn btn-primary" disabled={selectedSlots.length === 0} onClick={() => setBookingStep(3)} style={{ flex: 2, fontSize: '0.85rem', opacity: selectedSlots.length === 0 ? 0.4 : 1 }}>
                        Lanjut <FaArrowRight size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Confirm */}
            {bookingStep === 3 && summary && (
              <div>
                <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Lapangan</div>
                      <div style={{ fontWeight: '500' }}>{selectedRoom.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Tanggal</div>
                      <div style={{ fontWeight: '500' }}>{summary.dateFormatted}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Waktu</div>
                      <div style={{ fontWeight: '500' }}>{summary.startLabel} – {summary.endLabel}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Durasi</div>
                      <div style={{ fontWeight: '500' }}>{summary.duration} Jam</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Rp {summary.totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={() => setBookingStep(2)} style={{ flex: 1, fontSize: '0.85rem' }}>
                    <FaArrowLeft size={11} /> Ubah
                  </button>
                  <button className="btn btn-primary" onClick={handleBookingConfirm} disabled={isSubmitting} style={{ flex: 2, fontSize: '0.85rem' }}>
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
