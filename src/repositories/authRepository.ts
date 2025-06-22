import { Prisma } from "@prisma/client";
import { prisma } from "../utils/database";

export class userRepository {
   static async createUserSiswa(user: Prisma.UserCreateInput, siswaId: number) {
      return await prisma.$transaction(async (tx) => {
         const newUser = await tx.user.create({
            data: user,
            select: {
               user_id: true,
               username: true,
            },
         });
         // connect to siswa
         const siswa = await tx.siswa.update({
            where: {
               siswa_id: siswaId,
            },
            data: {
               users: {
                  connect: {
                     user_id: newUser.user_id,
                  },
               },
            },
            select: {
               siswa_id: true,
               user_id: true,
               nama: true
            },
         });
         const newUserSiswa = {
            ...newUser,
            nama: siswa.nama,
            siswa_id: siswa.siswa_id
         }
         return newUserSiswa
      });
   }

   static async findAllRole() {
      return prisma.role.findMany({
         select: {
            role_id: true,
            role_nama: true
         }
      })
   }

   static async createUserSekolah(user: Prisma.UserCreateInput, sekolahId: number) {
      return await prisma.$transaction(async (tx) => {
         const newUser = await tx.user.create({
            data: user,
            select: {
               user_id: true,
               username: true,
               role_id: true
            },
         });
         
         const sekolah = await tx.sekolah.update({
            where: {
               sekolah_id: sekolahId,
            },
            data: {
               user: {
                  connect: {
                     user_id: newUser.user_id,
                  },
               },
            },
            select: {
               sekolah_id: true,
               user_id: true,
               sekolah_nama: true
            },
         });
         const newUserSekolah = {
            ...newUser,
            sekolah_nama: sekolah.sekolah_nama,
            sekolah_id: sekolah.sekolah_id
         }
         return newUserSekolah
      });
   }

   static async findUserBySekolah(sekolahId: number) {
      return prisma.sekolah.findUnique({
         where: { sekolah_id: sekolahId },
         select: {
            user_id: true
         }
      })
   }

   static async findUserBySiswa(siswaId: number) {
      return prisma.siswa.findUnique({
         where: { siswa_id: siswaId },
         select: {
            user_id: true
         }
      })
   }

   static async findUserByUsername(username: string) {
      return prisma.user.findFirst({
         where: {
            username: username,
         },
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
            }
         },
      });
   }

   static async updateUserRefreshToken(userId: number, refreshToken: string) {
      return prisma.user.update({
         where: {
            user_id: userId,
         },
         data: {
            refresh_token: refreshToken,
         },
         select: {
            user_id: true,
         },
      });
   }

   static async getUserSiswa(userId: number) {
      return prisma.siswa.findUnique({
         where: {
            user_id: userId,
         },
         select: {
            siswa_id: true,
            nama: true,
         },
      });
   }

   static async getUserSekolah(userId: number) {
      return prisma.sekolah.findUnique({
         where: {
            user_id: userId,
         },
         select: {
            sekolah_id: true,
            sekolah_nama: true,
         },
      });
   }

   static async findUserById(userId: number) {
      return prisma.user.findUnique({
         where: {
            user_id: userId,
         },
         select: {
            user_id: true,
            refresh_token: true,
         },
      });
   }
   
   static async deleteUserRefreshToken(userId: number) {
      return prisma.user.update({
         where: {
            user_id: userId,
         },
         data: {
            refresh_token: null,
         },
         select: {user_id: true},
      });
   }
   
   static async updatePassword(userId: number, newPassword: string) {
      return prisma.user.update({
         where: {
            user_id: userId,
         },
         data: {
            password: newPassword
         },
         select: {
            user_id: true,
         },
      });
   }

   static async updateUser(userId: number, username: string) {
      return prisma.user.update({
         where: {
            user_id: userId
         },
         data: {
            username: username
         },
         select: {
            user_id: true,
            username: true,
            siswa: { select: { nama: true } },
            sekolah: { select: { sekolah_nama: true } }
         }
      }) 
   }

   static async updateUserAdmin(userId: number, username: string, sekolah_id: number) {
      return prisma.$transaction(async (tx) => {
         const user = await tx.user.update({
            where: { user_id: userId },
            data: {
               username: username,
            },
            select: {
               user_id: true
            }
         })

         await tx.sekolah.update({
            where: { sekolah_id: sekolah_id },
            data: {
               user: {
                  connect: {
                     user_id: userId
                  }
               }
            }
         })

         return user
      })
   }

   static async deleteUser(userId: number) {
      return prisma.user.delete({
         where: {
            user_id: userId
         },
         select: {
            user_id: true
         }
      })
   }
   
   static async getAllUserBySekolah(
      skip: number,
      limit: number,
      sekolahId: number
   ) {
      // next gunakan redis
      return prisma.siswa.findMany({
         where: {
            sekolah_asal_id: sekolahId,
            NOT: {
               users: null
            }
         },
         skip: skip,
         take: limit,
         select: {
            siswa_id: true,
            nama: true,
            users: {
               select: {
                  user_id: true,
                  username: true
               },
            },
         },
      });
   }
   static async countAllUserBySekolah(sekolahId: number) {
      return prisma.siswa.count({
         where: {
            sekolah_asal_id: sekolahId,
            NOT: {
               users: null
            }
         }
      })
   }
   static async createAdminDisdik(user: Prisma.UserCreateInput) {
      return prisma.user.create({
         data: user,
         select: {
            user_id: true,
            username: true,
            role_id: true
         }
      })
   }

   static async findAllUserAdminSekolah(skip: number, limit: number, whereClause: any) {
      return prisma.user.findMany({
         where: whereClause,
         skip: skip,
         take: limit,
         select: {
            user_id: true,
            username: true,
            sekolah: {
               select: {
                  sekolah_id: true,
                  sekolah_nama: true
               }
            },
            role: {
               select: {
                  role_nama: true,
                  role_id: true
               }
            }
         }
      })
   }

   static async countAllUserAdminSekolah(whereClause: any) {
      return prisma.user.count({
         where: whereClause
      })
   }
}
