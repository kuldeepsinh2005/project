const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "video", // Specify resource type as video for video files
            media_metadata: true, // To get metadata like duration
            folder: "cosmo-meet",
        });
        // File has been uploaded successfully
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation got failed
        console.error("Cloudinary upload error:", error);
        return null;
    }
};

module.exports = { uploadOnCloudinary };
