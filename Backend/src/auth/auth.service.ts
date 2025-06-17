import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from 'crypto';
import { and, eq, or, like, gt } from "drizzle-orm";
import db from "../drizzle/db";
import { User, Client, Doctor, HealthProgram, Enrollment, userRoleEnum } from "../drizzle/schema";
import { sendEmail } from "../utils/mail";
// import { sendVerificationEmail, sendPasswordResetEmail } from "./email.service";

const secret = process.env.JWT_SECRET || 'your-secret-key';
const expiresIn = '24h'; // Changed to string literal

// Type definitions
interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phone?: string;
  address?: string;
  imageUrl?: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    role: string;
    imageUrl?: string | null;
    profile: any;
  };
}

// Auth Service
export const authService = {
  async registerUser(userData: RegisterUserInput): Promise<{ message: string; userId: string }> {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(User)
      .where(eq(User.email, userData.email))
      .execute();

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = `USER-${Date.now()}`;

    // Create base user
    const newUser = await db
      .insert(User)
      .values({
        userId,
        email: userData.email,
        passwordHash: hashedPassword,
        role: 'client',
        imageUrl: userData.imageUrl,
        createdAt: new Date(),
        isActive: true,
        isVerified: true, // Auto-verify for now
      })
      .returning()
      .execute();

    if (!newUser.length) {
      throw new Error('Failed to register user');
    }

    // Create client profile
    await db.insert(Client).values({
      userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      gender: userData.gender,
      phone: userData.phone,
      address: userData.address,
    }).execute();

    return {
      message: 'User registered successfully.',
      userId
    };
  },

  async verifyUser(token: string): Promise<{ message: string }> {
    const now = new Date();

    const users = await db
      .select()
      .from(User)
      .where(
        and(
          eq(User.verificationToken, token),
          gt(User.verificationTokenExpiresAt, now)
        )
      )
      .execute();

    if (users.length === 0) {
      throw new Error("Invalid or expired verification token");
    }

    const user = users[0];

    if (user.isVerified) {
      return { message: "User is already verified" };
    }

    await db
      .update(User)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      })
      .where(eq(User.userId, user.userId))
      .execute();

    return { message: "Account successfully verified!" };
  },

  async loginUser({ email, password }: LoginUserInput): Promise<AuthResponse> {
    const users = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .execute();

    if (users.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = users[0];

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Get profile data based on role
    let profile;
    if (user.role === 'client') {
      const [client] = await db
        .select()
        .from(Client)
        .where(eq(Client.userId, user.userId))
        .execute();
      profile = client;
    } else if (user.role === 'doctor') {
      const [doctor] = await db
        .select()
        .from(Doctor)
        .where(eq(Doctor.userId, user.userId))
        .execute();
      profile = doctor;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.userId,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl
      },
      secret,
      { expiresIn }
    );

    return { 
      token,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        imageUrl: user.imageUrl,
        profile
      }
    };
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const users = await db
      .select()
      .from(User)
      .where(eq(User.email, email))
      .execute();

    if (users.length === 0) {
      throw new Error("User not found");
    }

    const user = users[0];
    const resetToken = randomBytes(32).toString('hex');
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail(
      user.email,
      '🔑 Password Reset Request',
      `
        <p>👋 Hello there!</p>
        <p>You requested a password reset. Click this link to reset your password: <a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
      `
    );

    return { message: "Password reset link sent to your email" };
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // In a real implementation, you would verify the token here
    // For now, we'll just update the password
    await db
      .update(User)
      .set({ passwordHash: hashedPassword })
      .where(eq(User.userId, token)) // Using token as userId for now
      .execute();

    return { message: "Password updated successfully" };
  },

  async upgradeToDoctor(userId: string, licenseNumber: string, specialization: string): Promise<{ message: string }> {
    // Verify user exists and is a client
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.userId, userId))
      .execute();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== 'client') {
      throw new Error("Only clients can be upgraded to doctors");
    }

    // Update user role
    await db
      .update(User)
      .set({ role: 'doctor' })
      .where(eq(User.userId, userId))
      .execute();

    // Create doctor profile
    await db.insert(Doctor).values({
      userId,
      licenseNumber,
      specialization,
    }).execute();

    return { message: "User upgraded to doctor successfully" };
  },

  async getUserProfile(userId: string): Promise<any> {
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.userId, userId))
      .execute();

    if (!user) {
      throw new Error("User not found");
    }

    let profile;
    if (user.role === 'client') {
      [profile] = await db
        .select()
        .from(Client)
        .where(eq(Client.userId, userId))
        .execute();
    } else if (user.role === 'doctor') {
      [profile] = await db
        .select()
        .from(Doctor)
        .where(eq(Doctor.userId, userId))
        .execute();
    }

    return {
      ...user,
      profile
    };
  },

  async updateUserProfile(userId: string, updateData: any): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.userId, userId))
      .execute();

    if (!user) {
      throw new Error("User not found");
    }

    // Update base user info
    if (updateData.email || updateData.imageUrl) {
      await db
        .update(User)
        .set({
          email: updateData.email,
          imageUrl: updateData.imageUrl,
        })
        .where(eq(User.userId, userId))
        .execute();
    }

    // Update role-specific profile
    if (user.role === 'client') {
      await db
        .update(Client)
        .set({
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          phone: updateData.phone,
          address: updateData.address,
        })
        .where(eq(Client.userId, userId))
        .execute();
    } else if (user.role === 'doctor') {
      await db
        .update(Doctor)
        .set({
          licenseNumber: updateData.licenseNumber,
          specialization: updateData.specialization,
        })
        .where(eq(Doctor.userId, userId))
        .execute();
    }

    return { message: "Profile updated successfully" };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.userId, userId))
      .execute();

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(User)
      .set({ passwordHash: hashedPassword })
      .where(eq(User.userId, userId))
      .execute();

    return { message: "Password changed successfully" };
  },

  async searchUsers(query: string, role?: string): Promise<any[]> {
    let whereClause = and(
      or(
        like(User.email, `%${query}%`),
        like(User.userId, `%${query}%`)
      )
    );

    if (role) {
      whereClause = and(whereClause, eq(User.role, role as typeof userRoleEnum.enumValues[number]));
    }

    const users = await db
      .select()
      .from(User)
      .where(whereClause)
      .execute();

    // Fetch profiles for each user
    const results = await Promise.all(users.map(async (user) => {
      let profile;
      if (user.role === 'client') {
        [profile] = await db
          .select()
          .from(Client)
          .where(eq(Client.userId, user.userId))
          .execute();
      } else if (user.role === 'doctor') {
        [profile] = await db
          .select()
          .from(Doctor)
          .where(eq(Doctor.userId, user.userId))
          .execute();
      }

      return {
        ...user,
        profile
      };
    }));

    return results;
  }
};

export default authService;