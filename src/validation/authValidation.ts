import { z } from 'zod';

// regex password dengan karakter tambahan # atau @ atau *
// /^(?=.*[#@*])(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d\#\@\*]+$/

const username = z.string().min(1).email()
const password = z.string().min(3).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]+$/)
export const registerUserSchema = z.object({
  username: username,
  role_id: z.number().min(1).positive({message: "role id should be a positive number"}).max(4, {message: "There is no role id greater than 4"}),
  siswa_id: z.number().min(1).positive({message: "siswa id should be a positive number"})
});

export const registerAdminSchema = z.object({
  username: username,
  // password: password,
  role_id: z.number().min(1).positive({message: "role id should be a positive number"}).max(4, {message: "There is no role id greater than 4"}),
  sekolah_id: z.number().min(1).positive({message: "sekolah id should be a positive number"})
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const updatePasswordSchema = z.object({
  password: password
})

export const verifyUsernameSchema = z.object({
  username: username
})

export const tokenQuerySchema = z.object({
  token: z.string()
})

export const getAllSiswaQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  limit: z.string().regex(/^\d+$/, "ID must be a numeric string")
})

export const getAllSiswaParamsSchema = z.object({
  sekolah_id: z.string().regex(/^\d+$/, "ID must be a numeric string")
})

export const registerAdminDisdikSchema = z.object({
  username: username,
  // password: z.string().min(6),
  role_id: z.number().min(1).positive({message: "role id should be a positive number"}).max(4, {message: "There is no role id greater than 4"})
});

export const userParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a numeric string")
})

const filterSchema = z.object({
  value: z.string().or(z.boolean()).nullable(),
  matchMode: z.string()
})
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  limit: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  filters: z
  .string()
  .optional()
  .transform((str) => {
    try {
      const val = str ? JSON.parse(str) : {}
      console.log(val)
      return val;
    } catch (e) {
      return null; // Jika gagal parse, return null agar validasi gagal nanti
    }
  })
  .refine(
    (data) => data !== null && typeof data === "object" && !Array.isArray(data),
    {
      message: "filters harus berupa objek JSON yang valid",
    }
  )
  .pipe(z.record(filterSchema))
});