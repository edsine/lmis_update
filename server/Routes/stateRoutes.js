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

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Image upload route for a specific state
router.post('/states/:id/uploadImages', upload.single('image'), async (req, res) => {
    const stateId = req.params.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; // Use req.file.filename

    if (!imageUrl) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const [result] = await db.query(
            'UPDATE states SET image_url = ? WHERE id = ?',
            [imageUrl, stateId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'State not found' });
        }

        res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});

// Fetch state image
router.get('/states/:id/image', async (req, res) => {
    const stateId = req.params.id;

    try {
        const [state] = await db.query('SELECT image_url FROM states WHERE id = ?', [stateId]);

        if (state.length > 0 && state[0].image_url) {
            const imagePath = path.join(__dirname, '..', state[0].image_url);
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

router.post('/states', async (req, res) => {
    const { name, description, population, universities, basic_labor_info } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'State name is required.' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO states (name, description, population, universities, basic_labor_info) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, description || null, population || null, universities || null, basic_labor_info || null]
        );

        res.status(201).json({
            message: 'State created successfully',
            stateId: result.insertId
        });
    } catch (error) {
        console.error('Error creating state:', error.message); // Log the specific error message
        res.status(500).json({ error: 'An error occurred while creating the state', details: error.message });
    }
});



// Get all states
router.get('/states', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM states');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching states:', error.message);
        res.status(500).json({ message: 'Error fetching states', error: error.message });
    }
});

// Get a specific state by ID
router.get('/states/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query('SELECT * FROM states WHERE id = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'State not found' });
        }
    } catch (error) {
        console.error('Error fetching state:', error.message);
        res.status(500).json({ message: 'Error fetching state', error: error.message });
    }
});

// Update a state
router.put('/states/:id', async (req, res) => {
    const { id } = req.params;
    const { name, image_url, population, num_universities, num_schools, labor_force, sector_id, indicator_id } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE states SET name = ?, image_url = ?, population = ?, num_universities = ?, num_schools = ?, labor_force = ?, sector_id = ?, indicator_id = ? WHERE id = ?',
            [name, image_url, population, num_universities, num_schools, labor_force, sector_id, indicator_id, id]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'State updated successfully' });
        } else {
            res.status(404).json({ message: 'State not found' });
        }
    } catch (error) {
        console.error('Error updating state:', error.message);
        res.status(500).json({ message: 'Error updating state', error: error.message });
    }
});

// Delete a state
router.delete('/states/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM states WHERE id = ?', [id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'State deleted successfully' });
        } else {
            res.status(404).json({ message: 'State not found' });
        }
    } catch (error) {
        console.error('Error deleting state:', error.message);
        res.status(500).json({ message: 'Error deleting state', error: error.message });
    }
});

module.exports = router;
