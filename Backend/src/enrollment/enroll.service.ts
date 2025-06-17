import db from "../drizzle/db";
import { eq, and, or, sql } from "drizzle-orm";
import { Enrollment, User, HealthProgram } from "../drizzle/schema";

// Create new enrollment
export const createEnrollmentService = async (enrollmentData: {
  userId: string;
  programId: string;
  notes?: string;
}) => {
  console.log("Creating Enrollment with Data:", enrollmentData);

  // Check if enrollment already exists
  const existingEnrollment = await db.query.Enrollment.findFirst({
    where: and(
      eq(Enrollment.userId, enrollmentData.userId),
      eq(Enrollment.programId, enrollmentData.programId)
    ),
  });

  if (existingEnrollment) {
    console.log("Enrollment already exists:", existingEnrollment);
    return null;
  }

  const result = await db
    .insert(Enrollment)
    .values({
      userId: enrollmentData.userId,
      programId: enrollmentData.programId,
      notes: enrollmentData.notes,
      status: 'active',
      progress: 0
    })
    .returning({
      id: Enrollment.id,
      userId: Enrollment.userId,
      programId: Enrollment.programId,
      status: Enrollment.status
    })
    .execute();

  console.log("Created Enrollment Response:", result);
  return result[0];
};

// Get all enrollments
export const getAllEnrollmentsService = async () => {
  try {
    const enrollments = await db.execute(sql`
      SELECT 
        e.id,
        e.user_id as "userId",
        e.program_id as "programId",
        e.enrolled_at as "enrolledAt",
        e.completed_at as "completedAt",
        e.status,
        e.progress,
        e.notes,
        e.last_accessed_at as "lastAccessedAt",
        u.email,
        u.role,
        p.name as "programName"
      FROM enrollment e
      LEFT JOIN "user" u ON e.user_id = u.user_id
      LEFT JOIN health_program p ON e.program_id = p.program_id
    `);
    
    // Map the response to match the frontend's expected format
    const mappedEnrollments = enrollments.rows.map(row => ({
      id: row.id,
      userId: row.userId,
      programId: row.programId,
      enrolledAt: row.enrolledAt,
      completedAt: row.completedAt,
      status: row.status,
      progress: row.progress,
      notes: row.notes,
      lastAccessedAt: row.lastAccessedAt,
      user: {
        email: row.email,
        role: row.role
      },
      program: {
        name: row.programName
      }
    }));

    console.log("Mapped Enrollments:", mappedEnrollments);
    return mappedEnrollments;
  } catch (err) {
    console.error("Error in getAllEnrollmentsService:", err);
    throw err;
  }
};

// Get enrollments by user ID
export const getEnrollmentsByUserIdService = async (userId: string) => {
  return await db.query.Enrollment.findMany({
    where: eq(Enrollment.userId, userId),
    with: {
      program: {
        columns: {
          programId: true,
          name: true,
          description: true,
          imageUrl: true,
          duration: true
        }
      }
    }
  });
};

// Get enrollments by program ID
export const getEnrollmentsByProgramIdService = async (programId: string) => {
  return await db.query.Enrollment.findMany({
    where: eq(Enrollment.programId, programId),
    with: {
      user: {
        columns: {
          userId: true,
          email: true
        }
      }
    }
  });
};

// Update enrollment
export const updateEnrollmentService = async (
  enrollmentId: number,
  updateData: {
    status?: 'active' | 'completed' | 'inactive'; // Define possible statuses directly or replace with the correct type
    progress?: number;
    notes?: string;
  }
) => {
  const result = await db
    .update(Enrollment)
    .set({
      status: updateData.status,
      progress: updateData.progress,
      notes: updateData.notes,
      lastAccessedAt: new Date()
    })
    .where(eq(Enrollment.id, enrollmentId))
    .returning()
    .execute();

  return result[0];
};

// Complete enrollment
export const completeEnrollmentService = async (enrollmentId: number) => {
  const result = await db
    .update(Enrollment)
    .set({
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
      lastAccessedAt: new Date()
    })
    .where(eq(Enrollment.id, enrollmentId))
    .returning()
    .execute();

  return result[0];
};

// Delete enrollment
export const deleteEnrollmentService = async (enrollmentId: number) => {
  await db
    .delete(Enrollment)
    .where(eq(Enrollment.id, enrollmentId))
    .execute();
  return "Enrollment deleted successfully";
};

// Check if user is enrolled in program
export const checkEnrollmentExistsService = async (userId: string, programId: string) => {
  return await db.query.Enrollment.findFirst({
    where: and(
      eq(Enrollment.userId, userId),
      eq(Enrollment.programId, programId)
    )
  });
};