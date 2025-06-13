export interface ApiResponse<T> {
   status: "success" | "error";
   data: T | null;
   meta: any | null;
   error: {
      message: string;
      code: number;
   } | null;
}

export interface UserResponse {
   user_id: number;
   username: string;
   role: string;
}

export interface UserSiswa extends UserResponse {
   siswa_id: number;
   siswa_nama: string;
}

export interface UserAdminSekolah extends UserResponse {
   sekolah_id: number;
   sekolah_nama: string;
}

export interface JwtPayloadToken {
   user_id: number;
   role: string;
}

export interface LoginServiceResponse {
   user: UserResponse | UserSiswa | UserAdminSekolah;
   access_token: string;
   refresh_token: string;
}

export interface LoginResponse extends Omit<LoginServiceResponse, "refresh_token">{}

export interface UpdatePassword {
   user_id: number;
   new_password: string;
}

export interface UsersResponseBySekolah {
   user_id: number;
   username: string;
   siswa_id: number;
   nama: string;
   // is_otp: number;
}

export interface UserUpdateData extends Omit<UsersResponseBySekolah, 'siswa_id' | 'nama' | 'is_otp' | 'user_id'> {
   // sekolah_id: number | null
}

export interface RegisterAdminDisdikDTO {
   username: string;
   // password: string;
   role_id: number;
}

export interface PaginationMeta {
   total: number;
   page: number;
   limit: number;
}

export interface UserAdminDTO extends UserResponse {
   sekolah_id: number | null;
   sekolah_nama: string | null;
   // is_otp: number;
   role_id: number;
}
