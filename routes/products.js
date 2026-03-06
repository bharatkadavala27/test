const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getProducts);
router.route('/:id').get(getProduct);

// Protected routes (Admin / Listing Owner)
// For MVP, we restrict to Super Admin. In the future, this can be expanded to 'Listing Owner' or 'Business'.
router.use(protect);
router.use(authorize('Super Admin'));

router.route('/').post(createProduct);
router.route('/:id')
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;
