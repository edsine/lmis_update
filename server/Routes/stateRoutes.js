const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure

// Create a new state
router.post('/states', async (req, res) => {
    const { name, image_url, population, num_universities, num_schools, labor_force, sector_id, indicator_id } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO states (name, image_url, population, num_universities, num_schools, labor_force, sector_id, indicator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, image_url, population, num_universities, num_schools, labor_force, sector_id, indicator_id]
        );
        res.status(201).json({ message: 'State created successfully', stateId: result.insertId });
    } catch (error) {
        console.error('Error creating state:', error.message);
        res.status(500).json({ message: 'Error creating state', error: error.message });
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
