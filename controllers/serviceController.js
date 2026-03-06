const Service = require('../models/Service');
const slugify = require('slugify');

// Get all services
exports.getServices = async (req, res) => {
    try {
        const { listingId, categoryId, status, isFeatured, limit } = req.query;
        let query = {};

        if (listingId) query.listingId = listingId;
        if (categoryId) query.categoryId = categoryId;
        if (status) query.status = status;
        if (isFeatured === 'true') query.featured = true;

        let dbQuery = Service.find(query)
            .populate('listingId', 'name slug')
            .populate('categoryId', 'name')
            .sort({ createdAt: -1 });

        if (limit) {
            dbQuery = dbQuery.limit(parseInt(limit));
        }

        const services = await dbQuery;

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get single service
exports.getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('listingId', 'name slug')
            .populate('categoryId', 'name')
            .populate('subCategoryId', 'name');

        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }
        res.status(200).json({ success: true, data: service });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create new service
exports.createService = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        if (req.body.subCategoryId === '') delete req.body.subCategoryId;
        
        const service = await Service.create(req.body);

        res.status(201).json({
            success: true,
            data: service
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, error: `Duplicate error: ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// Update service
exports.updateService = async (req, res) => {
    try {
        req.body.updatedBy = req.user.id;

        if (req.body.subCategoryId === '') req.body.subCategoryId = null;

        // Auto-generate slug if name is updated but slug isn't provided
        if (req.body.name && !req.body.slug) {
            req.body.slug = slugify(req.body.name, { lower: true, strict: true });
        }

        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        res.status(200).json({ success: true, data: service });
    } catch (error) {
         if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, error: `Duplicate error: ${field} already exists.` });
        }
        res.status(400).json({ success: false, error: error.message });
    }
};

// Delete service
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
