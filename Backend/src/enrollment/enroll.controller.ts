import { Context } from "hono";
import {
  createEnrollmentService,
  getAllEnrollmentsService,
  getEnrollmentsByUserIdService,
  getEnrollmentsByProgramIdService,
  updateEnrollmentService,
  completeEnrollmentService,
  deleteEnrollmentService,
  checkEnrollmentExistsService,
} from "./enroll.service";

// Create new enrollment
export const createEnrollment = async (c: Context) => {
  try {
    const enrollmentData = await c.req.json();
    const enrollment = await createEnrollmentService(enrollmentData);
    
    if (enrollment === null) {
      return c.json({ 
        msg: "User is already enrolled in this program 😒" 
      }, 400);
    }
    
    return c.json(enrollment, 201);
  } catch (error: any) {
    return c.json({ msg: error.message }, 400);
  }
};

// Get all enrollments
export const listAllEnrollments = async (c: Context) => {
  try {
    const enrollments = await getAllEnrollmentsService();
    
    if (!enrollments || enrollments.length === 0) {
      return c.json({ msg: "No enrollments found 😒" }, 404);
    }
    
    return c.json(enrollments, 200);
  } catch (error: any) {
    console.error(`Error: ${error}`);
    return c.json({ msg: "Error while fetching enrollments 😒" }, 500);
  }
};

// Get enrollments by user ID
export const getEnrollmentsForUser = async (c: Context) => {
  try {
    const userId = c.req.param("user_id");
    if (!userId) return c.text("Invalid user ID 😒", 400);

    const enrollments = await getEnrollmentsByUserIdService(userId);
    
    if (!enrollments || enrollments.length === 0) {
      return c.json({ 
        msg: "No enrollments found for this user 😒" 
      }, 404);
    }
    
    return c.json(enrollments, 200);
  } catch (error: any) {
    return c.json({ msg: error.message }, 400);
  }
};

// Get enrollments by program ID
export const getEnrollmentsForProgram = async (c: Context) => {
  try {
    const programId = c.req.param("program_id");
    if (!programId) return c.text("Invalid program ID 😒", 400);

    const enrollments = await getEnrollmentsByProgramIdService(programId);
    
    if (!enrollments || enrollments.length === 0) {
      return c.json({ 
        msg: "No enrollments found for this program 😒" 
      }, 404);
    }
    
    return c.json(enrollments, 200);
  } catch (error: any) {
    return c.json({ msg: error.message }, 400);
  }
};

// Update enrollment
export const updateEnrollment = async (c: Context) => {
  try {
    const enrollmentId = parseInt(c.req.param("enrollment_id"));
    if (isNaN(enrollmentId)) return c.text("Invalid enrollment ID 😒", 400);

    const updateData = await c.req.json();
    const updatedEnrollment = await updateEnrollmentService(enrollmentId, updateData);
    
    if (!updatedEnrollment) {
      return c.json({ msg: "Enrollment not updated 😒" }, 400);
    }
    
    return c.json(updatedEnrollment, 200);
  } catch (error: any) {
    return c.json({ msg: error.message }, 400);
  }
};

// Complete enrollment
export const completeEnrollment = async (c: Context) => {
  try {
    const enrollmentId = parseInt(c.req.param("enrollment_id"));
    if (isNaN(enrollmentId)) return c.text("Invalid enrollment ID 😒", 400);

    const completedEnrollment = await completeEnrollmentService(enrollmentId);
    
    if (!completedEnrollment) {
      return c.json({ msg: "Enrollment not completed 😒" }, 400);
    }
    
    return c.json(completedEnrollment, 200);
  } catch (error: any) {
    return c.json({ msg: error.message }, 400);
  }
};

// Delete enrollment
export const deleteEnrollment = async (c: Context) => {
  try {
    const enrollmentId = parseInt(c.req.param("enrollment_id"));
    if (isNaN(enrollmentId)) return c.text("Invalid enrollment ID 😒", 400);

    const enrollment = await checkEnrollmentExistsService(enrollmentId.toString(), "programIdPlaceholder");
    if (!enrollment) {
      return c.json({ msg: "No enrollment found with this ID 😒" }, 404);
    }

    await deleteEnrollmentService(enrollmentId);
    return c.json({ msg: "Enrollment deleted successfully" }, 200);
  } catch (error: any) {
    return c.json({ msg: error.message }, 400);
  }
};