const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.ledger.deleteMany({});
  await prisma.trade.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Alice (Python tutor, 0 balance)
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@skillswap.com',
      passwordHash: hashedPassword,
      lat: 40.7580,
      lng: -73.9855,
      balance: 5.5,
      rating: 4.8,
      totalHelps: 12,
      skills: {
        create: [
          { name: 'Python Programming', kind: 'offer', level: 'advanced', yearsOfExp: 5, isVerified: true },
          { name: 'Spanish Language', kind: 'offer', level: 'intermediate', yearsOfExp: 3, isVerified: false },
          { name: 'Home Repair', kind: 'need', level: 'beginner', yearsOfExp: 0 },
        ],
      },
    },
  });

  // Create Bob (Handyman, 2 balance)
  const bob = await prisma.user.create({
    data: {
      name: 'Bob Martinez',
      email: 'bob@skillswap.com',
      passwordHash: hashedPassword,
      lat: 40.7489,
      lng: -73.9680,
      balance: 2,
      rating: 4.9,
      totalHelps: 8,
      skills: {
        create: [
          { name: 'Home Repair', kind: 'offer', level: 'expert', yearsOfExp: 10, isVerified: true },
          { name: 'Carpentry', kind: 'offer', level: 'advanced', yearsOfExp: 8, isVerified: true },
          { name: 'Web Development', kind: 'need', level: 'beginner', yearsOfExp: 0 },
        ],
      },
    },
  });

  // Create Carol (Gardener, 1 balance)
  const carol = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@skillswap.com',
      passwordHash: hashedPassword,
      lat: 40.7614,
      lng: -73.9776,
      balance: 1,
      rating: 4.7,
      totalHelps: 6,
      skills: {
        create: [
          { name: 'Gardening', kind: 'offer', level: 'expert', yearsOfExp: 12, isVerified: true },
          { name: 'Pet Care', kind: 'offer', level: 'intermediate', yearsOfExp: 4, isVerified: false },
          { name: 'Music Lessons', kind: 'need', level: 'beginner', yearsOfExp: 0 },
        ],
      },
    },
  });

  // Create David (Music teacher, 3 balance)
  const david = await prisma.user.create({
    data: {
      name: 'David Kim',
      email: 'david@skillswap.com',
      passwordHash: hashedPassword,
      lat: 40.7580,
      lng: -73.9690,
      balance: 3,
      rating: 4.9,
      totalHelps: 15,
      skills: {
        create: [
          { name: 'Music Lessons', kind: 'offer', level: 'expert', yearsOfExp: 15, isVerified: true },
          { name: 'Guitar Tutoring', kind: 'offer', level: 'advanced', yearsOfExp: 10, isVerified: true },
          { name: 'Gardening', kind: 'need', level: 'beginner', yearsOfExp: 0 },
        ],
      },
    },
  });

  // Create Emma (Chef, 2 balance)
  const emma = await prisma.user.create({
    data: {
      name: 'Emma Wilson',
      email: 'emma@skillswap.com',
      passwordHash: hashedPassword,
      lat: 40.7520,
      lng: -73.9750,
      balance: 2,
      rating: 4.6,
      totalHelps: 5,
      skills: {
        create: [
          { name: 'Cooking Classes', kind: 'offer', level: 'advanced', yearsOfExp: 6, isVerified: false },
          { name: 'Baking', kind: 'offer', level: 'expert', yearsOfExp: 8, isVerified: true },
          { name: 'Fitness Training', kind: 'need', level: 'beginner', yearsOfExp: 0 },
        ],
      },
    },
  });

  // Create Frank (Fitness trainer, 1 balance)
  const frank = await prisma.user.create({
    data: {
      name: 'Frank Thompson',
      email: 'frank@skillswap.com',
      passwordHash: hashedPassword,
      lat: 40.7600,
      lng: -73.9700,
      balance: 1,
      rating: 4.5,
      totalHelps: 4,
      skills: {
        create: [
          { name: 'Fitness Training', kind: 'offer', level: 'advanced', yearsOfExp: 7, isVerified: true },
          { name: 'Yoga Instruction', kind: 'offer', level: 'intermediate', yearsOfExp: 5, isVerified: false },
          { name: 'Photography', kind: 'need', level: 'beginner', yearsOfExp: 0 },
        ],
      },
    },
  });

  // Create Grace (Photographer, 4 balance)
  const grace = await prisma.user.create({
    data: {
      name: 'Grace Lee',
      email: 'grace@skillswap.com',
      passwordHash: hashedPassword,
      lat: 40.7550,
      lng: -73.9800,
      balance: 4,
      rating: 4.8,
      totalHelps: 10,
      skills: {
        create: [
          { name: 'Photography', kind: 'offer', level: 'expert', yearsOfExp: 9, isVerified: true },
          { name: 'Photo Editing', kind: 'offer', level: 'advanced', yearsOfExp: 7, isVerified: false },
          { name: 'Graphic Design', kind: 'need', level: 'beginner', yearsOfExp: 0 },
        ],
      },
    },
  });

  // Create a pending trade: Alice requests Bob for home repair
  const trade1 = await prisma.trade.create({
    data: {
      providerId: bob.id,
      requesterId: alice.id,
      skill: 'Home Repair',
      hours: 1,
      status: 'pending',
    },
  });

  // Create a completed trade: Carol did gardening for David
  const trade2 = await prisma.trade.create({
    data: {
      providerId: carol.id,
      requesterId: david.id,
      skill: 'Gardening',
      hours: 1,
      status: 'completed',
      completedAt: new Date(Date.now() - 86400000), // 1 day ago
    },
  });

  // Create ledger entries for the completed trade
  await prisma.ledger.create({
    data: {
      userId: carol.id,
      change: 1,
      reason: 'Completed trade: Gardening',
      tradeId: trade2.id,
    },
  });

  await prisma.ledger.create({
    data: {
      userId: david.id,
      change: -1,
      reason: 'Received service: Gardening',
      tradeId: trade2.id,
    },
  });

  // Create more completed trades for realistic history
  const trade3 = await prisma.trade.create({
    data: {
      providerId: emma.id,
      requesterId: bob.id,
      skill: 'Cooking Classes',
      hours: 2,
      status: 'completed',
      completedAt: new Date(Date.now() - 172800000), // 2 days ago
    },
  });

  await prisma.ledger.create({
    data: {
      userId: emma.id,
      change: 2,
      reason: 'Completed trade: Cooking Classes',
      tradeId: trade3.id,
    },
  });

  await prisma.ledger.create({
    data: {
      userId: bob.id,
      change: -2,
      reason: 'Received service: Cooking Classes',
      tradeId: trade3.id,
    },
  });

  // Grace helped Frank with Photography
  const trade4 = await prisma.trade.create({
    data: {
      providerId: grace.id,
      requesterId: frank.id,
      skill: 'Photography',
      hours: 1,
      status: 'completed',
      completedAt: new Date(Date.now() - 259200000), // 3 days ago
    },
  });

  await prisma.ledger.create({
    data: {
      userId: grace.id,
      change: 1,
      reason: 'Completed trade: Photography',
      tradeId: trade4.id,
    },
  });

  await prisma.ledger.create({
    data: {
      userId: frank.id,
      change: -1,
      reason: 'Received service: Photography',
      tradeId: trade4.id,
    },
  });

  // Frank helped Emma with Fitness Training
  const trade5 = await prisma.trade.create({
    data: {
      providerId: frank.id,
      requesterId: emma.id,
      skill: 'Fitness Training',
      hours: 1,
      status: 'completed',
      completedAt: new Date(Date.now() - 345600000), // 4 days ago
    },
  });

  await prisma.ledger.create({
    data: {
      userId: frank.id,
      change: 1,
      reason: 'Completed trade: Fitness Training',
      tradeId: trade5.id,
    },
  });

  await prisma.ledger.create({
    data: {
      userId: emma.id,
      change: -1,
      reason: 'Received service: Fitness Training',
      tradeId: trade5.id,
    },
  });

  // David helped Alice with Music Lessons
  const trade6 = await prisma.trade.create({
    data: {
      providerId: david.id,
      requesterId: alice.id,
      skill: 'Music Lessons',
      hours: 1,
      status: 'completed',
      completedAt: new Date(Date.now() - 432000000), // 5 days ago
    },
  });

  await prisma.ledger.create({
    data: {
      userId: david.id,
      change: 1,
      reason: 'Completed trade: Music Lessons',
      tradeId: trade6.id,
    },
  });

  await prisma.ledger.create({
    data: {
      userId: alice.id,
      change: -1,
      reason: 'Received service: Music Lessons',
      tradeId: trade6.id,
    },
  });

  // Add some gift transfers
  await prisma.ledger.create({
    data: {
      userId: grace.id,
      change: -1,
      reason: 'Gift to Carol Davis: Welcome to the community!',
    },
  });

  await prisma.ledger.create({
    data: {
      userId: carol.id,
      change: 1,
      reason: 'Gift from Grace Lee: Welcome to the community!',
    },
  });

  // Another gift transfer
  await prisma.ledger.create({
    data: {
      userId: david.id,
      change: -1,
      reason: 'Gift to Emma Wilson: Thanks for the cookies!',
    },
  });

  await prisma.ledger.create({
    data: {
      userId: emma.id,
      change: 1,
      reason: 'Gift from David Kim: Thanks for the cookies!',
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('\nTest accounts (all use password: password123):');
  console.log('- alice@skillswap.com (Python Programming, Spanish Language)');
  console.log('- bob@skillswap.com (Home Repair, Carpentry)');
  console.log('- carol@skillswap.com (Gardening, Pet Care)');
  console.log('- david@skillswap.com (Music Lessons, Guitar Tutoring)');
  console.log('- emma@skillswap.com (Cooking Classes, Baking)');
  console.log('- frank@skillswap.com (Fitness Training, Yoga Instruction)');
  console.log('- grace@skillswap.com (Photography, Photo Editing)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
