require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const seedDb = require('./seeder');
const redis = require('./config/redis');

const authRoutes = require('./routes/auth.routes');
const nodeRoutes = require('./routes/node.routes');
const connectionRoutes = require('./routes/connection.routes');
const productRoutes = require('./routes/product.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const shipmentRoutes = require('./routes/shipment.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
app.set('trust proxy',1);
const PORT = process.env.PORT || 8080;

// CORS configuration
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const limiter = require('./middleware/rateLimiter');
app.use(limiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Supply Chain Visualizer Node.js API!' });
});

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/supply_chain_db';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    await seedDb();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

