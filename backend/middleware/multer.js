const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const storage = multer.memoryStorage();

// Create the multer instance with the memory storage configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500 // 500MB limit - adjust as needed
  },
  fileFilter: (req, file, cb) => {
    // We can add validation here if needed, for example, to only allow specific video types
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  }
});

module.exports = { upload };
