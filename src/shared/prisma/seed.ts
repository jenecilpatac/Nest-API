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
    skipDuplicates: true,
  });

  const adminRole = await prisma.roles.create({
    data: {
      name: 'admin',
    },
    skipDuplicates: true,
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
      name: 'John Doe',
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
      name: 'Administrator',
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
      name: 'Super Administrator',
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
      name: 'Moderator',
      username: 'moderator',
      email: 'moderator@example.com',
      password: hashedPassword,
      emailVerifiedAt: new Date(),
      roles: {
        connect: { id: moderatorRole.id },
      },
    },
  });

  let number = 1;
  const users = Array.from({ length: 50 }, () => ({
    name: `User ${number++}`,
    email: `user${number++}@gmail.com`,
    username: `user${number++}`,
    password: hashedPassword,
    emailVerifiedAt: new Date(),
    roles: {
      connect: { id: userRole.id },
    },
  }));

  for (const user of users) {
    await prisma.users.create({
      data: user,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
