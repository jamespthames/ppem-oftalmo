require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: IS_PROD ? '*' : (process.env.FRONTEND_URL || 'http://localhost:3000'),
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    env: {
      NODE_ENV: process.env.NODE_ENV || 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'MISSING',
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'MISSING',
    },
  });
});

app.use('/api/auth',      require('./src/routes/auth'));
app.use('/api/questions', require('./src/routes/questions'));
app.use('/api/sessions',  require('./src/routes/sessions'));
app.use('/api/progress',  require('./src/routes/progress'));
app.use('/api/admin',     require('./src/routes/admin'));
app.use('/api/changelog', require('./src/routes/changelog'));

// Serve React build in production
if (IS_PROD) {
  const buildPath = path.join(__dirname, '../frontend/dist');
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  }
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${IS_PROD ? 'production' : 'development'}]`);
});
