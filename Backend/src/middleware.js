import multer from "multer";
import jwt from "jsonwebtoken";

// For production (Vercel), we'll only use memory storage
const storage = multer.memoryStorage();

// Configure multer with file size limits and file type validation
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only certain file types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

// Error handling middleware for multer
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large' });
        }
        return res.status(400).json({ message: err.message });
    }
    next(err);
};

// Auth middleware remains the same
export const authenticateToken = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
        next();
    } catch (err) {
        res.status(403).json({ message: "Invalid token" });
    }
};