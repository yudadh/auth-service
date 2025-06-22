import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/responseError";
import { ZodError } from "zod";


interface ApiResponse<T> {
   status: "success" | "error";
   data: T | null;
   meta: any | null;
   error: {
      message: string;
      code: number;
      details?: any;
   } | null;
}

// Middleware global untuk menangani error
export const errorHandler = (
   err: Error | AppError,
   req: Request,
   res: Response,
   next: NextFunction
) => {
   let statusCode = 500;
   let message = "Internal Server Error";
   let details: any = null;

   // Tangani Zod errors
   if (err instanceof ZodError) {
      statusCode = 400;
      message = "Invalid request data.";
      details = err.errors.map((error) => ({
         field: error.path.join("."),
         message: error.message,
      }));
   }

   // Tangani AppError
   else if (err instanceof AppError) {
      statusCode = err.statusCode;
      message = err.message;
   }

   // Struktur respons yang seragam
   const response: ApiResponse<null> = {
      status: "error",
      data: null,
      meta: null,
      error: {
         message,
         code: statusCode,
         details, // Tambahkan detail hanya jika ada
      },
   };

   res.status(statusCode).json(response);
};
