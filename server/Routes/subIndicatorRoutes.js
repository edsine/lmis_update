const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure

//create sub indicators
router.post('/subIndicators', async (req, res) => {
    const { indicator_id, name, value, unit, description } = req.body; // Include description
    try {
        // Insert the new sub-indicator with description
        const [result] = await db.query(
            'INSERT INTO sub_indicators (indicator_id, name, value, unit, description) VALUES (?, ?, ?, ?, ?)', 
            [indicator_id, name, value, unit, description]
        );

        // Fetch the newly created sub-indicator
        const [newSubIndicator] = await db.query('SELECT * FROM sub_indicators WHERE id = ?', [result.insertId]);
        res.status(201).json(newSubIndicator);
    } catch (error) {
        console.error('Error creating sub-indicator:', error);
        res.status(500).json({ error: 'Error creating sub-indicator' });
    }
});





//get sub indicators via indicator id
router.get('/subIndicators', async (req, res) => {
    const { indicator_id } = req.query;
    try {
        const [subIndicators] = await db.query('SELECT * FROM sub_indicators WHERE indicator_id = ?', [indicator_id]);
        res.json(subIndicators);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sub-indicators' });
    }
});

//get  by id 
router.get('/subIndicators/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [subIndicator] = await db.query('SELECT * FROM sub_indicators WHERE id = ?', [id]);
        if (subIndicator) {
            res.json(subIndicator);
        } else {
            res.status(404).json({ error: 'Sub-indicator not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching sub-indicator' });
    }
});


//update 
router.put('/subIndicators/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
        await db.query('UPDATE sub_indicators SET name = ?, description = ? WHERE id = ?', [name, description, id]);
        const [updatedSubIndicator] = await db.query('SELECT * FROM sub_indicators WHERE id = ?', [id]);
        res.json(updatedSubIndicator);
    } catch (error) {
        res.status(500).json({ error: 'Error updating sub-indicator' });
    }
});




//delete 
router.delete('/subIndicators/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM sub_indicators WHERE id = ?', [id]);
        res.status(204).json({ message: 'Sub-indicator deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting sub-indicator' });
    }
});



module.exports = router;
