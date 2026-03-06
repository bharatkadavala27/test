const Product = require('../models/Product');
const slugify = require('slugify');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const { listingId, categoryId, status, isFeatured, limit } = req.query;
        let query = {};

        if (listingId) query.listingId = listingId;
        if (categoryId) query.categoryId = categoryId;
        if (status) query.status = status;
        if (isFeatured === 'true') query.featured = true;

        let dbQuery = Product.find(query)
            .populate('listingId', 'name slug')
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });

        if (limit) {
            dbQuery = dbQuery.limit(parseInt(limit));
        }

        const products = await dbQuery;

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('listingId', 'name slug')
            .populate('categoryId', 'name')
            .populate('subCategoryId', 'name')
            .populate('brandId', 'name');

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        // Add user ID to request body
        req.body.createdBy = req.user.id;
        
        if (req.body.subCategoryId === '') delete req.body.subCategoryId;
        if (req.body.brandId === '') delete req.body.brandId;
        
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        // Handle Mongoose duplicate key error (11000) for SKU/Slug
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, error: `Duplicate error: ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        req.body.updatedBy = req.user.id;

        if (req.body.subCategoryId === '') req.body.subCategoryId = null;
        if (req.body.brandId === '') req.body.brandId = null;

        // Auto-generate slug if name is updated but slug isn't provided
        if (req.body.name && !req.body.slug) {
            req.body.slug = slugify(req.body.name, { lower: true, strict: true });
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
         if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, error: `Duplicate error: ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
