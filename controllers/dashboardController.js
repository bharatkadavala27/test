const User = require('../models/User');
const Company = require('../models/Company');
const Category = require('../models/Category');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalCompanies, activeCategories, pendingClaims] = await Promise.all([
            User.countDocuments(),
            Company.countDocuments(),
            Category.countDocuments({ status: 'Active' }),
            Company.countDocuments({ verified: false }) // Assuming unverified companies are 'pending'
        ]);

        res.json({
            totalUsers,
            totalCompanies,
            activeCategories,
            pendingClaims
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

module.exports = { getDashboardStats };
