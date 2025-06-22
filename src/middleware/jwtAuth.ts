import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { AppError } from "../utils/responseError";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
        logger.warn("Unathorized because no token found")
        return next(new AppError("Unathorized Access", 401))
    }

    try {
        const decoded = verifyToken(token!)
        req.user = decoded as {user_id: number, role: string}
        next()
    } catch (error) {
        if (error instanceof Error && error.message === "TokenExpiredError") {
            logger.warn("user accessToken expired")
            return next(new AppError("token expired", 401))
        } else {
            logger.warn(error)
            return next(new AppError("Invalid Token", 401))
        }
    }

}