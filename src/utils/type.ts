import { RegisterAdminRequest, RegisterUserRequest } from "../types/userType";

export function isUserSiswa(request: RegisterUserRequest | RegisterAdminRequest | null): request is RegisterUserRequest {
    return (request as RegisterUserRequest)?.siswa_id !== undefined;
}

export function isUserAdminSekolah(request: RegisterUserRequest | RegisterAdminRequest | null): request is RegisterAdminRequest {
    return (request as RegisterAdminRequest)?.sekolah_id !== undefined;
}