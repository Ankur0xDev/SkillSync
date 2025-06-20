import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeSocket } from './socket.js';

// Import routes
import authRoutes from './Routes/auth.js';
import userRoutes from './Routes/users.js';
import connectionRoutes from './Routes/connections.js';
import communityRoutes from './Routes/community.js';
import projectRoutes from './Routes/projects.js';
import teamDashboardRoutes from './Routes/teamDashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
const allowedOrigins = ['http://localhost:5173', 'https://skill-sync-lime.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like curl or Postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('📝 Please ensure you have:');
    console.log('   1. Created a MongoDB Atlas account at https://www.mongodb.com/atlas');
    console.log('   2. Created a cluster and database user');
    console.log('   3. Updated the MONGODB_URI in your .env file with your connection string');
    console.log('   4. Whitelisted your IP address in MongoDB Atlas Network Access');
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/team-dashboard', teamDashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize Socket.IO
initializeSocket(server);