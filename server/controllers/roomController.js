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
