const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/companies
const getAllCompanies = async (req, res) => {
    try {
        const { q, category, categoryId, city, area, isFeatured, featured } = req.query;
        let query = {};

        // 1. Initial Location / Featured filters
        if (city) query.city_id = city;
        if (area) query.area_id = area;
        if (isFeatured !== undefined || featured !== undefined) {
            query.isFeatured = (isFeatured === 'true' || featured === 'true');
        }

        // 2. Fetch base companies matching location/featured filters
        let companies = await Company.find(query)
            .populate('city_id', 'name slug')
            .populate('state_id', 'name slug')
            .populate('area_id', 'name slug')
            .lean(); 

        const Product = require('../models/Product');
        const Service = require('../models/Service');
        const companyIds = companies.map(c => c._id);

        // 3. Prepare queries for Products & Services linked to these companies
        let productQuery = { listingId: { $in: companyIds }, status: 'Active' };
        let serviceQuery = { listingId: { $in: companyIds }, status: 'Active' };

        // If a specific category ID is passed from the frontend (parent or sub)
        if (categoryId) {
            const catMatch = { $or: [{ categoryId: categoryId }, { subCategoryId: categoryId }] };
            productQuery = { ...productQuery, ...catMatch };
            serviceQuery = { ...serviceQuery, ...catMatch };
        }

        // 4. Fetch associated items
        const [allProducts, allServices] = await Promise.all([
            Product.find(productQuery).lean(),
            Service.find(serviceQuery).lean()
        ]);

        // 5. Build lookup maps for fast attachment
        const productsByCompany = {};
        allProducts.forEach(p => {
            const cid = p.listingId.toString();
            if(!productsByCompany[cid]) productsByCompany[cid] = [];
            productsByCompany[cid].push(p);
        });

        const servicesByCompany = {};
        allServices.forEach(s => {
            const cid = s.listingId.toString();
            if(!servicesByCompany[cid]) servicesByCompany[cid] = [];
            servicesByCompany[cid].push(s);
        });

        // 6. Attach arrays to companies and Filter
        companies = companies.map(company => {
            company.products = productsByCompany[company._id.toString()] || [];
            company.services = servicesByCompany[company._id.toString()] || [];
            return company;
        });

        // Filter by Category/SubCategory ID vs String (Support both Legacy and New logic)
        if (categoryId || category) {
            companies = companies.filter(c => {
                // If the company's explicit legacy category matches the string
                const matchesLegacyString = category && c.category === category;
                // Or if it has any product/service matching the category ObjectId
                const hasMatchingProduct = c.products.length > 0;
                const hasMatchingService = c.services.length > 0;
                
                return matchesLegacyString || hasMatchingProduct || hasMatchingService;
            });
        }

        // 7. Keyword search (name, description, or attached product/service name)
        if (q) {
            const regex = new RegExp(q, 'i');
            companies = companies.filter(company => {
                const matchCompany = regex.test(company.name) || regex.test(company.description);
                const matchProduct = company.products.some(p => regex.test(p.name) || regex.test(p.shortDescription));
                const matchService = company.services.some(s => regex.test(s.name) || regex.test(s.shortDescription));
                
                return matchCompany || matchProduct || matchService;
            });
        }

        // Sort by createdAt descending
        companies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Create a new company
// @route   POST /api/companies
const createCompany = async (req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
const updateCompany = async (req, res) => {
    try {
        let company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ msg: 'Company not found' });

        company = await Company.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(company);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Company not found' });
        res.status(500).json({ msg: 'Server Error' });
    }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ msg: 'Company not found' });

        await Company.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Company removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Company not found' });
        res.status(500).json({ msg: 'Server Error' });
    }
};

module.exports = { getAllCompanies, createCompany, updateCompany, deleteCompany };
