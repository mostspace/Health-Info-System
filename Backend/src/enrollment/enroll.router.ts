import { Hono } from 'hono';
import {
  createEnrollment,
  listAllEnrollments,
  getEnrollmentsForUser,
  getEnrollmentsForProgram,
  updateEnrollment,
  completeEnrollment,
  deleteEnrollment
} from './enroll.controller';

const enrollmentRouter = new Hono();

// Define routes
enrollmentRouter
  .post('/enrollment', createEnrollment)                          // Create new enrollment
  .get('/enrollment', listAllEnrollments)                         // Get all enrollments
  .get('/user/:user_id', getEnrollmentsForUser)         // Get enrollments by user ID
  .get('/program/:program_id', getEnrollmentsForProgram) // Get enrollments by program ID
  .patch('/:enrollment_id', updateEnrollment)           // Update enrollment details
  .put('/:enrollment_id/complete', completeEnrollment)  // Mark enrollment as complete
  .delete('/:enrollment_id', deleteEnrollment);         // Delete enrollment

export default enrollmentRouter;