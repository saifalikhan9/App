import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileBuffer, fileType) => {
  try {
    if (!fileBuffer) {
      console.error("No file buffer provided.");
      return null;
    }

    console.log("Starting upload to Cloudinary");

    // Convert buffer to base64
    const fileStr = fileBuffer.toString('base64');

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(
      `data:${fileType};base64,${fileStr}`,
      {
        resource_type: "auto",
      }
    );

    console.log("Upload successful:", response.url);

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    return null;
  }
};

export { uploadOnCloudinary };