import express, { NextFunction, Request, Response } from "express";
import { logger } from "./utils/logger";
import cors from "cors";
import router from "./routes/userRoutes";
import { errorHandler } from "./middleware/error";
import cookieParser from "cookie-parser"
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { AppError } from "./utils/responseError";

const app = express();

const corsOptions = {
   origin: process.env.FRONTEND_URL, // Origin frontend Anda
   credentials: true, // Mengizinkan pengiriman cookie/credentials
};

// const limiter = rateLimit({
//    windowMs: 60 * 1000,
//    limit: 3,
//    handler: (req: Request, res: Response, next: NextFunction, options) => {
//       return next(new AppError("Oops, Too Many Request", options.statusCode))
//    }
// })

app.use(cors(corsOptions));
// app.use(limiter)
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
