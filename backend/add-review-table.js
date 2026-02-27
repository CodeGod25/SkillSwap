const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Creating Review table...');
    
    // Create table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Review" (
        "id" SERIAL NOT NULL,
        "reviewerId" INTEGER NOT NULL,
        "revieweeId" INTEGER NOT NULL,
        "tradeId" INTEGER NOT NULL,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Review table created');

    // Create unique constraint
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'Review_tradeId_reviewerId_key'
        ) THEN
          ALTER TABLE "Review" ADD CONSTRAINT "Review_tradeId_reviewerId_key" 
          UNIQUE ("tradeId", "reviewerId");
        END IF;
      END $$;
    `);
    console.log('✅ Unique constraint created');

    // Create indexes
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Review_reviewerId_idx" ON "Review"("reviewerId")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Review_revieweeId_idx" ON "Review"("revieweeId")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Review_rating_idx" ON "Review"("rating")');
    console.log('✅ Indexes created');

    // Add foreign keys
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Review_reviewerId_fkey'
          ) THEN
            ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" 
            FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Review_revieweeId_fkey'
          ) THEN
            ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" 
            FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Review_tradeId_fkey'
          ) THEN
            ALTER TABLE "Review" ADD CONSTRAINT "Review_tradeId_fkey" 
            FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      console.log('✅ Foreign keys created');
    } catch (e) {
      console.log('⚠️  Foreign key creation skipped (may already exist)');
    }

    console.log('\n🎉 Review table successfully added to database!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
