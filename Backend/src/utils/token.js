// utils/token.js
import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {

  
  return jwt.sign(
    { username: user.username }, //
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (user) => {


  return jwt.sign(
    {  username: user.username}, //
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};
