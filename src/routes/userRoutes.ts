import express from "express";
import { authMiddleware } from "../middleware/jwtAuth";
import { roleMiddleware } from "../middleware/verifyRole";
import { validateRequest } from "../middleware/validation";
import {
   getAllSiswaParamsSchema,
   getAllSiswaQuerySchema,
   loginSchema,
   paginationSchema,
   registerAdminDisdikSchema,
   registerAdminSchema,
   registerUserSchema,
   tokenQuerySchema,
   updatePasswordSchema,
   userParamsSchema,
   verifyUsernameSchema,
} from "../validation/authValidation";
import * as userController from "../controllers/authController";

const router = express.Router();

router.post(
   "/login",
   validateRequest({ body: loginSchema }),
   userController.login
);

router.post(
   "/register-siswa",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ body: registerUserSchema }),
   userController.registerUser
);

router.post(
   "/register-admin",
   authMiddleware,
   roleMiddleware(["adminDisdik"]),
   validateRequest({ body: registerAdminSchema }),
   userController.registerAdmin
);

router.post(
   "/register-admin-disdik",
   // authMiddleware,
   // roleMiddleware(["adminDisdik", "superAdmin"]),
   validateRequest({ body: registerAdminDisdikSchema }),
   userController.registerAdminDisdik
);

// public
router.post(
   "/refresh",
   // authMiddleware,
   // roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   userController.refreshAccessToken
);

router.post(
   "/verify-username",
   validateRequest({ body: verifyUsernameSchema }),
   userController.verifyUsernameAndSendEmail
);

router.put(
   "/change-password",
   // authMiddleware,
   // roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   validateRequest({ query: tokenQuerySchema, body: updatePasswordSchema }),
   userController.setUserPassword
);

router.put(
   "/users/update/:id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({ params: userParamsSchema, body: verifyUsernameSchema }),
   userController.updateUser
);

router.get(
   "/users/:sekolah_id",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   validateRequest({
      query: getAllSiswaQuerySchema,
      params: getAllSiswaParamsSchema,
   }),
   userController.getAllUserBySekolah
);

router.delete(
   "/logout",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   userController.logout
);

router.delete(
   "/users/:id",
   authMiddleware,
   roleMiddleware(["siswa", "adminSD", "adminSMP", "adminDisdik"]),
   validateRequest({params: userParamsSchema}),
   userController.deleteUser
);

router.get("/role",
   authMiddleware,
   roleMiddleware(["adminSD", "adminDisdik"]),
   userController.getAllRole
)

router.get("/users-admin",
   authMiddleware,
   roleMiddleware(["adminDisdik", "superAdmin"]),
   validateRequest({query: paginationSchema}),
   userController.getAllUserAdminSekolah
)

router.post(
   '/send-email',
   userController.sendEmailTesting
)

export default router;
