import { Hono } from "hono";
import { authController } from "./auth.controller";

export const authRouter = new Hono();

// Auth Routes
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/verify', authController.verifyAccount);
authRouter.post('/resend-verification', authController.sendVerificationEmail);

// Password Management
authRouter.post('/forgot-password', authController.requestPasswordReset);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.put('/users/:userId/password', authController.changePassword);

// User Profile Routes
authRouter.get('/users/:userId', authController.getUserProfile);
authRouter.put('/users/:userId', authController.updateProfile);

// Doctor-Specific Routes
authRouter.post('/users/:userId/upgrade-to-doctor', authController.upgradeToDoctor);

// User Management Routes (Admin)
authRouter.get('/users', authController.getAllUsers);
authRouter.get('/users/search', authController.searchUsers);

// V2 Routes (Maintained for backward compatibility)
authRouter.get('/v2/users', authController.getAllUsers);
authRouter.get('/v2/users/:user_id', authController.getUserProfile);
authRouter.get('/v2/users/search', authController.searchUsers);
authRouter.put('/v2/users/:user_id', authController.updateProfile);
// authRouter.delete('/v2/users/:user_id', authController.deleteUserV2);