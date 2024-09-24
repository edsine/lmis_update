const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const router = express.Router();
const db = require('../db'); // Ensure this path is correct based on your project structure
const fs = require('fs');
const path = require('path');


// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Directory to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  }
});

const upload = multer({ storage: storage });

// Example route to test the API
router.get('/upload', (req, res) => {
    res.json({ message: 'Upload API is working!' });
  });


//   // Route for PDF file upload and text extraction
// router.post('/upload/pdf', upload.single('file'), (req, res) => {
//   //res.send("Upload Sucesfully");
//   res.json(req.file)

// });


// After the file is uploaded
router.post('/upload/pdf/:sectorId', upload.single('file'), async (req, res) => {
  const sectorId = req.params.sectorId; // Get sector ID from the URL
  const fileExtension = path.extname(req.file.originalname); // Get file extension (e.g., .pdf)
  const newFileName = `${sectorId}${fileExtension}`; // Name the file by sectorId

  // Move the file to the correct path with the new name
  const newFilePath = path.join(__dirname, '..', 'uploads', newFileName);
  fs.renameSync(req.file.path, newFilePath); // Rename the file to match the sectorId

  // Optionally, return the file path or just a success message
  res.status(200).json({ message: `File uploaded for sector ${sectorId}`, filePath: newFilePath });
});

module.exports = router;


