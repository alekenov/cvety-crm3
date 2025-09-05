const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API proxy middleware - forward all /api requests to cvety.kz
app.use('/api', createProxyMiddleware({
  target: 'https://cvety.kz',
  changeOrigin: true,
  secure: true,
  followRedirects: true,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔧 Proxying API request: ${req.method} ${req.url} -> https://cvety.kz${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error for ${req.url}:`, err.message);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Image and upload proxy middleware - forward /upload requests to cvety.kz
app.use('/upload', createProxyMiddleware({
  target: 'https://cvety.kz',
  changeOrigin: true,
  secure: true,
  followRedirects: true,
  logLevel: 'info',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`📸 Proxying image request: ${req.method} ${req.url} -> https://cvety.kz${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ Image proxy error for ${req.url}:`, err.message);
    res.status(404).send('Image not found');
  }
}));

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API proxy: /api/* -> https://cvety.kz/api/*`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});