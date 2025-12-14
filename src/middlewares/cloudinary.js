import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

export const uploadCloudinary = async (localFilePath) => {
    //localfilepath: local file path=> req.file.path
    try {
        // Upload to Cloudinary
        const bucketName = "uploads";
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: bucketName, // optional Cloudinary folder
            use_filename: true,
            unique_filename: true,
            resource_type: "image",
        });
        console.log("return from cloudinary: ", result);

        // result contains secure_url and many other fields
        return result;
    } catch (uploadErr) {
        // upload failed — return error but still attempt to delete local file
        console.error("Cloudinary upload error:", uploadErr);
        throw uploadErr;
    } finally {
        // ALWAYS attempt to delete the local file (successful or failed upload)
        if (fs.existsSync(localFilePath)) {
        fs.unlink(localFilePath, (err) => {
            if (err) {
                if(err.code !== "ENOENT")
                {
                console.error('Error deleting file:', err);
                }
                return;
            }
            console.log('File deleted successfully:', localFilePath);
        });
    }
    else
    {
        console.log("File Already Delelted",localFilePath);
        
    }
    }
}

