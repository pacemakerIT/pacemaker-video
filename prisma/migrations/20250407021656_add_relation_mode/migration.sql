-- DropForeignKey
ALTER TABLE "PurchasedDocument" DROP CONSTRAINT "PurchasedDocument_documentId_fkey";

-- DropForeignKey
ALTER TABLE "PurchasedDocument" DROP CONSTRAINT "PurchasedDocument_userId_fkey";

-- DropForeignKey
ALTER TABLE "PurchasedVideo" DROP CONSTRAINT "PurchasedVideo_userId_fkey";

-- DropForeignKey
ALTER TABLE "PurchasedVideo" DROP CONSTRAINT "PurchasedVideo_videoId_fkey";

-- DropForeignKey
ALTER TABLE "WatchedVideo" DROP CONSTRAINT "WatchedVideo_userId_fkey";

-- DropForeignKey
ALTER TABLE "WatchedVideo" DROP CONSTRAINT "WatchedVideo_videoId_fkey";
