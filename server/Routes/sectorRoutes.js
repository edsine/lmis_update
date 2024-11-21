const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');


// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });


// Create a new sector
// Route to create a new sector
router.post('/sectors', async (req, res) => {
  const { name, description } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO sectors (name, description) VALUES (?, ?)',
      [name, description]
    );
    res.status(201).json({ message: 'Sector created successfully', sectorId: result.insertId });
  } catch (error) {
    console.error('Error creating sector:', error.message);
    res.status(500).json({ message: 'Error creating sector', error: error.message });
  }
});


// Image upload route for a specific sector
router.post('/sectors/:id/uploadImages', upload.single('image'), async (req, res) => {
  const sectorId = req.params.id;
  const imageUrl = req.file ? `/uploads/${req.file.originalname}` : null;

  if (!imageUrl) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const [result] = await db.query(
      'UPDATE sectors SET image_url = ? WHERE id = ?',
      [imageUrl, sectorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sector not found' });
    }

    res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error.message);
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});


// Route for uploading and processing Excel file
router.post('/sectors/:id/uploadXcel', upload.single('excelFile'), async (req, res) => {
  const sectorId = req.params.id;
  const fileName = req.file.originalname; // Get the uploaded file name
  const filePath = path.join(__dirname, '..', 'uploads', req.file.originalname);

  try {
      // Read the Excel file
      const workbook = xlsx.readFile(filePath);

      // Select the first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet data to JSON
      const data = xlsx.utils.sheet_to_json(sheet);

      // Example: Process or compute with data
      console.log(`Data for sector ${sectorId}:`, data);

       // Loop through each row of data and insert into the database
       for (const entry of data) {
        await db.query('INSERT INTO sector_data (sector_id, data) VALUES (?, ?)', [sectorId, JSON.stringify(entry)]);
    }

    // Send a response back
    res.status(200).json({
        message: 'Excel file processed and data stored successfully',
        file_url: `http://${req.headers.host}/uploads/${encodeURIComponent(fileName)}`
    });

  } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ error: 'Error processing Excel file' });
  }
});

module.exports = router;



//upload route for pdf sectors
router.post('/sectors/:id/upload', upload.single('file'), async (req, res) => {
  const sectorId = req.params.id; // Sector ID from the URL
  const title = req.file.originalname;// Title from the form
  const filePath = path.join(__dirname, '..', 'uploads', req.file.filename); // Full path to the file

  try {

    await db.query(
      'INSERT INTO sector_files (sector_id, file_path, file_title) VALUES (?, ?, ?)',
      [sectorId, filePath, title]
    );

    res.status(200).json({ message: 'File uploaded successfully', filePath, title });
  } catch (error) {
    console.error('Error associating file with sector:', error);
    res.status(500).json({ message: 'Error uploading file', error });
  }
});

// Get all sectors
router.get('/sectors', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM sectors');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching sectors:', error.message);
    res.status(500).json({ message: 'Error fetching sectors', error: error.message });
  }
});




// Get a specific sector by ID
router.get('/sectors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM sectors WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.status(200).json(rows[0]);
    } else {
      res.status(404).json({ message: 'Sector not found' });
    }
  } catch (error) {
    console.error('Error fetching sector:', error.message);
    res.status(500).json({ message: 'Error fetching sector', error: error.message });
  }
});

// Get image URL for a sector by ID
router.get('/sectors/:id/image', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the image URL for the sector with the specified ID
    const [result] = await db.query('SELECT image_url FROM sectors WHERE id = ?', [id]);

    // Check if the sector was found
    if (result.length === 0) {
      return res.status(404).json({ message: 'Sector not found' });
    }

    // Respond with the image URL
    const imageUrl = result[0].image_url;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error retrieving image:', error.message);
    res.status(500).json({ message: 'Error retrieving image', error: error.message });
  }
});

router.get('/sectors/:id/image2', async (req, res) => {
  const sectorId = req.params.id;

  try {
    const [sector] = await db.query('SELECT image_url FROM sectors WHERE id = ?', [sectorId]);

    if (sector.length > 0 && sector[0].image_url) {
      const imagePath = path.join(__dirname, '..', sector[0].image_url);
      console.log('Image path:', imagePath); // Log the image path for debugging

      res.sendFile(imagePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).json({ message: 'Error fetching image', error: err.message });
        }
      });
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
});



// Get file by sector ID - Retrieve and send the file for viewing
router.get('/sectors/:id/file', async (req, res) => {
  const sectorId = req.params.id;

  try {
    // Query the database for all files associated with the sector
    const [rows] = await db.query('SELECT file_path, file_title FROM sector_files WHERE sector_id = ?', [sectorId]);

    if (rows.length > 0) {
      const filePath = rows[0].file_path; // Get the file path
      const title = rows[0].file_title; // Get the title

      // Serve the file directly
      res.setHeader('Content-Type', 'application/pdf'); // Set the appropriate content type
      res.setHeader('Content-Disposition', `inline; filename="${title}.pdf"`); // Inline display in browser

      return res.sendFile(filePath); // Send the file directly
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Error fetching file', error });
  }
});


// Get all files by sector ID - Retrieve all files and their metadata
router.get('/sectors/:id/files', async (req, res) => {
  const sectorId = req.params.id;

  try {
    // Get all file paths and titles from the sector_files table for the specified sector
    const [rows] = await db.query('SELECT file_path, file_title FROM sector_files WHERE sector_id = ?', [sectorId]);

    if (rows.length > 0) {
      // Send all file records as JSON
      res.json(rows); // This will send an array of file metadata
    } else {
      res.status(404).json({ message: 'No files found for this sector' });
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Error fetching files', error });
  }
});


// Serve file by file name
router.get('/sectors/files/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, '..', 'uploads', fileName); // Full path to the file

  console.log(`Attempting to send file from: ${filePath}`); // Debug log

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

  return res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).json({ message: 'Error sending file' });
    }
  });
});


// Route to get the uploaded Excel file URL by sector ID
router.get('/sectors/:id/xcel', async (req, res) => {
  const sectorId = req.params.id;

  try {
      // Retrieve the sector data to find the file URL
      const [rows] = await db.query('SELECT file_url FROM sectors WHERE id = ?', [sectorId]);

      if (rows.length === 0 || !rows[0].file_url) {
          return res.status(404).json({ error: 'File not found' });
      }

      // Send the file URL as a response
      res.status(200).json({ file_url: rows[0].file_url });
  } catch (error) {
      console.error('Error fetching file URL:', error);
      res.status(500).json({ error: 'Error fetching file URL' });
  }
});

// GET route to retrieve data for a specific sector
router.get('/sectors/:id/data', async (req, res) => {
  const sectorId = req.params.id; // Get the sector ID from the URL

  try {
      // Query to select data from sector_data table for the given sector_id
      const [rows] = await db.query('SELECT * FROM sector_data WHERE sector_id = ?', [sectorId]);

      if (rows.length > 0) {
          // Send the retrieved data as a response
          res.status(200).json({
              message: 'Data retrieved successfully',
              data: rows // This will include the id, sector_id, data, created_at, and updated_at
          });
      } else {
          // Handle case where no data is found for the given sector_id
          res.status(404).json({ message: 'No data found for the specified sector ID' });
      }
  } catch (error) {
      console.error('Error retrieving data:', error);
      res.status(500).json({ error: 'Error retrieving data' });
  }
});


// Delete file by sector ID
router.delete('/sectors/:id/file', async (req, res) => {
  const sectorId = req.params.id;

  try {
    // Get the file path from the database
    const [rows] = await db.query('SELECT file_path FROM sectors WHERE id = ?', [sectorId]);

    if (rows.length > 0) {
      const filePath = rows[0].file_path;

      // Delete the file from the filesystem
      fs.unlink(filePath, async (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ message: 'Error deleting file from server', error: err });
        }

        // After deleting the file, remove its path from the database
        await db.query('UPDATE sectors SET file_path = NULL, file_title = NULL WHERE id = ?', [sectorId]);

        res.status(200).json({ message: 'File deleted successfully' });
      });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Error deleting file', error });
  }
});




// Update a sector
router.put('/sectors/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, indicator_id, } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE sectors SET name = ?, description = ?, indicator_id = ?, image_url = ? WHERE id = ?',
      [name, description, indicator_id, image_url, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Sector updated successfully' });
    } else {
      res.status(404).json({ message: 'Sector not found' });
    }
  } catch (error) {
    console.error('Error updating sector:', error.message);
    res.status(500).json({ message: 'Error updating sector', error: error.message });
  }
});

// Delete a sector
router.delete('/sectors/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM sectors WHERE id = ?', [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Sector deleted successfully' });
    } else {
      res.status(404).json({ message: 'Sector not found' });
    }
  } catch (error) {
    console.error('Error deleting sector:', error.message);
    res.status(500).json({ message: 'Error deleting sector', error: error.message });
  }
});

// Delete the image associated with a sector by ID
router.delete('/sectors/:id/image', async (req, res) => {
  const sectorId = req.params.id;

  try {
    // Get the image URL from the database
    const [sector] = await db.query('SELECT image_url FROM sectors WHERE id = ?', [sectorId]);
    
    if (sector.length === 0) {
      return res.status(404).json({ message: 'Sector not found' });
    }

    const imageUrl = sector[0].image_url;

    // If there's no image URL, return a message
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image associated with this sector' });
    }

    // Delete the image file if it exists
    const imagePath = path.join(__dirname, '..', imageUrl);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image:', err);
        return res.status(500).json({ message: 'Error deleting image', error: err.message });
      }
      
      // Update the sector record to remove the image URL
      db.query('UPDATE sectors SET image_url = NULL WHERE id = ?', [sectorId])
        .then(() => {
          res.status(200).json({ message: 'Image deleted successfully and sector updated' });
        })
        .catch((updateError) => {
          console.error('Error updating sector:', updateError.message);
          res.status(500).json({ message: 'Error updating sector', error: updateError.message });
        });
    });
  } catch (error) {
    console.error('Error deleting image:', error.message);
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});


module.exports = router;
