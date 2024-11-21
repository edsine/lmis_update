const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming your MySQL connection is in a separate file

// Route to add new section content to the 'about' page
router.post('/about', async (req, res) => {
    try {
        const { section_name, content } = req.body;

        // Validate that both section_name and content are provided
        if (!section_name || !content) {
            return res.status(400).json({ error: 'Section name and content are required.' });
        }

        // Insert new about section into the table
        const [result] = await db.query(
            'INSERT INTO about (section_name, content) VALUES (?, ?)', 
            [section_name, content]
        );

        res.status(201).json({
            message: 'About section created successfully',
            section_id: result.insertId
        });
    } catch (err) {
        console.error('Error creating about section:', err);
        res.status(500).json({ error: 'Error creating about section' });
    }
});


// Route to update content of a specific section by section_name
router.put('/about/:section_name', async (req, res) => {
    try {
        const { section_name } = req.params;
        const { content } = req.body;

        // Update the about section content
        const [result] = await db.query(
            'UPDATE about SET content = ? WHERE section_name = ?',
            [content, section_name]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.json({ message: 'About section updated successfully' });
    } catch (err) {
        console.error('Error updating about section:', err);
        res.status(500).json({ error: 'Error updating about section' });
    }
});


// Route to get all about page content
router.get('/about', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM about');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching about content:', err);
        res.status(500).json({ error: 'Error fetching about content' });
    }
});

// Route to get a specific section by section_name
router.get('/about/:section_name', async (req, res) => {
    try {
        const { section_name } = req.params;

        // Fetch the specific about section from the database
        const [rows] = await db.query(
            'SELECT * FROM about WHERE section_name = ?',
            [section_name]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.json(rows[0]); // Return the first matching section
    } catch (err) {
        console.error('Error fetching about section:', err);
        res.status(500).json({ error: 'Error fetching about section' });
    }
});



// Route to delete a specific section by section_name
router.delete('/about/:section_name', async (req, res) => {
    try {
        const { section_name } = req.params;

        // Delete the specific about section from the database
        const [result] = await db.query(
            'DELETE FROM about WHERE section_name = ?',
            [section_name]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Section not found' });
        }

        res.json({ message: 'About section deleted successfully' });
    } catch (err) {
        console.error('Error deleting about section:', err);
        res.status(500).json({ error: 'Error deleting about section' });
    }
});


module.exports = router;
