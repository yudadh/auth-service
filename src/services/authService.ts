import {
   RegisterUserRequest,
   RegisterAdminRequest,
   LoginRequest,
   UserWithRole,
} from "../types/userType";
import { Prisma } from "@prisma/client";
import { userRepository } from "../repositories/authRepository";
import { AppError } from "../utils/responseError";
import bcrypt from "bcryptjs";
import {
   generateAccessToken,
   generateRefreshToken,
   generateTokenSetPassword,
   verifyRefreshToken,
   verifyToken,
} from "../utils/jwt";
import {
   JwtPayloadToken,
   LoginServiceResponse,
   RegisterAdminDisdikDTO,
   UpdatePassword,
   UserAdminSekolah,
   UserResponse,
   UserAdminDTO,
   UserSiswa,
   UsersResponseBySekolah,
} from "../interfaces/authInterface";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { sendEmail } from "../utils/email";
import * as crypto from 'crypto'

export class userService {
   static async initializeUserInput(
      request:
         | RegisterUserRequest
         | RegisterAdminRequest
         | RegisterAdminDisdikDTO
   ): Promise<Prisma.UserCreateInput> {
      const tempPassword = crypto.randomBytes(8).toString("hex")
      const hashedPassword = await this.hashPassword(tempPassword);
      return {
         username: request.username,
         password: hashedPassword,
         refresh_token: null,
         created_at: new Date(),
         updated_at: null,
         role: {
            connect: {
               role_id: request.role_id,
            },
         },
      };
   }

   private static async hashPassword(password: string) {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
   }

   private static async validateUserExistence(username: string) {
      const user = await userRepository.findUserByUsername(username);
      if (user) {
         throw new AppError("user already exist", 400);
      }
   }

   private static async validateUserSiswa(siswaId: number) {
      const userSiswa = await userRepository.findUserBySiswa(siswaId)
      if (!userSiswa) {
         throw new AppError("siswa tidak ditemukan", 404)
      }

      if (userSiswa.user_id) {
         throw new AppError("akun siswa sudah ada", 409)
      }
   }

   private static async validateUserSekolah(sekolahId: number) {
      const userSekolah = await userRepository.findUserBySekolah(sekolahId)
      if (!userSekolah) {
         throw new AppError("sekolah tidak ditemukan", 404)
      }

      if (userSekolah.user_id) {
         throw new AppError("akun sekolah sudah ada", 409)
      }
   }

   static async createNewSiswa(request: RegisterUserRequest): Promise<{
      username: string;
      user_id: number;
      nama: string;
      siswa_id: number;
  }> {
      const user = await this.initializeUserInput(request);
      await this.validateUserSiswa(request.siswa_id)
      await this.validateUserExistence(request.username);
      const newUser = await userRepository.createUserSiswa(
         user,
         request.siswa_id
      );
      const token = generateTokenSetPassword(newUser.user_id)
      await this.sendResetPasswordLink(request.username, token, newUser.nama)
      return newUser;
   }

   static async createNewAdmin(request: RegisterAdminRequest): Promise<{
      username: string;
      user_id: number;
      sekolah_nama: string;
      sekolah_id: number;
      role_id: number;
  }> {
      const user = await this.initializeUserInput(request);
      await this.validateUserSekolah(request.sekolah_id)
      await this.validateUserExistence(request.username);
      const newUser = await userRepository.createUserSekolah(
         user,
         request.sekolah_id
      );
      const token = generateTokenSetPassword(newUser.user_id)
      await this.sendResetPasswordLink(request.username, token, `Admin ${newUser.sekolah_nama}`)
      return newUser;
   }

   static async createAdminDisdik(request: RegisterAdminDisdikDTO) {
      const user = await this.initializeUserInput(request);
      await this.validateUserExistence(request.username);
      const newUser = await userRepository.createAdminDisdik(user);
      const token = generateTokenSetPassword(newUser.user_id)
      await this.sendResetPasswordLink(newUser.username, token, `Admin Dinas Pendidikan`)
      return newUser;
   }

   static async sendResetPasswordLink(toEmail: string, token: string, name: string): Promise<boolean> {
      const link = `http://localhost:5173/set-password?token=${token}`
      const subject = 'Set Password Akun Anda'
      // const html = `
      // <p>Klik link berikut untuk mengubah password Anda:</p>
      // <a href="${link}">Klik disini</a>
      // <button >Set Password</button>
      // `
      const message = await sendEmail(toEmail, name, subject, link)
      return message
   }


   static async loginUser(
      request: LoginRequest
   ): Promise<LoginServiceResponse> {
      const userData: UserWithRole | null =
         await userRepository.findUserByUsername(request.username);
      if (!userData) {
         throw new AppError("username atau password salah", 400);
      }
      const isPasswordValid = await bcrypt.compare(
         request.password,
         userData.password
      );
      if (!isPasswordValid) {
         throw new AppError("username atau password salah", 400);
      }

      const access_token = generateAccessToken({
         user_id: userData.user_id,
         role: userData.role.role_nama,
      });
      const refresh_token = generateRefreshToken({
         user_id: userData.user_id,
         role: userData.role.role_nama,
      });

      await userRepository.updateUserRefreshToken(
         userData.user_id,
         refresh_token
      );
      const user: UserResponse | UserSiswa | UserAdminSekolah =
         await this.generateUserResponse(userData);
      return { user, access_token, refresh_token };
   }

   private static async generateUserResponse(user: UserWithRole) {
      switch (user.role.role_nama) {
         case "siswa":
            const userSiswa = await userRepository.getUserSiswa(user.user_id);
            if (!userSiswa) {
               throw new AppError("akun siswa tidak ditemukan", 404)
            }
            return {
               user_id: user.user_id,
               username: user.username,
               role: user.role.role_nama,
               siswa_id: userSiswa.siswa_id,
               siswa_nama: userSiswa.nama
            } as UserSiswa;

         case "adminSD":
         case "adminSMP":
            const userSekolah = await userRepository.getUserSekolah(
               user.user_id
            );

            if (!userSekolah) {
               throw new AppError("akun admin tidak ditemukan", 404)
            }

            return {
               user_id: user.user_id,
               username: user.username,
               role: user.role.role_nama,
               sekolah_id: userSekolah.sekolah_id,
               sekolah_nama: userSekolah.sekolah_nama,
            } as UserAdminSekolah;

         default: // Admin Dinas
            return {
               user_id: user.user_id,
               username: user.username,
               role: user.role.role_nama,
            } as UserResponse;
      }
   }

   static async refreshToken(refreshToken: string) {
      if (!refreshToken) {
         throw new AppError("No refresh token provided", 401);
      }

      let payload: JwtPayloadToken | null = null;

      try {
         payload = verifyRefreshToken(refreshToken) as JwtPayloadToken;
         const newAccessToken = generateAccessToken({
            user_id: payload.user_id,
            role: payload.role,
         });
         return newAccessToken;
      } catch (error) {
         if (error instanceof jwt.TokenExpiredError) {
            logger.warn("Token expired for user:", payload?.user_id);
            throw new AppError("Refresh token has expired", 401);
         } else if (error instanceof jwt.JsonWebTokenError) {
            logger.error("Invalid refresh token provided:", error.message);
            throw new AppError("Invalid refresh token", 401);
         } else {
            logger.error("Unexpected error in refreshToken service:", error);
            throw new AppError("Unexpected error occurred", 500);
         }
      }
   }

   static async logoutUser(user_id: number) {
      return await userRepository.deleteUserRefreshToken(user_id);
   }

   static async verifyUsernameAndSendEmail(username: string): Promise<boolean> {
      const user: UserWithRole | null = await userRepository.findUserByUsername(username)
      if(!user) {
         throw new AppError("Username does not exist", 400)
      }
      if(!user.siswa) {
         throw new AppError("Tidak ada siswa yang terkait dengan akun", 400)
      }
      const token = generateTokenSetPassword(user.user_id)
      const message = await this.sendResetPasswordLink(user.username, token, user.siswa.nama)
      return message
   }

   static async updatePassword(password: string, token: string) {
      try {
         const decoded = verifyToken(token) as {user_id: string}
         const hashedPassword = await this.hashPassword(password);
         return await userRepository.updatePassword(Number(decoded.user_id), hashedPassword);
      } catch (error) {
         console.log(error)
         throw new AppError("Token Kadaluwarsa Silahkan Ulangi Kembali", 400)
      }
   }

   static async getAllUserBySekolahId(
      page: number,
      limit: number,
      sekolahId: number
   ) {
      if (!sekolahId) {
         logger.warn("no school id provided");
         throw new AppError("no school id provided", 400);
      }
      const skip = (page - 1) * limit;
      const total: number = await userRepository.countAllUserBySekolah(
         sekolahId
      );
      const users = await userRepository.getAllUserBySekolah(
         skip,
         limit,
         sekolahId
      );
      let users_siswa: UsersResponseBySekolah[] = [];
      users.forEach((user) => {
         if (user.users) {
            users_siswa.push({
               user_id: user.users.user_id,
               username: user.users.username,
               siswa_id: user.siswa_id,
               nama: user.nama,
            });
         }
      });

      return { users_siswa, total };
      // return await userRepository.getAllUserBySekolah(skip, limit, sekolahId)
   }

   static async updateUser(
      userId: number,
      username: string
      // sekolah_id: number | null
   ): Promise<{
      user_id: number;
      username: string;
   }> {
      // if(sekolah_id) {
      //    return await userRepository.updateUserAdmin(userId, username, is_otp, sekolah_id)
      // }
      await this.validateUserExistence(username)
   
      const user = await userRepository.updateUser(userId, username);
      const token = generateTokenSetPassword(user.user_id)
      
      if (user.siswa) {
         const name = user.siswa.nama
         await this.sendResetPasswordLink(username, token, name)
      } else if (user.sekolah) {
         const name = user.sekolah.sekolah_nama
         await this.sendResetPasswordLink(username, token, `Admin ${name}`)
      }

      const response = {
         user_id: user.user_id,
         username: user.username
      }
      return response
   }

   static async getAllRole(): Promise<
      {
         role_id: number;
         role_nama: string;
      }[]
   > {
      return await userRepository.findAllRole();
   }

   // Hapus User
   static async deleteUser(user_id: number): Promise<{
      user_id: number;
   }> {
      return await userRepository.deleteUser(user_id);
   }

   static async getAllUserAdminSekolah(
      page: number,
      limit: number,
      filters: any
   ): Promise<{
      users: UserAdminDTO[];
      total: number;
   }> {
      const skip = (page - 1) * limit;
      let whereClause: any = {};

      if (filters.username?.value) {
         whereClause.username = {
            contains: filters.username.value,
         };
      }

      if (filters.role?.value) {
         whereClause.role_id = filters.role.value;
      }

      whereClause.role_id = {
         in: (await userRepository.findAllRole())
            .filter((role) =>
               ["adminsd", "adminsmp"].includes(role.role_nama.toLowerCase())
            )
            .map((role) => role.role_id),
      };

      const users: UserAdminDTO[] = (
         await userRepository.findAllUserAdminSekolah(skip, limit, whereClause)
      ).map((user) => ({
         user_id: user.user_id,
         username: user.username,
         role: user.role.role_nama,
         role_id: user.role.role_id,
         sekolah_id: user.sekolah ? user.sekolah.sekolah_id : null,
         sekolah_nama: user.sekolah ? user.sekolah.sekolah_nama : null
      }));
      const total = await userRepository.countAllUserAdminSekolah(whereClause);

      return { users, total };
   }

   static async countAllUserBySekolahId(sekolahId: number): Promise<number> {
      const total: number = await userRepository.countAllUserBySekolah(
         sekolahId
      );
      return total
   }
}
