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



// post/create occupations route
router.post('/occupations', async (req, res) => {
    const { name, description, category, average_salary, growth_rate } = req.body;

    // Validate required fields
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        // Insert the new occupation into the database
        const [result] = await db.query(
            'INSERT INTO occupations (name, description, category, average_salary, growth_rate) VALUES (?, ?, ?, ?, ?)',
            [name, description || null, category || null, average_salary || null, growth_rate || null]
        );

        // Retrieve the newly created occupation by ID
        const [newOccupation] = await db.query('SELECT * FROM occupations WHERE id = ?', [result.insertId]);

        // Respond with the new occupation
        res.status(201).json(newOccupation[0]);
    } catch (error) {
        console.error('Error creating occupation:', error);
        res.status(500).json({ error: 'Error creating occupation' });
    }
});



// Image upload route for a specific indicator
router.post('/occupations/:id/uploadImage', upload.single('image'), async (req, res) => {
    const occupationId = req.params.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Update the `occupations` table with the new image URL
        const [result] = await db.query(
            'UPDATE occupations SET image_url = ? WHERE id = ?',
            [imageUrl, occupationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Occupation not found' });
        }

        res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error.message);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
});
  

//get occupations in general
router.get('/occupations', async (req, res) => {
    try {
        const [occupations] = await db.query('SELECT * FROM occupations');
        res.json(occupations);
    } catch (error) {
        console.error('Error fetching occupations:', error);
        res.status(500).json({ error: 'Error fetching occupations' });
    }
});


//get by id 
router.get('/occupations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [occupation] = await db.query('SELECT * FROM occupations WHERE id = ?', [id]);
        if (occupation.length) {
            res.json(occupation[0]);
        } else {
            res.status(404).json({ error: 'Occupation not found' });
        }
    } catch (error) {
        console.error('Error fetching occupation:', error);
        res.status(500).json({ error: 'Error fetching occupation' });
    }
});



//update occupations route
router.put('/occupations/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, category, average_salary, growth_rate } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE occupations SET name = ?, description = ?, category = ?, average_salary = ?, growth_rate = ? WHERE id = ?',
            [name, description, category, average_salary, growth_rate, id]
        );
        if (result.affectedRows) {
            const [updatedOccupation] = await db.query('SELECT * FROM occupations WHERE id = ?', [id]);
            res.json(updatedOccupation[0]);
        } else {
            res.status(404).json({ error: 'Occupation not found' });
        }
    } catch (error) {
        console.error('Error updating occupation:', error);
        res.status(500).json({ error: 'Error updating occupation' });
    }
});



//delete the occupations by id 

router.delete('/occupations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM occupations WHERE id = ?', [id]);
        if (result.affectedRows) {
            res.status(204).json({ message: 'Occupation deleted successfully' });
        } else {
            res.status(404).json({ error: 'Occupation not found' });
        }
    } catch (error) {
        console.error('Error deleting occupation:', error);
        res.status(500).json({ error: 'Error deleting occupation' });
    }
});



module.exports = router;