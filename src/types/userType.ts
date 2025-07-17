import { Prisma } from "@prisma/client"

export type RegisterUserRequest = {
    username: string,
    // password: string,
    role_id: number,
    siswa_id: number
}

export type RegisterAdminRequest = {
    username: string,
    // password: string,
    role_id: number,
    sekolah_id: number,
    // is_otp: number
}

export type LoginRequest = {
    username: string,
    password: string
}

const userWithRole = Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
       user_id: true,
       username: true,
       password: true,
       role: {
          select: {
             role_nama: true,
          },
       },
       siswa: {
        select: {
            nama: true
        }
       },
       sekolah: {
        select: {
            sekolah_nama: true
        }
       }
    },
 });
 
 export type UserWithRole = Prisma.UserGetPayload<typeof userWithRole>;

