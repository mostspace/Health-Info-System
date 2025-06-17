import { Hono } from "hono";
import { programController } from "./program.controllers";

const programRouter = new Hono();

// Create a new health program
programRouter.post("/program", programController.createProgram);

// Get all health programs
programRouter.get("/program", programController.getAllPrograms);

// Get active health programs
programRouter.get("/program/active", programController.getActivePrograms);

// Get programs by difficulty level
programRouter.get("/program/difficulty/:difficulty", programController.getProgramsByDifficulty);

// Get a specific health program
programRouter.get("/program/:programId", programController.getProgram);

// Update a health program
programRouter.put("/program/:programId", programController.updateProgram);

// Delete a health program
programRouter.delete("/program/:programId", programController.deleteProgram);

// Toggle program status (active/inactive)
programRouter.patch("/program/:programId/toggle", programController.toggleProgramStatus);

export default programRouter;

