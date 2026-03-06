const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));       // parse JSON bodies (10mb for base64 images)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
// 🌐 Atlas URI (use when cloud is working, set MONGO_URI in .env):
// const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://bharatfuerte:bharatfuerte@cluster0.qvepcht.mongodb.net/justdial?retryWrites=true&w=majority&appName=spadb';

// 💻 Local MongoDB URI (used for development):
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/justdial';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ Failed to connect to MongoDB', err));

// Routes placeholders
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Import routers
app.use('/api/categories', require('./routes/categories'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));            // Cloudinary image upload
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/sliders', require('./routes/sliders'));
app.use('/api/popular-searches', require('./routes/popularSearches'));
app.use('/api/products', require('./routes/products'));
app.use('/api/services', require('./routes/services'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
