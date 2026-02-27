const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Creating Message table...');
    
    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Message" (
        "id" SERIAL NOT NULL,
        "senderId" INTEGER NOT NULL,
        "receiverId" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "tradeId" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Message table created');

    // Create indexes
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Message_receiverId_idx" ON "Message"("receiverId")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Message_isRead_idx" ON "Message"("isRead")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt")');
    console.log('✅ Indexes created');

    // Add foreign keys (PostgreSQL 12+ syntax)
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Message_senderId_fkey'
          ) THEN
            ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" 
            FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Message_receiverId_fkey'
          ) THEN
            ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" 
            FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      console.log('✅ Foreign keys created');
    } catch (e) {
      console.log('⚠️  Foreign key creation skipped (may already exist)');
    }

    console.log('\n🎉 Message table successfully added to database!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
