const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory, getCategoryBySlug } = require('../controllers/categoryController');

router.get('/', getAllCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
