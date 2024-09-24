const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure



// post/create occupations route

router.post('/occupations', async (req, res) => {
    const { name, description, category, average_salary, growth_rate } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO occupations (name, description, category, average_salary, growth_rate) VALUES (?, ?, ?, ?, ?)',
            [name, description, category, average_salary, growth_rate]
        );
        const [newOccupation] = await db.query('SELECT * FROM occupations WHERE id = ?', [result.insertId]);
        res.status(201).json(newOccupation);
    } catch (error) {
        console.error('Error creating occupation:', error);
        res.status(500).json({ error: 'Error creating occupation' });
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