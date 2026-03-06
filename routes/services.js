const express = require('express');
const router = express.Router();
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService
} = require('../controllers/serviceController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getServices);
router.route('/:id').get(getService);

// Protected routes (Admin / Service Provider)
// For MVP, we restrict to Super Admin.
router.use(protect);
router.use(authorize('Super Admin'));

router.route('/').post(createService);
router.route('/:id')
    .put(updateService)
    .delete(deleteService);

module.exports = router;
