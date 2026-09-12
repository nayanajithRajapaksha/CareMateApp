import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CareMate database seed...');

  const saltRounds = 10;

  // 1. Seed Admin User
  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@caremate.gov' },
    update: {
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@caremate.gov',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      profile: {
        create: {
          fullName: 'System Administrator',
          contactNumber: '+94 77 123 4567',
          address: 'Central Health HQ, Colombo',
        },
      },
    },
  });
  console.log('✅ Admin user ready:', adminUser.email);

  // 2. Seed MOH User
  const mohPassword = await bcrypt.hash('Moh@123', saltRounds);
  const mohUser = await prisma.user.upsert({
    where: { email: 'moh@caremate.gov' },
    update: {
      passwordHash: mohPassword,
      role: Role.MOH,
    },
    create: {
      email: 'moh@caremate.gov',
      passwordHash: mohPassword,
      role: Role.MOH,
      profile: {
        create: {
          fullName: 'Dr. Bandara (MOH Officer)',
          contactNumber: '+94 71 987 6543',
          address: 'Regional Health Office, Kandy',
          clinicId: 'MOH-KANDY-01',
        },
      },
    },
  });
  console.log('✅ MOH user ready:', mohUser.email);

  // 3. Seed Midwife (PHM) User
  const midwifePassword = await bcrypt.hash('Midwife@123', saltRounds);
  const midwifeUser = await prisma.user.upsert({
    where: { email: 'midwife@caremate.gov' },
    update: {
      passwordHash: midwifePassword,
      role: Role.MIDWIFE,
    },
    create: {
      email: 'midwife@caremate.gov',
      passwordHash: midwifePassword,
      role: Role.MIDWIFE,
      profile: {
        create: {
          fullName: 'Somalatha Perera (PHM)',
          contactNumber: '+94 75 555 1234',
          address: 'Maternal Care Unit, Division 4',
          nic: '198567200123',
          clinicId: 'MOH-KANDY-01',
        },
      },
    },
  });
  console.log('✅ Midwife (PHM) user ready:', midwifeUser.email);

  // 4. Seed Parent User with Sample Child
  const parentPassword = await bcrypt.hash('Parent@123', saltRounds);
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@caremate.gov' },
    update: {
      passwordHash: parentPassword,
      role: Role.PARENT,
    },
    create: {
      email: 'parent@caremate.gov',
      passwordHash: parentPassword,
      role: Role.PARENT,
      profile: {
        create: {
          fullName: 'Nimal Silva',
          contactNumber: '+94 70 888 9900',
          address: '123 Station Road, Kandy',
          nic: '199012345678',
        },
      },
    },
  });
  console.log('✅ Parent user ready:', parentUser.email);

  // Seed sample child for parent
  const existingChild = await prisma.child.findFirst({
    where: { parentId: parentUser.id },
  });

  if (!existingChild) {
    await prisma.child.create({
      data: {
        parentId: parentUser.id,
        fullName: 'Kavindi Silva',
        dob: new Date('2024-03-15'),
        gender: 'Female',
        birthCertNumber: 'BC-2024-99881',
        medicalProfile: {
          create: {
            bloodGroup: 'O+',
            birthWeightKg: 3.2,
            allergies: 'None',
            existingConditions: 'Healthy',
          },
        },
      },
    });
    console.log('👶 Sample child profile created for parent.');
  }

  console.log('🚀 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
