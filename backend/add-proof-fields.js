require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addProofFields() {
  try {
    console.log('🔧 Adding proof and verification fields to Skill table...');
    
    // Run raw SQL to add columns (PostgreSQL)
    await prisma.$executeRaw`
      ALTER TABLE "Skill" 
      ADD COLUMN IF NOT EXISTS "proofUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "proofType" TEXT,
      ADD COLUMN IF NOT EXISTS "proofDescription" TEXT,
      ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'unverified',
      ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;
    `;
    
    console.log('✅ Added proof fields to Skill table');
    
    // Update existing skills to have verificationStatus
    await prisma.$executeRaw`
      UPDATE "Skill" 
      SET "verificationStatus" = CASE 
        WHEN "isVerified" = true THEN 'verified'
        ELSE 'unverified'
      END
      WHERE "verificationStatus" IS NULL OR "verificationStatus" = '';
    `;
    
    console.log('✅ Updated existing skills with verification status');
    
    // Create index on verificationStatus
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Skill_verificationStatus_idx" 
      ON "Skill"("verificationStatus");
    `;
    
    console.log('✅ Created index on verificationStatus');
    
    console.log('🎉 Proof system fields successfully added to database!');
  } catch (error) {
    console.error('❌ Error adding proof fields:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addProofFields()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
