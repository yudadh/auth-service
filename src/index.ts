import express, { Request, Response } from "express";
import { logger } from "./utils/logger";
import cors from "cors";
import router from "./routes/userRoutes";
import { errorHandler } from "./middleware/error";
import cookieParser from "cookie-parser"
import morgan from "morgan";

const app = express();

const corsOptions = {
   origin: 'http://localhost:5173', // Origin frontend Anda
   credentials: true, // Mengizinkan pengiriman cookie/credentials
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())
app.use(morgan('common'))
app.use("/auth",router)


app.get("/", (req: Request, res: Response) => {
   logger.info("someone requested at /");
   res.send("hello from auth-service");
   
});

app.use(errorHandler)

export default app
