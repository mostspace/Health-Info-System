import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { schema } from "./schema";

const client = neon(process.env.DATABASE_URL as string);

const db = drizzle(client, { 
  schema,
  logger: true
});

export default db;