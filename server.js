const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files for the landing page from public/landing
app.use(express.static(path.join(__dirname, 'public/landing')));

// Serve static files for the React app from /tile/static
app.use('/tile/static', express.static(path.join(__dirname, 'build/static')));

// Serve other React build assets (favicon, manifest, etc.) at /tile
app.use('/tile', express.static(path.join(__dirname, 'build')));

// Serve the landing page at /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/landing', 'index.html'));
});

// Serve the React app at /tile and handle client-side routing
app.get(/^\/tile(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 