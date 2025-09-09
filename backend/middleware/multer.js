const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the temp directory exists
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 1024 * 1024 * 500 } // 500MB limit
});

module.exports = { upload };
