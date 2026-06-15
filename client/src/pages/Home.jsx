import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle, FaTimes, FaFutbol, FaCalendarAlt, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const navigate = useNavigate();

  // Booking flow state
  const [bookingStep, setBookingStep] = useState(1); // 1=pilih tanggal, 2=pilih slot, 3=konfirmasi
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]); // array of hour numbers
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
    } catch (error) {
      console.error('Gagal memuat data lapangan', error);
    }
  };

  // Generate available dates (today + 7 days)
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
      console.error('Gagal cek ketersediaan', err);
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
      if (prev.includes(hour)) {
        // Deselect: remove this and any slots after it to keep contiguous
        return prev.filter(h => h < hour);
      }
      
      const newSlots = [...prev, hour].sort((a, b) => a - b);

      // Validate contiguous
      for (let i = 1; i < newSlots.length; i++) {
        if (newSlots[i] !== newSlots[i - 1] + 1) {
          // Not contiguous, only keep up to the break
          return newSlots.slice(0, i);
        }
      }

      // Validate max 3 hours
      if (newSlots.length > 3) {
        return prev; // ignore
      }

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
      dateFormatted: new Date(selectedDate).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      }),
    };
  };

  const handleBookingConfirm = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    const sorted = [...selectedSlots].sort((a, b) => a - b);
    const startHour = sorted[0];
    const endHour = sorted[sorted.length - 1] + 1;

    setIsSubmitting(true);
    setBookingError('');
    try {
      await axios.post(
        'http://localhost:5000/api/bookings',
        {
          roomId: selectedRoom.id,
          start_time: `${selectedDate}T${String(startHour).padStart(2, '0')}:00:00`,
          end_time: `${selectedDate}T${String(endHour).padStart(2, '0')}:00:00`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingSuccess('Booking berhasil! Cek status di halaman Booking Saya.');
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Booking gagal diproses.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (room) => {
    if (!token) {
      navigate('/login');
      return;
    }
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
  const availableDates = getAvailableDates();

  return (
    <div style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div className="animate-slide-up">
          <span style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-primary)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '24px', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
            Aplikasi Booking Lapangan #1
          </span>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', letterSpacing: '-1px', marginBottom: '24px', lineHeight: '1.1' }}>
            Main Futsal<br/>
            <span className="text-gradient">Gak Pake Ribet.</span>
          </h1>
        </div>
      </div>

      {/* Arena Listings */}
      <div className="container animate-slide-up stagger-2">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2rem' }}>Pilihan Lapangan</h2>
            <p style={{ color: 'var(--text-tertiary)' }}>Pilih lapangan, tentukan jadwal, langsung main.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '32px' }}>
          {rooms.map((room, idx) => (
            <div key={room.id} className="glass-card" style={{ padding: '0', animationDelay: `${idx * 0.1}s` }}>
              <div style={{ height: '200px', background: 'linear-gradient(to bottom, rgba(16, 20, 31, 0), var(--bg-surface)), url("https://images.unsplash.com/photo-1521217078329-f8fc1becab68?q=80&w=1470&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                  <FaCheckCircle color="var(--success-color)" /> Tersedia
                </div>
              </div>
              
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{room.name}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <FaMapMarkerAlt color="var(--accent-primary)" /> Fasilitas Lengkap & Nyaman
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <FaUsers color="var(--accent-primary)" /> Maks. {room.capacity} Pemain
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Harga Sewa</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Rp {parseFloat(room.price_per_hour).toLocaleString('id-ID')} <span style={{fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 'normal'}}>/jam</span>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={() => openModal(room)} style={{ padding: '10px 20px' }}>
                    Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-light)' }}>
              <FaFutbol size={40} color="var(--text-tertiary)" style={{ marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Belum ada lapangan yang terdaftar.</h3>
              <p style={{ color: 'var(--text-tertiary)' }}>Hubungi Admin untuk informasi lebih lanjut.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal — Multi-Step */}
      {selectedRoom && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(7, 9, 15, 0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: '560px', padding: '40px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Booking {selectedRoom.name}</h2>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  {bookingStep === 1 && 'Pilih tanggal main'}
                  {bookingStep === 2 && 'Pilih jam yang tersedia'}
                  {bookingStep === 3 && 'Cek ringkasan booking'}
                </p>
              </div>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '8px' }}>
                <FaTimes size={20} />
              </button>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{
                  flex: 1, height: '4px', borderRadius: '2px',
                  background: s <= bookingStep ? 'var(--accent-primary)' : 'var(--border-light)',
                  transition: 'background 0.3s'
                }} />
              ))}
            </div>

            {/* Error / Success Messages */}
            {bookingError && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--danger-color)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>{bookingError}</div>}
            {bookingSuccess && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{bookingSuccess}</div>}

            {/* STEP 1: Pilih Tanggal */}
            {bookingStep === 1 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {availableDates.map(d => (
                    <button
                      key={d.value}
                      onClick={() => handleDateSelect(d.value)}
                      style={{
                        padding: '16px 8px', border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                        background: 'var(--bg-surface)', color: 'var(--text-primary)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.background = 'rgba(0,210,255,0.05)'; }}
                      onMouseLeave={e => { e.target.style.borderColor = 'var(--border-light)'; e.target.style.background = 'var(--bg-surface)'; }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                        {d.isToday ? 'Hari ini' : d.dayName}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{d.dayNum}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{d.monthName}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Pilih Slot Jam */}
            {bookingStep === 2 && (
              <div>
                {loadingSlots ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>Memuat jadwal...</div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
                      {slots.map(slot => {
                        const isBooked = slot.status === 'booked';
                        const isSelected = selectedSlots.includes(slot.hour);
                        return (
                          <button
                            key={slot.hour}
                            disabled={isBooked}
                            onClick={() => handleSlotToggle(slot.hour)}
                            style={{
                              padding: '14px', borderRadius: 'var(--radius-md)',
                              border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
                              background: isBooked ? 'rgba(244, 63, 94, 0.08)' : isSelected ? 'rgba(0, 210, 255, 0.1)' : 'var(--bg-surface)',
                              color: isBooked ? 'var(--text-tertiary)' : isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                              cursor: isBooked ? 'not-allowed' : 'pointer',
                              textDecoration: isBooked ? 'line-through' : 'none',
                              opacity: isBooked ? 0.5 : 1,
                              transition: 'all 0.2s', fontWeight: '500', fontSize: '0.95rem',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}
                          >
                            <span><FaClock size={12} style={{ marginRight: '8px', opacity: 0.6 }} />{slot.label}</span>
                            {isBooked && <span style={{ fontSize: '0.75rem' }}>Terisi</span>}
                            {isSelected && <FaCheckCircle size={14} />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSlots.length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {selectedSlots.length} jam dipilih — Rp {(selectedSlots.length * parseFloat(selectedRoom.price_per_hour)).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                      Pilih 1–3 slot berurutan. Slot yang sudah terisi tidak bisa dipilih.
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="btn" onClick={() => setBookingStep(1)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <FaArrowLeft size={12} /> Ganti Tanggal
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={selectedSlots.length === 0}
                        onClick={() => setBookingStep(3)}
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: selectedSlots.length === 0 ? 0.5 : 1 }}
                      >
                        Lanjut <FaArrowRight size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 3: Konfirmasi */}
            {bookingStep === 3 && summary && (
              <div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Lapangan</div>
                      <div style={{ fontWeight: '600' }}>{selectedRoom.name}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Tanggal</div>
                      <div style={{ fontWeight: '600' }}>{summary.dateFormatted}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Waktu</div>
                      <div style={{ fontWeight: '600' }}>{summary.startLabel} – {summary.endLabel}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Durasi</div>
                      <div style={{ fontWeight: '600' }}>{summary.duration} Jam</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Harga</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
                      Rp {summary.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn" onClick={() => setBookingStep(2)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <FaArrowLeft size={12} /> Ubah Jam
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleBookingConfirm}
                    disabled={isSubmitting}
                    style={{ flex: 2 }}
                  >
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
