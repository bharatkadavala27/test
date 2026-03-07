const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS - allow local dev + your Netlify site
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://fuerte-dial.netlify.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ MongoDB Connection
// - Uses MONGO_URI (from env) in production
// - Falls back to local MongoDB in development if Atlas is unreachable
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/justdial';
const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/justdial';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB:', MONGO_URI);
        return;
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB:', err.message);

        // For local development, attempt fallback to local MongoDB
        if (process.env.NODE_ENV !== 'production' && MONGO_URI !== LOCAL_MONGO_URI) {
            console.log('⚙️ Falling back to local MongoDB at', LOCAL_MONGO_URI);
            try {
                await mongoose.connect(LOCAL_MONGO_URI);
                console.log('✅ Connected to local MongoDB:', LOCAL_MONGO_URI);
                return;
            } catch (localErr) {
                console.error('❌ Failed to connect to local MongoDB:', localErr.message);
            }
        }

        // In production (or if fallback fails), exit so deploy fails fast
        process.exit(1);
    }
};

// Start server after DB connection
const startServer = async () => {
    await connectDB();

    // ✅ Bind to 0.0.0.0 so Render can detect the open port
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer();

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/sliders', require('./routes/sliders'));
app.use('/api/popular-searches', require('./routes/popularSearches'));
app.use('/api/products', require('./routes/products'));
app.use('/api/services', require('./routes/services'));

// ✅ Bind to 0.0.0.0 so Render can detect the open port
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});