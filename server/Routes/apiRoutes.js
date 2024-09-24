const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure this path matches your setup

// Example route to test the API
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Create a new indicator
router.post('/indicators', async (req, res) => {
  const { name, description, value, unit, image_url, category, source, date_collected, trend, visualization_type, related_indicators } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO indicators (name, description, value, unit, image_url, category, source, date_collected, trend, visualization_type, related_indicators) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, value, unit, image_url, category, source, date_collected, trend, visualization_type, related_indicators]
    );
    res.status(201).json({ message: 'Indicator created successfully', indicatorId: result.insertId });
  } catch (error) {
    console.error('Error creating indicator:', error.message);
    res.status(500).json({ message: 'Error creating indicator', error: error.message });
  }
});

// Get all indicators
router.get('/indicators', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM indicators');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching indicators:', error.message);
    res.status(500).json({ message: 'Error fetching indicators', error: error.message });
  }
});

// Get a specific indicator by ID
router.get('/indicators/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM indicators WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Indicator not found' });
    }
  } catch (error) {
    console.error('Error fetching indicator:', error.message);
    res.status(500).json({ message: 'Error fetching indicator', error: error.message });
  }
});

// Update an indicator
router.put('/indicators/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, value, unit, image_url, category, source, date_collected, trend, visualization_type, related_indicators } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE indicators SET name = ?, description = ?, value = ?, unit = ?, image_url = ?, category = ?, source = ?, date_collected = ?, trend = ?, visualization_type = ?, related_indicators = ? WHERE id = ?',
      [name, description, value, unit, image_url, category, source, date_collected, trend, visualization_type, related_indicators, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Indicator updated successfully' });
    } else {
      res.status(404).json({ message: 'Indicator not found' });
    }
  } catch (error) {
    console.error('Error updating indicator:', error.message);
    res.status(500).json({ message: 'Error updating indicator', error: error.message });
  }
});

// Delete an indicator
router.delete('/indicators/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM indicators WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Indicator deleted successfully' });
    } else {
      res.status(404).json({ message: 'Indicator not found' });
    }
  } catch (error) {
    console.error('Error deleting indicator:', error.message);
    res.status(500).json({ message: 'Error deleting indicator', error: error.message });
  }
});








module.exports = router;
