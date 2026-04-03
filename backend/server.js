require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedAdmin = require('./seedAdmin');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedAdmin();
      const port = process.env.PORT || 5001;
      app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (err) {
      console.error('Server startup error:', err);
      process.exit(1);
    }
  })();
}

module.exports = app;
