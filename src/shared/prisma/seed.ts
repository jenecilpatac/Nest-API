import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma: any = new PrismaClient();

async function main() {
  const samplePassword = 'password';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(samplePassword, salt);

  const superAdminRole = await prisma.roles.create({
    data: {
      name: 'superadmin',
    },
  });

  const adminRole = await prisma.roles.create({
    data: {
      name: 'admin',
    },
  });

  const userRole = await prisma.roles.create({
    data: {
      name: 'user',
    },
  });

  const moderatorRole = await prisma.roles.create({
    data: {
      name: 'moderator',
    },
  });

  const user = await prisma.users.create({
    data: {
      username: 'johndoe',
      email: 'johndoe@gmail.com',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
      roles: {
        connect: { id: userRole.id },
      },
    },
  });

  const admin = await prisma.users.create({
    data: {
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
      roles: {
        connect: { id: adminRole.id },
      },
    },
  });

  const superadmin = await prisma.users.create({
    data: {
      username: 'superadmin',
      email: 'superadmin@gmail.com',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
      roles: {
        connect: { id: superAdminRole.id },
      },
    },
  });

  const moderator = await prisma.users.create({
    data: {
      username: 'moderator',
      email: 'moderator@example.com',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
      roles: {
        connect: { id: moderatorRole.id },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
