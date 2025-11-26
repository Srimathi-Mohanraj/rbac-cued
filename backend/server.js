
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',            
  
];

const corsOptions = {
  origin: function(origin, callback) {
  
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      
      console.warn('CORS blocked origin:', origin);
      return callback(new Error('CORS policy: This origin is not allowed.'), false);
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// ---------- import routes AFTER CORS so preflight works ----------
const authRoutes = require('./routes/auth');
const rolesRoutes = require('./routes/roles');
const staffRoutes = require('./routes/staff');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/staff', staffRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// optional: serve frontend if it exists in backend/public
const publicPath = path.join(__dirname, 'public');
if (require('fs').existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  console.log('*** No static client found at', publicPath, '- skipping static serve (frontend hosted separately).');
}

// ---------- Mongoose connection options ----------
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
};

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || process.env.MONGO_CONNECTION_STRING;
if (!MONGO_URI) {
  console.error('FATAL: No MONGO_URI set in environment. Please set MONGO_URI (or DATABASE_URL) in your .env or platform settings.');
  process.exit(1);
}

async function connectWithRetry(retries = 5, delayMs = 3000) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI, mongooseOptions);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      lastErr = err;
      console.error(`MongoDB connect attempt ${i + 1} failed:`, err.message || err);
      if (i < retries - 1) {
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr;
}

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectWithRetry(5, 3000);
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (err) {
    console.error('FATAL: Could not connect to MongoDB. Exiting.');
    console.error(err);
    process.exit(1);
  }
})();


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});
