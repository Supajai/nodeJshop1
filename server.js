require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Connect Database
connectDB();

const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // New Admin Route

console.log('[Server] All routes registered');




// API 404 Handler (Must be before the generic catch-all)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API Route not found' });
});

// Frontend Fallback (For Single Page Application feel)
app.get(/.*/, (req, res) => {
    if (req.path.endsWith('.html')) {
        res.sendFile(path.join(__dirname, 'public', req.path));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));