import {migrate} from 'drizzle-orm/neon-http/migrator';
import db from './db';
import { sql } from 'drizzle-orm';

async function migration(){
    try {
       console.log("==Migration Started==");
       
       // Drop all existing tables and types
       await db.execute(sql`
         DO $$ 
         BEGIN
           -- Drop tables if they exist
           DROP TABLE IF EXISTS enrollment CASCADE;
           DROP TABLE IF EXISTS health_program CASCADE;
           DROP TABLE IF EXISTS doctor CASCADE;
           DROP TABLE IF EXISTS client CASCADE;
           DROP TABLE IF EXISTS "user" CASCADE;
           
           -- Drop enum type if it exists
           IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
             DROP TYPE user_role CASCADE;
           END IF;
         END $$;
       `);

       await migrate(db,{
        migrationsFolder: __dirname + '/migrations',
       }) ;
       console.log("==Migration Finished==");
       process.exit(0);
    } catch (error) {
        console.error("Migration failed with error: ", error);
        process.exit(1);
    }
}

migration().catch((e) => {
    console.error("Unexpected error during migration:", e);
    process.exit(1);
  });