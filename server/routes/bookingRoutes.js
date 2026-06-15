const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All booking routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', bookingController.createBooking);
router.get('/my-bookings', bookingController.getMyBookings);
router.put('/:id/cancel', bookingController.cancelMyBooking);

// Admin routes
router.get('/', roleMiddleware('ADMIN'), bookingController.getAllBookings);
router.put('/:id/status', roleMiddleware('ADMIN'), bookingController.updateBookingStatus);

module.exports = router;
