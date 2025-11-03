-- CreateTable
CREATE TABLE IF NOT EXISTS "Wallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "tipsReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tipsGiven" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "projectLink" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "hasPrizePool" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PrizePool" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "winnersCount" INTEGER NOT NULL,
    "distribution" JSONB NOT NULL,
    "escrowPda" TEXT,
    "escrowTx" TEXT,
    "escrowBump" INTEGER,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "distributed" BOOLEAN NOT NULL DEFAULT false,
    "distributeTx" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrizePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Ranking" (
    "id" TEXT NOT NULL,
    "prizePoolId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "prizeAmount" DOUBLE PRECISION NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimTx" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Tip" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "fromWallet" TEXT NOT NULL,
    "toWallet" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "txSignature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Wallet_address_key" ON "Wallet"("address");
CREATE INDEX IF NOT EXISTS "Wallet_address_idx" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Post_walletId_idx" ON "Post"("walletId");
CREATE INDEX IF NOT EXISTS "Post_category_idx" ON "Post"("category");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PrizePool_postId_key" ON "PrizePool"("postId");
CREATE INDEX IF NOT EXISTS "PrizePool_endsAt_idx" ON "PrizePool"("endsAt");
CREATE INDEX IF NOT EXISTS "PrizePool_postId_idx" ON "PrizePool"("postId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX IF NOT EXISTS "Comment_walletId_idx" ON "Comment"("walletId");
CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Ranking_commentId_key" ON "Ranking"("commentId");
CREATE INDEX IF NOT EXISTS "Ranking_prizePoolId_idx" ON "Ranking"("prizePoolId");
CREATE UNIQUE INDEX IF NOT EXISTS "Ranking_prizePoolId_rank_key" ON "Ranking"("prizePoolId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Tip_txSignature_key" ON "Tip"("txSignature");
CREATE INDEX IF NOT EXISTS "Tip_fromWallet_idx" ON "Tip"("fromWallet");
CREATE INDEX IF NOT EXISTS "Tip_toWallet_idx" ON "Tip"("toWallet");
CREATE INDEX IF NOT EXISTS "Tip_createdAt_idx" ON "Tip"("createdAt");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Post_walletId_fkey') THEN
        ALTER TABLE "Post" ADD CONSTRAINT "Post_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PrizePool_postId_fkey') THEN
        ALTER TABLE "PrizePool" ADD CONSTRAINT "PrizePool_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PrizePool_walletId_fkey') THEN
        ALTER TABLE "PrizePool" ADD CONSTRAINT "PrizePool_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Comment_postId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Comment_walletId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Comment_parentId_fkey') THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ranking_prizePoolId_fkey') THEN
        ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_prizePoolId_fkey" FOREIGN KEY ("prizePoolId") REFERENCES "PrizePool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ranking_commentId_fkey') THEN
        ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Ranking_walletId_fkey') THEN
        ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Tip_commentId_fkey') THEN
        ALTER TABLE "Tip" ADD CONSTRAINT "Tip_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
