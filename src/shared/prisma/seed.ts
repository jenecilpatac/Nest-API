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

  const categories = [
    {
      categoryName: 'Technology',
      description:
        'Posts about software development, gadgets, and tech trends.',
      slug: 'technology',
    },
    {
      categoryName: 'Health',
      description: 'Articles about fitness, wellness, and medical topics.',
      slug: 'health',
    },
    {
      categoryName: 'Travel',
      description: 'Guides, tips, and experiences from around the world.',
      slug: 'travel',
    },
    {
      categoryName: 'Food',
      description: 'Recipes, cooking tips, and food reviews.',
      slug: 'food',
    },
    {
      categoryName: 'Lifestyle',
      description: 'Content about daily living, habits, and personal growth.',
      slug: 'lifestyle',
    },
    {
      categoryName: 'Business',
      description: 'Insights on entrepreneurship, startups, and markets.',
      slug: 'business',
    },
    {
      categoryName: 'Education',
      description: 'Learning resources, tutorials, and academic topics.',
      slug: 'education',
    },
    {
      categoryName: 'Entertainment',
      description: 'Movies, music, celebrity news, and pop culture.',
      slug: 'entertainment',
    },
    {
      categoryName: 'Sports',
      description: 'News, updates, and analysis on various sports.',
      slug: 'sports',
    },
    {
      categoryName: 'Finance',
      description: 'Personal finance, investing, and money management tips.',
      slug: 'finance',
    },
  ];

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

  await prisma.categories.createMany({
    data: categories,
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
