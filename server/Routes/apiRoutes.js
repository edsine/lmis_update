const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure this path matches your setup
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage });

// Example route to test the API
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Create a new indicator
router.post('/indicators', async (req, res) => {
  const { name, description} = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO indicators (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ message: 'Indicator created successfully', indicatorId: result.insertId });
  } catch (error) {
    console.error('Error creating indicator:', error.message);
    res.status(500).json({ message: 'Error creating indicator', error: error.message });
  }
});


// Image upload route for a specific indicator
router.post('/indicators/:id/uploadImages', upload.single('image'), async (req, res) => {
  const indicatorId = req.params.id;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Use req.file.filename instead of req.file.originalname

  if (!imageUrl) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const [result] = await db.query(
      'UPDATE indicators SET file_url = ? WHERE id = ?',
      [imageUrl, indicatorId] // Update to file_url
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Indicator not found' });
    }

    res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});


// Get all indicators
router.get('/indicators', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM indicators');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching indicators:', error.message);
    res.status(500).json({ message: 'Error fetching indicators', error: error.message });
  }
});

// Get a specific indicator by ID
router.get('/indicators/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM indicators WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Indicator not found' });
    }
  } catch (error) {
    console.error('Error fetching indicator:', error.message);
    res.status(500).json({ message: 'Error fetching indicator', error: error.message });
  }
});

// New route to get image by indicator ID
// Image retrieval route for a specific indicator
router.get('/indicators/:id/image', async (req, res) => {
  const indicatorId = req.params.id;

  try {
    const [rows] = await db.query('SELECT file_url FROM indicators WHERE id = ?', [indicatorId]);

    if (rows.length > 0 && rows[0].file_url) {
      const imagePath = path.join(__dirname, '..', rows[0].file_url); // Construct the full path to the image file
      console.log('Image path:', imagePath); // Log the image path for debugging

      res.sendFile(imagePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).json({ message: 'Error fetching image', error: err.message });
        }
      });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
});

// Get indicators by category_id
router.get('/indicators/:category_id', async (req, res) => {
  const { category_id } = req.params;
  try {
      const [indicators] = await db.query('SELECT * FROM indicators WHERE category_id = ?', [category_id]);
      res.status(200).json(indicators);
  } catch (error) {
      console.error('Error fetching indicators:', error);
      res.status(500).json({ error: 'Error fetching indicators' });
  }
});


// Update an indicator
router.put('/indicators/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, value, unit, image_url, category, source, date_collected, trend, visualization_type, related_indicators } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE indicators SET name = ?, description = ?, value = ?, unit = ?, image_url = ?, category = ?, source = ?, date_collected = ?, trend = ?, visualization_type = ?, related_indicators = ? WHERE id = ?',
      [name, description, value, unit, image_url, category, source, date_collected, trend, visualization_type, related_indicators, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Indicator updated successfully' });
    } else {
      res.status(404).json({ message: 'Indicator not found' });
    }
  } catch (error) {
    console.error('Error updating indicator:', error.message);
    res.status(500).json({ message: 'Error updating indicator', error: error.message });
  }
});

// Delete an indicator
router.delete('/indicators/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM indicators WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Indicator deleted successfully' });
    } else {
      res.status(404).json({ message: 'Indicator not found' });
    }
  } catch (error) {
    console.error('Error deleting indicator:', error.message);
    res.status(500).json({ message: 'Error deleting indicator', error: error.message });
  }
});








module.exports = router;
