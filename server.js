// File: server.js
// Node.js backend to serve protected PDF access

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const BLOCKED_REG = '230101277';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'letmein';

const ALLOWED_DEVICES = ['Android', 'iPhone', 'Mobile'];

// Middleware: only allow mobile devices
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isAllowed = ALLOWED_DEVICES.some(device => userAgent.includes(device));
  if (!isAllowed) {
    return res.status(403).send('Access denied: only mobile devices allowed.');
  }
  next();
});

// Auth endpoint
app.post('/api/auth', (req, res) => {
  const { password } = req.body;
  if (password === AUTH_PASSWORD) {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Incorrect password' });
});true


// PDF retrieval endpoint
app.post('/api/get-pdf', (req, res) => {
  const { reg } = req.body;
  if (!reg) return res.status(400).json({ error: true, message: 'No reg number provided' });

  if (reg === BLOCKED_REG) {
    return res.status(403).json({ error: true, message: 'Access denied for this reg number.' });
  }

  const fileURL = `https://luanar.ac.mw/apps/msis/get_statement.php?${reg}`;
  const viewer = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileURL)}`;
  res.json({ error: false, viewer });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/08913.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
