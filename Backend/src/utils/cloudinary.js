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
    if (!localFilePath) {
      console.error("No file path provided.");
      return null;
    }

    console.log("Starting upload to Cloudinary:", localFilePath);

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Upload successful:", response);

    // Remove local file after upload
    await fs.promises.unlink(localFilePath);
    console.log("Local file deleted:", localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);

    // Clean up local file if there's an error, only if it exists
    try {
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
        console.log("Local file deleted after error:", localFilePath);
      }
    } catch (unlinkError) {
      console.error("Error deleting local file:", unlinkError.message);
    }

    return null;
  }
};

export { uploadOnCloudinary };
