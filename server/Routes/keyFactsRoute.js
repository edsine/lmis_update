const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure

// POST route to create a new key fact

router.post('/keyfacts', async (req, res) => {
    const { state_id, sector_id, occupation_id, indicator_id, fact } = req.body;

    try {
        // Insert key fact into the database with optional fields
        const [result] = await db.query(
            `INSERT INTO keyfacts (state_id, sector_id, occupation_id, indicator_id, fact) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                state_id || null,       // Use null if the field is undefined
                sector_id || null,
                occupation_id || null,
                indicator_id || null,
                fact
            ]
        );

        // Respond with the new key fact ID
        res.status(201).json({
            message: 'Key fact created successfully',
            keyfactId: result.insertId
        });
    } catch (error) {
        console.error('Error creating key fact:', error);
        res.status(500).json({ error: 'An error occurred while creating the key fact' });
    }
});



// Get all keyfacts
router.get('/keyfacts', async (req, res) => {
    try {
        const [keyfacts] = await db.query('SELECT * FROM keyfacts');
        res.status(200).json(keyfacts);
    } catch (error) {
        console.error('Error retrieving all keyfacts:', error.message);
        res.status(500).json({ message: 'Error retrieving all keyfacts', error: error.message });
    }
});

// Get keyfacts by individual IDs
router.get('/keyfacts/:idType/:id', async (req, res) => {
    const { idType, id } = req.params;
    const validIdTypes = ['state_id', 'sector_id', 'occupation_id', 'indicator_id'];

    if (!validIdTypes.includes(idType)) {
        return res.status(400).json({ message: 'Invalid ID type' });
    }

    try {
        const [keyfacts] = await db.query(`SELECT * FROM keyfacts WHERE ${idType} = ?`, [id]);
        res.status(200).json(keyfacts);
    } catch (error) {
        console.error(`Error retrieving keyfacts by ${idType}:`, error.message);
        res.status(500).json({ message: `Error retrieving keyfacts by ${idType}`, error: error.message });
    }
});

// Get keyfacts by combined IDs
router.get('/keyfacts/filter', async (req, res) => {
    const { state_id, sector_id, occupation_id, indicator_id } = req.query;

    const conditions = [];
    const values = [];

    if (state_id) {
        conditions.push('state_id = ?');
        values.push(state_id);
    }
    if (sector_id) {
        conditions.push('sector_id = ?');
        values.push(sector_id);
    }
    if (occupation_id) {
        conditions.push('occupation_id = ?');
        values.push(occupation_id);
    }
    if (indicator_id) {
        conditions.push('indicator_id = ?');
        values.push(indicator_id);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
        const [keyfacts] = await db.query(`SELECT * FROM keyfacts ${whereClause}`, values);
        res.status(200).json(keyfacts);
    } catch (error) {
        console.error('Error retrieving keyfacts by combined IDs:', error.message);
        res.status(500).json({ message: 'Error retrieving keyfacts by combined IDs', error: error.message });
    }
});


// Get keyfacts by state_id and indicator_id
router.get('/keyfacts/state/:state_id/indicator/:indicator_id', async (req, res) => {
    const { state_id, indicator_id } = req.params;

    try {
        const [keyfacts] = await db.query(
            `SELECT * FROM keyfacts WHERE state_id = ? AND indicator_id = ?`,
            [state_id, indicator_id]
        );

        if (keyfacts.length === 0) {
            return res.status(404).json({ message: 'No key facts found for the specified state and indicator' });
        }

        res.status(200).json(keyfacts);
    } catch (error) {
        console.error('Error retrieving key facts by state and indicator:', error.message);
        res.status(500).json({ message: 'Error retrieving key facts by state and indicator', error: error.message });
    }
});


// Route to fetch key facts for a specific state and sector
router.get('/keyfacts/state/:state_id/sectors/:sector_id', async (req, res) => {
    const { state_id, sector_id } = req.params;

    try {
        // Query to get key facts that match both state_id and sector_id
        const [results] = await db.query(
            `SELECT * FROM keyfacts 
             WHERE state_id = ? AND sector_id = ?`, 
            [state_id, sector_id]
        );

        // Check if key facts exist
        if (results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(404).json({ message: 'No key facts found for this state and sector combination' });
        }
    } catch (error) {
        console.error('Error fetching key facts:', error);
        res.status(500).json({ error: 'An error occurred while fetching the key facts' });
    }
});





router.put('/keyfacts/:id', async (req, res) => {
    const { id } = req.params;
    const { state_id, sector_id, fact } = req.body;

    try {
        const [result] = await db.query(
            "UPDATE key_facts SET state_id = ?, sector_id = ?, fact = ? WHERE id = ?",
            [state_id, sector_id, fact, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Key fact not found' });
        }

        res.json({ message: 'Key fact updated successfully' });
    } catch (error) {
        console.error('Error updating key fact:', error);
        res.status(500).json({ error: 'Failed to update key fact' });
    }
});

router.delete('/keyfacts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query("DELETE FROM keyfacts WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Key fact not found' });
        }

        res.json({ message: 'Key fact deleted successfully' });
    } catch (error) {
        console.error('Error deleting key fact:', error);
        res.status(500).json({ error: 'Failed to delete key fact' });
    }
});





module.exports = router;
