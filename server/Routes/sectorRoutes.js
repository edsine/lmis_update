const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure
const multer = require('multer');
const path = require('path');
const fs = require('fs');



// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // Create the uploads folder if it doesn't exist
    }
    cb(null, dir); // Save the file in the uploads folder
  },
  filename: function (req, file, cb) {
    const sectorId = req.params.id; // Use sector ID to name the file
    cb(null, `${sectorId}${path.extname(file.originalname)}`); // Save as <sectorId>.pdf
  }
});

const upload = multer({ storage: storage });




// Create a new sector
router.post('/sectors', async (req, res) => {
  const { name, description, indicator_id, image_url } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO sectors (name, description, indicator_id, image_url) VALUES (?, ?, ?, ?)',
      [name, description, indicator_id, image_url]
    );
    res.status(201).json({ message: 'Sector created successfully', sectorId: result.insertId });
  } catch (error) {
    console.error('Error creating sector:', error.message);
    res.status(500).json({ message: 'Error creating sector', error: error.message });
  }
});

//upload route for pdf sectors
router.post('/sectors/:id/upload', upload.single('file'), async (req, res) => {
  const sectorId = req.params.id;
  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename); // Full path to the file

  try {
    // Update the sector with the file path
    await db.query('UPDATE sectors SET file_path = ? WHERE id = ?', [filePath, sectorId]);

    res.status(200).json({ message: 'File uploaded successfully', filePath });
  } catch (error) {
    console.error('Error associating file with sector:', error);
    res.status(500).json({ message: 'Error uploading file', error });
  }
});





// Get all sectors
router.get('/sectors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sectors');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching sectors:', error.message);
    res.status(500).json({ message: 'Error fetching sectors', error: error.message });
  }
});

// Get a specific sector by ID
router.get('/sectors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM sectors WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Sector not found' });
    }
  } catch (error) {
    console.error('Error fetching sector:', error.message);
    res.status(500).json({ message: 'Error fetching sector', error: error.message });
  }
});

// Get file by sector ID - Retrieve the file
router.get('/sectors/:id/file', async (req, res) => {
  const sectorId = req.params.id;

  try {
    // Get the file path from the database
    const [rows] = await db.query('SELECT file_path FROM sectors WHERE id = ?', [sectorId]);
    if (rows.length > 0) {
      const filePath = rows[0].file_path;
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file', error });
  }
});



// Update a sector
router.put('/sectors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, indicator_id, image_url } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE sectors SET name = ?, description = ?, indicator_id = ?, image_url = ? WHERE id = ?',
      [name, description, indicator_id, image_url, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Sector updated successfully' });
    } else {
      res.status(404).json({ message: 'Sector not found' });
    }
  } catch (error) {
    console.error('Error updating sector:', error.message);
    res.status(500).json({ message: 'Error updating sector', error: error.message });
  }
});

// Delete a sector
router.delete('/sectors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM sectors WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Sector deleted successfully' });
    } else {
      res.status(404).json({ message: 'Sector not found' });
    }
  } catch (error) {
    console.error('Error deleting sector:', error.message);
    res.status(500).json({ message: 'Error deleting sector', error: error.message });
  }
});

module.exports = router;
