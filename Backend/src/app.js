import express from "express";
import cookieParser from "cookie-parser";
import router from "./router.js";
import cors from "cors"

const app = express();

app.use(
    cors({
      origin: process.env.CORS_ORIGIN , // replace with your frontend's origin
      credentials: true, // Allow cookies and other credentials to be sent
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: "Authorization, Content-Type",
    })
  );




app.use(cookieParser());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('hello world')
})
app.use("/api", router);
export { app };
