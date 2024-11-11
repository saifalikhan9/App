import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

  
    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove local file after upload
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Clean up local file if there's an error
    fs.unlinkSync(localFilePath);
    console.error("Error uploading to Cloudinary:", error.message);
    return null;
  }
};

export { uploadOnCloudinary };
