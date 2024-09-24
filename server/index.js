const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const db = require('./db');

// Import routes
const apiRoutes = require('./Routes/apiRoutes');
const sectorRoutes = require('./Routes/sectorRoutes');
const stateRoutes = require('./Routes/stateRoutes');
const keyFactsRoutes = require('./Routes/keyFactsRoute');
const indicatorDetailsRoutes = require('./Routes/indicatorDetails');
const subIndicatorRoutes = require('./Routes/subIndicatorRoutes');
const occupationRoutes = require('./Routes/occupationsRoutes');
const uploadRoutes = require('./Routes/cmsRoutes');
const app = express();
const port = process.env.PORT || 7000; // Default to port 7000 if no port is specified


// Middleware setup
app.use(cors()); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse JSON request bodies

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Use routes
app.use('/api', apiRoutes);

// Use sector routes
app.use('/api', sectorRoutes);

// Use state routes
app.use('/api', stateRoutes);

// Use keyfacts routes
app.use('/api', keyFactsRoutes);

//Use indicator details route
app.use('/api', indicatorDetailsRoutes);

//Use  sub indicator details route
app.use('/api', subIndicatorRoutes);

//Use  occupational  route
app.use('/api', occupationRoutes);


//Use  uploadRoutes
app.use('/api', uploadRoutes);




// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

