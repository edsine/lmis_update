const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure


// POST /dataInsights
router.post('/dataInsights', async (req, res) => {
    const { data_category, category_id, name, description, value } = req.body;
  
    // Validate required fields
    if (!data_category || !category_id || !name) {
      return res.status(400).json({
        message: 'data_category, category_id, and name are required.',
      });
    }
  
    // Define valid categories and their corresponding fields
    const categoryMapping = {
      indicator: 'indicator_id',
      sector: 'sector_id',
      occupation: 'occupation_id',
      state: 'state_id',
      key_facts: 'keyfacts_id',
    };
  
    // Check if the data_category is valid
    const categoryField = categoryMapping[data_category];
    if (!categoryField) {
      return res.status(400).json({ message: 'Invalid data_category provided.' });
    }
  
    // SQL Query for insertion
    const query = `
      INSERT INTO data_insights (data_category, ${categoryField}, name, description, value, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;
  
    const values = [data_category, category_id, name, description || null, value || null];
  
    try {
      const [result] = await db.execute(query, values);
      res.status(201).json({
        message: 'Data Insight created successfully.',
        dataInsightId: result.insertId,
      });
    } catch (error) {
      console.error('Error inserting data insight:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
  
// GET /dataInsights/:data_category/:category_id
router.get('/dataInsights/:data_category/:category_id', async (req, res) => {
    const { data_category, category_id } = req.params;
  
    // Validate inputs
    if (!data_category || !category_id) {
      return res.status(400).json({ message: 'data_category and category_id are required.' });
    }
  
    // Define valid categories and their corresponding fields
    const categoryMapping = {
      indicator: 'indicator_id',
      sector: 'sector_id',
      occupation: 'occupation_id',
      state: 'state_id',
      key_facts: 'keyfacts_id',
    };
  
    // Get the column corresponding to the data_category
    const categoryField = categoryMapping[data_category];
    if (!categoryField) {
      return res.status(400).json({ message: 'Invalid data_category provided.' });
    }
  
    try {
      // Query to fetch data by category and ID
      const query = `
        SELECT * 
        FROM data_insights 
        WHERE data_category = ? AND ${categoryField} = ?
      `;
  
      const [rows] = await db.execute(query, [data_category, category_id]);
  
      // Check if data exists
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No data found for the given data_category and category_id.' });
      }
  
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching data insights:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });


// GET /dataInsights
router.get('/dataInsights', async (req, res) => {
    try {
      const query = `SELECT * FROM data_insights ORDER BY created_at DESC`;
      const [rows] = await db.execute(query);
  
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No data insights found.' });
      }
  
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching all data insights:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });



  // DELETE /dataInsights/:data_category/:category_id
router.delete('/dataInsights/:data_category/:category_id', async (req, res) => {
    const { data_category, category_id } = req.params;

    // Define valid categories and their corresponding fields
    const categoryMapping = {
        indicator: 'indicator_id',
        sector: 'sector_id',
        occupation: 'occupation_id',
        state: 'state_id',
        key_facts: 'keyfacts_id',
    };

    // Check if the data_category is valid
    const categoryField = categoryMapping[data_category];
    if (!categoryField) {
        return res.status(400).json({ message: 'Invalid data_category provided.' });
    }

    // SQL query to delete the record
    const query = `
        DELETE FROM data_insights 
        WHERE data_category = ? AND ${categoryField} = ?
    `;

    try {
        const [result] = await db.execute(query, [data_category, category_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No record found to delete.' });
        }

        res.status(200).json({ message: 'Data Insight deleted successfully.' });
    } catch (error) {
        console.error('Error deleting data insight:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

  
    

module.exports = router;
