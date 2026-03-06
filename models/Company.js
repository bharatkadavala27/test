const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String, // You could also reference the Category model here
        required: true
    },
    country_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        default: null
    },
    state_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        default: null
    },
    city_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        default: null
    },
    area_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
        default: null
    },
    address: {
        type: String,
        trim: true
    },
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    claimed: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
