const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'Justdial Clone',
    },
    logoUrl: {
        type: String,
        default: '',
    },
    primaryColor: {
        type: String,
        default: '#274C64', // Tech Blue
    },
    secondaryColor: {
        type: String,
        default: '#F5AB34', // Brand Orange
    },
    contactEmail: {
        type: String,
        default: 'contact@justdial.com',
    },
    contactPhone: {
        type: String,
        default: '+1 234 567 8900',
    },
    footerText: {
        type: String,
        default: '© 2026 Justdial Clone. All rights reserved.',
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
