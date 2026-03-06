const express = require('express');
const router = express.Router();
const { getAllCompanies, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');

// @route   GET /api/companies
router.get('/', getAllCompanies);

// @route   POST /api/companies
router.post('/', createCompany);

// @route   PUT /api/companies/:id
router.put('/:id', updateCompany);

// @route   DELETE /api/companies/:id
router.delete('/:id', deleteCompany);

module.exports = router;
