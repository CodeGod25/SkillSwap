-- CreateTable
CREATE TABLE IF NOT EXISTS \"Message\" (
    \"id\" SERIAL NOT NULL,
    \"senderId\" INTEGER NOT NULL,
    \"receiverId\" INTEGER NOT NULL,
    \"content\" TEXT NOT NULL,
    \"isRead\" BOOLEAN NOT NULL DEFAULT false,
    \"tradeId\" INTEGER,
    \"createdAt\" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT \"Message_pkey\" PRIMARY KEY (\"id\")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS \"Message_senderId_idx\" ON \"Message\"(\"senderId\");
CREATE INDEX IF NOT EXISTS \"Message_receiverId_idx\" ON \"Message\"(\"receiverId\");
CREATE INDEX IF NOT EXISTS \"Message_isRead_idx\" ON \"Message\"(\"isRead\");
CREATE INDEX IF NOT EXISTS \"Message_createdAt_idx\" ON \"Message\"(\"createdAt\");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Message_senderId_fkey'
    ) THEN
        ALTER TABLE \"Message\" ADD CONSTRAINT \"Message_senderId_fkey\" FOREIGN KEY (\"senderId\") REFERENCES \"User\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Message_receiverId_fkey'
    ) THEN
        ALTER TABLE \"Message\" ADD CONSTRAINT \"Message_receiverId_fkey\" FOREIGN KEY (\"receiverId\") REFERENCES \"User\"(\"id\") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
