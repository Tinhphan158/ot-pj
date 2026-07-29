import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, User } from '@prisma/client';

const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;
const DATABASE_URL = `postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public`;

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Duration in hours between two "HH:mm" strings (handles overnight). */
function computeHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
}

function dateNMonthsAgo(monthsAgo: number, day: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, day));
}

async function main() {
  console.log('Seeding database...');

  const password = await bcrypt.hash('User@123', 10);

  const usersData = [
    { email: 'admin@ot.local', name: 'System Admin' },
    { email: 'user@ot.local', name: 'Nguyen Van A' },
    { email: 'tran.b@ot.local', name: 'Tran Thi B' },
    { email: 'le.c@ot.local', name: 'Le Van C' },
    { email: 'pham.d@ot.local', name: 'Pham Thi D' },
  ];

  const users: User[] = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password,
        name: u.name,
      },
    });
    users.push(user);
  }

  // Fresh OT rows.
  await prisma.overtime.deleteMany({});

  let count = 0;
  for (const user of users) {
    for (let monthsAgo = 0; monthsAgo < 4; monthsAgo++) {
      const entries = 2 + (monthsAgo % 2);
      for (let i = 0; i < entries; i++) {
        const day = 3 + i * 6 + monthsAgo;
        const startTime = '18:00';
        // Overtime is only allowed until 22:00, so the latest end here is 21:30.
        const endTime = `${20 + (i % 2)}:30`;
        await prisma.overtime.create({
          data: {
            userId: user.id,
            date: dateNMonthsAgo(monthsAgo, Math.min(day, 27)),
            startTime,
            endTime,
            hours: computeHours(startTime, endTime),
          },
        });
        count++;
      }
    }
  }

  console.log(`Seed complete: ${users.length} users, ${count} overtime records.`);
  console.log('Login -> admin@ot.local / User@123  |  user@ot.local / User@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
