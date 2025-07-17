import { Request, Response, NextFunction } from "express";
import {
   RegisterUserRequest,
   RegisterAdminRequest,
   LoginRequest,
} from "../types/userType";
import { userService } from "../services/authService";
import { logger } from "../utils/logger";
import { AppError } from "../utils/responseError";
import {
   LoginResponse,
   LoginServiceResponse,
   PaginationMeta,
   RegisterAdminDisdikDTO,
   UpdatePassword,
   UserAdminDTO,
   UsersResponseBySekolah,
   UserUpdateData,
} from "../interfaces/authInterface";
import { successResponse } from "../utils/successResponse";

export async function registerUser(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const request: RegisterUserRequest = req.body;
      const response = await userService.createNewSiswa(request);
      logger.info("user data created", response);
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createUserAdmin]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in createUserAdmin]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in createUserAdmin]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function registerAdmin(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const request: RegisterAdminRequest = req.body;
      const response = await userService.createNewAdmin(request);
      logger.info("user admin data created", response);
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createUserAdmin]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in createUserAdmin]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in createUserAdmin]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function registerAdminDisdik(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const request: RegisterAdminDisdikDTO = req.body;
      const response = await userService.createAdminDisdik(request);
      logger.info("user admin disdik data created", response);
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in createAdminDisdik]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in createAdminDisdik]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in createAdminDisdik]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function login(req: Request, res: Response, next: NextFunction) {
   try {
      const request: LoginRequest = req.body;
      const { user, access_token, refresh_token }: LoginServiceResponse =
         await userService.loginUser(request);
      // console.log(user)
      const response: LoginResponse = {
         user,
         access_token
      }

      //mengirim refresh token ke cookie
      res.cookie("refresh_token", refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "none",
         maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in login]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in login]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(`[Unknown Error in login]: ${JSON.stringify(error)}`);
      }
      next(error);
   }
}

export async function refreshAccessToken(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      // console.log(`someone request refresh token ${new Date().toISOString()}`)
      const { refresh_token } = req.cookies;
      const newAccessToken = await userService.refreshToken(refresh_token);
      const response: {
         access_token: string;
      } = { access_token: newAccessToken };
      successResponse(res, 200, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in refreshAccessToken]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in refreshing access token]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in refreshToken]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
   try {
      const user = req.user;
      logger.info(`req.user: ${user}`)
      await userService.logoutUser(user!.user_id);
      res.clearCookie("refresh_token");
      successResponse(res, 204, null, null);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in logout]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(`[Unexpected Error in logout]: ${error.message}`, {
            stack: error.stack,
         });
      } else {
         logger.error(`[Unknown Error in logout]: ${JSON.stringify(error)}`);
      }
      next(error);
   }
}

export async function verifyUsernameAndSendEmail(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { username }: { username: string } = req.body;
      const response = await userService.verifyUsernameAndSendEmail(username);
      successResponse(res, 200, response, null);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in verifyUsernameAndSendEmail]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in verifyUsernameAndSendEmail]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in verifyUsernameAndSendEmail]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function setUserPassword(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { token } = req.query
      const { password }: { password: string } = req.body;
      const response = await userService.updatePassword(password, token as string);
      successResponse(res, 200, response, null);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in updatePassword]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in updatePassword]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in updatePassword]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function updateUser(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const user: UserUpdateData = req.body;
      const response = await userService.updateUser(
         Number(id as string),
         user.username
         // user.sekolah_id ? user.sekolah_id : null
      );
      successResponse(res, 200, response, null);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in updateUser]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in updateUser]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in updateUser: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}



export async function getAllUserBySekolah(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { page = 1, limit = 10 } = req.query;
      const sekolahId: string = req.params.sekolah_id;
      const response: {
         users_siswa: UsersResponseBySekolah[];
         total: number;
      } = await userService.getAllUserBySekolahId(
         parseInt(page as string),
         parseInt(limit as string),
         parseInt(sekolahId)
      );
      const meta: PaginationMeta = {
         total: response.total,
         limit: Number(limit as string),
         page: Number(page as string),
      };
      successResponse(res, 200, response.users_siswa, meta);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllUserBySekolahId]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllUserBySekolahId]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllUserBySekolahId]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getAllRole(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const response = await userService.getAllRole()
      successResponse(res, 200, response, null);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllRole]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllRole]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllRole]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function deleteUser(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { id } = req.params
      const response = await userService.deleteUser(Number(id as string))
      successResponse(res, 200, response, null);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in deleteUser]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in deleteUser]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in deleteUser]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function getAllUserAdminSekolah(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const { page = 1, limit = 10 } = req.query;
      const filters: any = req.query.filters ? JSON.parse(req.query.filters as string) : {}
      const response: {
         users: UserAdminDTO[];
         total: number;
      } = await userService.getAllUserAdminSekolah(
         parseInt(page as string),
         parseInt(limit as string),
         filters
      );
      const meta: PaginationMeta = {
         total: response.total,
         limit: Number(limit as string),
         page: Number(page as string),
      };
      successResponse(res, 200, response.users, meta);
   } catch (error) {
      if (error instanceof AppError) {
         logger.warn(`[AppError in getAllUserAdminSekolah]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in getAllUserAdminSekolah]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in getAllUserAdminSekolah]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}

export async function sendEmailTesting(
   req: Request,
   res: Response,
   next: NextFunction
) {
   try {
      const request: { email: string, name: string, token: string } = req.body;
      const response = await userService.sendResetPasswordLink(request.email, request.token, request.name);
      // logger.info("user data created", response);
      successResponse(res, 201, response, null);
   } catch (error) {
      // Logging berdasarkan jenis error
      if (error instanceof AppError) {
         logger.warn(`[AppError in sendResetPasswordLink]: ${error.message}`);
      } else if (error instanceof Error) {
         logger.error(
            `[Unexpected Error in sendResetPasswordLinkn]: ${error.message}`,
            {
               stack: error.stack,
            }
         );
      } else {
         logger.error(
            `[Unknown Error in sendResetPasswordLink]: ${JSON.stringify(error)}`
         );
      }
      next(error);
   }
}
