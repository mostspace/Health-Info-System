import { Context } from "hono";
import { authService } from "./auth.service";
import { sendEmail } from "../utils/mail";
import { randomBytes } from 'crypto';

// Type definitions
interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
  licenseNumber?: string;
  specialization?: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export const authController = {
  async register(c: Context) {
    try {
      const userData: RegisterRequest = await c.req.json();
      
      // Validate required fields
      if (!userData.firstName) {
        throw new Error('First name is required');
      }
      if (!userData.lastName) {
        throw new Error('Last name is required');
      }
      if (!userData.email) {
        throw new Error('Email is required');
      }
      if (!userData.password) {
        throw new Error('Password is required');
      }
      if (!userData.gender) {
        throw new Error('Gender is required');
      }
      
      const result = await authService.registerUser({
        ...userData
      });
      
      return c.json({ message: result.message, userId: result.userId }, 201);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Registration failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async login(c: Context) {
    try {
      const { email, password }: LoginRequest = await c.req.json();
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const result = await authService.loginUser({ email, password });
      return c.json(result, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message === "User not found" ? "Invalid credentials" : error.message,
        details: error.details
      };
      return c.json(errorResponse, error.message === "User not found" ? 401 : 400);
    }
  },

  async verifyAccount(c: Context) {
    try {
      const { token } = c.req.query();
      if (!token) {
        throw new Error('Verification token is required');
      }
      
      const result = await authService.verifyUser(token);
      return c.json({ message: result.message }, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Verification failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async requestPasswordReset(c: Context) {
    try {
      const { email } = await c.req.json();
      if (!email) {
        throw new Error('Email is required');
      }
      
      const result = await authService.requestPasswordReset(email);
      return c.json({ message: result.message }, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Password reset request failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async resetPassword(c: Context) {
    try {
      const { token } = c.req.query();
      const { newPassword } = await c.req.json();
      
      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }
      
      const result = await authService.resetPassword(token, newPassword);
      return c.json({ message: result.message }, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Password reset failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async getUserProfile(c: Context) {
    try {
      const userId = c.req.param('userId');
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const user = await authService.getUserProfile(userId);
      return c.json(user, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Failed to get user profile',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async updateProfile(c: Context) {
    try {
      const userId = c.req.param('userId');
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const updateData: UpdateProfileRequest = await c.req.json();
      const result = await authService.updateUserProfile(userId, updateData);
      return c.json({ message: result.message }, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Profile update failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async changePassword(c: Context) {
    try {
      const userId = c.req.param('userId');
      const { currentPassword, newPassword } = await c.req.json();
      
      if (!userId || !currentPassword || !newPassword) {
        throw new Error('User ID, current password, and new password are required');
      }
      
      const result = await authService.changePassword(userId, currentPassword, newPassword);
      return c.json({ message: result.message }, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Password change failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async upgradeToDoctor(c: Context) {
    try {
      const userId = c.req.param('userId');
      const { licenseNumber, specialization } = await c.req.json();
      
      if (!userId || !licenseNumber || !specialization) {
        throw new Error('User ID, license number, and specialization are required');
      }
      
      const result = await authService.upgradeToDoctor(userId, licenseNumber, specialization);
      return c.json({ message: result.message }, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Upgrade to doctor failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async searchUsers(c: Context) {
    try {
      const query = c.req.query('query') || '';
      const role = c.req.query('role');
      
      const results = await authService.searchUsers(query, role);
      return c.json(results, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'User search failed',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async sendVerificationEmail(c: Context) {
    try {
      const { email } = await c.req.json();
      if (!email) {
        throw new Error('Email is required');
      }
      
      const user = await authService.getUserProfile(email);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        return c.json({ message: "User is already verified" }, 400);
      }

      const verificationToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours

      await authService.updateUserProfile(user.userId, {
        verificationToken,
        verificationTokenExpiresAt: expiresAt
      });

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-account?token=${verificationToken}`;
      const response = await sendEmail(
        email,
        '🔐 Email Verification Required',
        `
          <p>👋 Hello there!</p>
          <p>Please verify your email by clicking this link: <a href="${verificationUrl}">Verify Email</a></p>
          <p>This link will expire in 12 hours.</p>
        `
      );

      return c.json({ 
        message: "Verification email sent",
        response
      }, 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Failed to send verification email',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  },

  async getAllUsers(c: Context) {
    try {
      const limit = Number(c.req.query('limit')) || 10;
      const users = await authService.searchUsers('', '');
      return c.json(users.slice(0, limit), 200);
    } catch (error: any) {
      const errorResponse: ErrorResponse = {
        error: error.message || 'Failed to get users',
        details: error.details
      };
      return c.json(errorResponse, 400);
    }
  }
};

export default authController;