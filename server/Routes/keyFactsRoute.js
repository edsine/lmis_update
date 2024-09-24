const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure

// POST route to create a new key fact
router.post('/keyfacts', async (req, res) => {
    const { state_id, sector_id, fact } = req.body;

    // Validate input
    if (!fact || (state_id == null && sector_id == null)) {
        return res.status(400).json({ error: 'Fact and at least one of state_id or sector_id are required.' });
    }

    try {
        // Insert key fact into the database
        const result = await db.query(
            "INSERT INTO key_facts (state_id, sector_id, fact) VALUES (?, ?, ?)",
            [state_id, sector_id, fact]
        );

        // Respond with success message
        res.status(201).json({ message: 'Key fact created successfully', keyFactId: result.insertId });
    } catch (error) {
        console.error('Error inserting key fact:', error);
        res.status(500).json({ error: 'Failed to create key fact' });
    }
});

router.get('/keyfacts', async (req, res) => {
    const { state_id, sector_id } = req.query;

    let query = "SELECT * FROM key_facts WHERE 1=1";
    const params = [];

    // Add condition for state_id if provided
    if (state_id) {
        query += " AND state_id = ?";
        params.push(state_id);
    }

    // Add condition for sector_id if provided
    if (sector_id) {
        query += " AND sector_id = ?";
        params.push(sector_id);
    }

    try {
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching key facts:', error);
        res.status(500).json({ error: 'Failed to fetch key facts' });
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
        const [result] = await db.query("DELETE FROM key_facts WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Key fact not found' });
        }

        res.json({ message: 'Key fact deleted successfully' });
    } catch (error) {
        console.error('Error deleting key fact:', error);
        res.status(500).json({ error: 'Failed to delete key fact' });
    }
});

router.get('/key', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM key_facts");
        res.json(rows);
    } catch (error) {
        console.error('Error fetching key facts:', error);
        res.status(500).json({ error: 'Failed to fetch key facts' });
    }
});



module.exports = router;
