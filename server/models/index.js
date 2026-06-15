const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');
const Booking = require('./Booking');

// One-to-Many: User has many Bookings
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// One-to-Many: Room has many Bookings
Room.hasMany(Booking, { foreignKey: 'roomId', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

module.exports = {
  sequelize,
  User,
  Room,
  Booking,
};
