const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure



router.post('/indicatorDetails', async (req, res) => {
    try {
        const { indicator_id, sector_id, state_id, key_fact_id, detail_description } = req.body;

        // Ensure at least one of the optional fields is provided
        if (!indicator_id && !sector_id && !state_id && !key_fact_id) {
            return res.status(400).json({ error: 'At least one identifier (indicator_id, sector_id, state_id, key_fact_id) is required' });
        }

        const [result] = await db.query(
            'INSERT INTO indicator_details (indicator_id, sector_id, state_id, key_fact_id, detail_description) VALUES (?, ?, ?, ?, ?)',
            [indicator_id || null, sector_id || null, state_id || null, key_fact_id || null, detail_description || null]
        );

        res.status(201).json({ id: result.insertId, message: 'Indicator details created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// router.get('/indicatorDetails', async (req, res) => {
//     try {
//         const [rows] = await db.query('SELECT * FROM indicator_details');
//         res.json(rows);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });


// GET /indicatorDetails?state_id=3&indicator_id=1
router.get('/indicatorDetails', async (req, res) => {
    const { indicator_id, state_id, sector_id, key_fact_id } = req.query;

    // Constructing the base query and parameters array
    let query = 'SELECT * FROM indicator_details WHERE 1=1';
    let parameters = [];

    // Adding conditions based on provided query parameters
    if (indicator_id) {
        query += ' AND indicator_id = ?';
        parameters.push(indicator_id);
    }
    if (state_id) {
        query += ' AND state_id = ?';
        parameters.push(state_id);
    }
    if (sector_id) {
        query += ' AND sector_id = ?';
        parameters.push(sector_id);
    }
    if (key_fact_id) {
        query += ' AND key_fact_id = ?';
        parameters.push(key_fact_id);
    }

    // If no filters are applied, return all records
    if (parameters.length === 0) {
        return res.status(400).json({ error: 'At least one query parameter is required.' });
    }

    try {
        const [rows] = await db.execute(query, parameters);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No matching indicator details found." });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error retrieving indicator details:', error);
        res.status(500).json({ error: "An error occurred while retrieving the indicator details." });
    }
});






router.get('/indicatorDetails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM indicator_details WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Indicator details not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/indicatorDetails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { indicator_id, sector_id, state_id, key_fact_id, detail_description } = req.body;

        // Ensure all required fields are provided
        if (!indicator_id || !sector_id || !state_id || !key_fact_id || !detail_description) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const [result] = await db.query(
            'UPDATE indicator_details SET indicator_id = ?, sector_id = ?, state_id = ?, key_fact_id = ?, detail_description = ? WHERE id = ?',
            [indicator_id, sector_id, state_id, key_fact_id, detail_description, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Indicator details not found' });
        }

        res.json({ message: 'Indicator details updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/indicatorDetails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM indicator_details WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Indicator details not found' });
        }

        res.json({ message: 'Indicator details deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});







module.exports = router;
