const { Op } = require('sequelize');
const { Booking, Room, User } = require('../models');

// POST Create a new booking (User)
exports.createBooking = async (req, res) => {
  try {
    const { roomId, start_time, end_time } = req.body;
    const userId = req.user.id;

    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Validation: Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
      where: {
        roomId,
        status: { [Op.ne]: 'CANCELLED' }, // Ignore cancelled bookings
        [Op.or]: [
          { start_time: { [Op.lt]: end }, end_time: { [Op.gt]: start } }
        ]
      }
    });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Room is already booked for this time slot' });
    }

    // Calculate total price based on duration in hours
    const durationHours = (end - start) / (1000 * 60 * 60);
    const total_price = durationHours * room.price_per_hour;

    // Create booking
    const booking = await Booking.create({
      userId,
      roomId,
      start_time: start,
      end_time: end,
      total_price,
      status: 'PENDING'
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

// GET My Bookings (User)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Room, as: 'room' }]
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving your bookings' });
  }
};

// GET All Bookings (Admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Room, as: 'room', attributes: ['id', 'name'] }
      ]
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error retrieving all bookings' });
  }
};

// PUT Update Booking Status (Admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const validStatuses = ['PENDING', 'APPROVED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await booking.update({ status });
    res.json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

// PUT Cancel my own booking (User — only if still PENDING)
exports.cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Hanya booking dengan status PENDING yang bisa dibatalkan' });
    }

    await booking.update({ status: 'CANCELLED' });
    res.json({ message: 'Booking berhasil dibatalkan', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
};
