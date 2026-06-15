const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Public routes
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.get('/:id/availability', roomController.getAvailability);

// Protected routes (Admin only)
router.post('/', authMiddleware, roleMiddleware('ADMIN'), roomController.createRoom);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), roomController.updateRoom);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), roomController.deleteRoom);

module.exports = router;
