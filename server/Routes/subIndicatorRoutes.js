const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure
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




// Create sub indicators
router.post('/subIndicators', async (req, res) => {
    const { name, description, indicator_id } = req.body; // Exclude image_url

    try {
        // Validate input parameters
        if (!name || !indicator_id) {
            return res.status(400).json({ error: 'Name and indicator_id are required.' });
        }

        // Insert the new sub-indicator into the indicatorscategory table
        const [result] = await db.query(
            'INSERT INTO indicatorscategory (name, description, indicator_id) VALUES (?, ?, ?)', 
            [name, description, indicator_id]
        );

        // Fetch the newly created sub-indicator
        const [newSubIndicator] = await db.query('SELECT * FROM indicatorscategory WHERE id = ?', [result.insertId]);

        // Respond with the created sub-indicator
        res.status(201).json(newSubIndicator);
    } catch (error) {
        console.error('Error creating sub-indicator:', error);
        res.status(500).json({ error: 'Error creating sub-indicator' });
    }
});


// Image upload route for a specific indicator
router.post('/subIndicators/:id/uploadImages', upload.single('image'), async (req, res) => {
    const subIndicatorId = req.params.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const [result] = await db.query(
            'UPDATE indicatorscategory SET image_url = ? WHERE id = ?',
            [imageUrl, subIndicatorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sub Indicator not found' });
        }

        res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error.message);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});


// Get all sub-indicators
router.get('/subIndicators', async (req, res) => {
    try {
        const [subIndicators] = await db.query('SELECT * FROM indicatorscategory');
        res.json(subIndicators);
    } catch (error) {
        console.error('Error fetching sub-indicators:', error);
        res.status(500).json({ error: 'Error fetching sub-indicators' });
    }
});

// Get all sub-indicators by indicator_id
router.get('/subIndicators/:indicator_id', async (req, res) => {
    const { indicator_id } = req.params;

    try {
        // Fetch sub-indicators based on indicator_id
        const [subIndicators] = await db.query(
            'SELECT * FROM indicatorscategory WHERE indicator_id = ?', 
            [indicator_id]
        );

        res.status(200).json(subIndicators);
    } catch (error) {
        console.error('Error fetching sub-indicators:', error);
        res.status(500).json({ error: 'Error fetching sub-indicators' });
    }
});

router.get('/subIndicators/:id/image', async (req, res) => {
    const subIndicatorId = req.params.id;
  
    try {
      const [rows] = await db.query('SELECT image_url FROM indicatorscategory WHERE id = ?', [subIndicatorId]);
  
      if (rows.length > 0 && rows[0].image_url) {
        const imagePath = path.join(__dirname, '..', rows[0].image_url); // Construct the full path to the image file
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
  
// Get sub-indicators by indicator_id
// router.get('/subIndicators/indicator/:indicatorId', async (req, res) => {
//     const { indicatorId } = req.params;
//     try {
//         const [subIndicators] = await db.query('SELECT * FROM indicatorscategory WHERE indicator_id = ?', [indicatorId]);
//         res.json(subIndicators);
//     } catch (error) {
//         console.error('Error fetching sub-indicators by indicator_id:', error);
//         res.status(500).json({ error: 'Error fetching sub-indicators by indicator_id' });
//     }
// });

// Get a specific sub-indicator by indicator_id and subindicator_id
router.get('/subIndicators/:indicatorId/:subIndicatorId', async (req, res) => {
    const { indicatorId, subIndicatorId } = req.params;
    try {
        const [subIndicator] = await db.query('SELECT * FROM indicatorscategory WHERE indicator_id = ? AND id = ?', [indicatorId, subIndicatorId]);
        
        if (subIndicator.length === 0) {
            return res.status(404).json({ error: 'Sub-indicator not found.' });
        }
        
        res.json(subIndicator[0]);
    } catch (error) {
        console.error('Error fetching sub-indicator:', error);
        res.status(500).json({ error: 'Error fetching sub-indicator' });
    }
});

// Delete a sub-indicator
router.delete('/subIndicators/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM indicatorscategory WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sub-indicator not found.' });
        }

        res.status(204).send(); // No content to send back
    } catch (error) {
        console.error('Error deleting sub-indicator:', error);
        res.status(500).json({ error: 'Error deleting sub-indicator' });
    }
});

module.exports = router;
