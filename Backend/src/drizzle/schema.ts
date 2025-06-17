import { pgTable, serial, varchar, text, date, boolean, timestamp, index, primaryKey, pgEnum, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Define User Roles as a PostgreSQL ENUM
export const userRoleEnum = pgEnum('user_role', ['client', 'doctor', 'admin']);

// 2. User Table (Now with image_url)
export const User = pgTable('user', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 50 }).unique().notNull(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('client').notNull(),
  imageUrl: varchar('image_url', { length: 255 }), // New field for profile pictures
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  verificationToken: varchar('verification_token', { length: 255 }),
  verificationTokenExpiresAt: timestamp('verification_token_expires_at'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpiresAt: timestamp('password_reset_expires_at'),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  roleIdx: index('role_idx').on(table.role),
}));

// 3. Client Profile (No image_url here – it's in the User table)
export const Client = pgTable('client', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull()
    .references(() => User.userId, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
});

// 4. Doctor Profile (No image_url here – it's in the User table)
export const Doctor = pgTable('doctor', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull()
    .references(() => User.userId, { onDelete: 'cascade' }),
  licenseNumber: varchar('license_number', { length: 50 }).unique(),
  specialization: varchar('specialization', { length: 100 }),
});

// 5. HealthProgram with image URL
export const HealthProgram = pgTable('health_program', {
  id: serial('id').primaryKey(),
  programId: varchar('program_id', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 255 }), // Added image URL
  duration: varchar('duration', { length: 50 }), // e.g., "3 months", "6 weeks"
  difficulty: varchar('difficulty', { length: 20 }), // e.g., "Beginner", "Intermediate", "Advanced"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  nameIdx: index('program_name_idx').on(table.name),
}));

// 6. Enhanced Enrollment table
export const Enrollment = pgTable('enrollment', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 50 }).notNull()
    .references(() => User.userId, { onDelete: 'cascade' }),
  programId: varchar('program_id', { length: 50 }).notNull()
    .references(() => HealthProgram.programId, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  progress: integer('progress').default(0),
  notes: text('notes'),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
}, (table) => ({
  userProgramIdx: index('user_program_idx').on(table.userId, table.programId),
  statusIdx: index('enrollment_status_idx').on(table.status),
}));

// Define relationships
export const enrollmentRelations = relations(Enrollment, ({ one }) => ({
  user: one(User, {
    fields: [Enrollment.userId],
    references: [User.userId],
  }),
  program: one(HealthProgram, {
    fields: [Enrollment.programId],
    references: [HealthProgram.programId],
  }),
}));

export const userRelations = relations(User, ({ many }) => ({
  enrollments: many(Enrollment),
}));

export const programRelations = relations(HealthProgram, ({ many }) => ({
  enrollments: many(Enrollment),
}));

// Export the schema object with all tables and enums
export const schema = {
  User,
  Client,
  Doctor,
  HealthProgram,
  Enrollment,
  userRoleEnum,
  enrollmentRelations,
  userRelations,
  programRelations
};