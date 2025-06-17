import { faker } from '@faker-js/faker';
import db from './db';
import { User, Client, HealthProgram, Enrollment } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create a test user
    const userId = `USER-${Date.now()}`;
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const [user] = await db
      .insert(User)
      .values({
        userId,
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'client',
        isActive: true,
        isVerified: true,
      })
      .returning();

    // Create client profile
    await db.insert(Client).values({
      userId,
      firstName: 'Test',
      lastName: 'User',
      gender: 'Male',
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
    });

    // Create a health program
    const programId = `PROG-${Date.now()}`;
    const [program] = await db
      .insert(HealthProgram)
      .values({
        programId,
        name: 'Weight Loss Program',
        description: 'A comprehensive program to help you achieve your weight loss goals',
        imageUrl: faker.image.url(),
        duration: '12 weeks',
        difficulty: 'Beginner',
        isActive: true,
      })
      .returning();

    // Create an enrollment
    await db.insert(Enrollment).values({
      userId,
      programId,
      status: 'active',
      progress: 0,
      notes: 'Test enrollment',
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('Test User ID:', userId);
    console.log('Test Program ID:', programId);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 