const { Room } = require('../models');

// GET all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving rooms' });
  }
};

// GET room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving room' });
  }
};

// POST create room (Admin only)
exports.createRoom = async (req, res) => {
  try {
    const { name, description, capacity, price_per_hour } = req.body;
    const newRoom = await Room.create({ name, description, capacity, price_per_hour });
    res.status(201).json({ message: 'Room created successfully', room: newRoom });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating room' });
  }
};

// PUT update room (Admin only)
exports.updateRoom = async (req, res) => {
  try {
    const { name, description, capacity, price_per_hour } = req.body;
    const room = await Room.findByPk(req.params.id);
    
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await room.update({ name, description, capacity, price_per_hour });
    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating room' });
  }
};

// DELETE room (Admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    await room.destroy();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting room' });
  }
};

// GET room availability for a specific date (slot-based, 08:00-22:00)
exports.getAvailability = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const { Booking } = require('../models');

    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const dateStr = req.query.date; // Expected: YYYY-MM-DD
    if (!dateStr) return res.status(400).json({ message: 'Parameter "date" is required (YYYY-MM-DD)' });

    // Build day boundaries
    const dayStart = new Date(`${dateStr}T00:00:00`);
    const dayEnd = new Date(`${dateStr}T23:59:59`);

    // Fetch all non-cancelled bookings for this room on this date
    const bookings = await Booking.findAll({
      where: {
        roomId: req.params.id,
        status: { [Op.ne]: 'CANCELLED' },
        start_time: { [Op.lt]: dayEnd },
        end_time: { [Op.gt]: dayStart },
      },
    });

    // Generate slot grid: 08:00 — 22:00 (14 slots, each 1 hour)
    const OPEN_HOUR = 8;
    const CLOSE_HOUR = 22;
    const slots = [];

    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      const slotStart = new Date(`${dateStr}T${String(h).padStart(2, '0')}:00:00`);
      const slotEnd = new Date(`${dateStr}T${String(h + 1).padStart(2, '0')}:00:00`);

      // Check if any booking overlaps with this slot
      const isBooked = bookings.some(b => {
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        return bStart < slotEnd && bEnd > slotStart;
      });

      slots.push({
        hour: h,
        label: `${String(h).padStart(2, '0')}:00 – ${String(h + 1).padStart(2, '0')}:00`,
        status: isBooked ? 'booked' : 'available',
      });
    }

    res.json({ roomId: room.id, roomName: room.name, date: dateStr, slots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error checking availability' });
  }
};
