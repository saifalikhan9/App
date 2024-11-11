import multer from "multer";
import jwt from "jsonwebtoken";

const storage =
  process.env.NODE_ENV === 'production'
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, 'public/temp'));
        },
        filename: (req, file, cb) => {
          cb(null, Date.now() + '-' + file.originalname);
        },
      });
  
export const upload = multer({ 
    storage, 
})

// middleware/auth.js

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = user; // Attach user info to request
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};
