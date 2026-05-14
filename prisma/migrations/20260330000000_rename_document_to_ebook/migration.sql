-- Step 1: Deduplicate Favorite where both DOCUMENT and EBOOK exist for same user+itemId
DELETE FROM "Favorite" a
USING "Favorite" b
WHERE a."itemType"::text = 'DOCUMENT'
  AND b."itemType"::text = 'EBOOK'
  AND a."userId" = b."userId"
  AND a."itemId" = b."itemId";

-- Step 2: Deduplicate Cart
DELETE FROM "Cart" a
USING "Cart" b
WHERE a."itemType"::text = 'DOCUMENT'
  AND b."itemType"::text = 'EBOOK'
  AND a."userId" = b."userId"
  AND a."itemId" = b."itemId";

-- Step 3: Update DOCUMENT → EBOOK in all tables
UPDATE "Favorite" SET "itemType" = 'EBOOK'::"ItemType" WHERE "itemType" = 'DOCUMENT'::"ItemType";
UPDATE "Cart" SET "itemType" = 'EBOOK'::"ItemType" WHERE "itemType" = 'DOCUMENT'::"ItemType";
UPDATE "OrderItem" SET "itemType" = 'EBOOK'::"ItemType" WHERE "itemType" = 'DOCUMENT'::"ItemType";

-- Step 4: Rename table and column
ALTER TABLE "Document" RENAME TO "Ebook";
ALTER TABLE "Ebook" RENAME COLUMN "documentId" TO "ebookId";

-- Step 5: Rename DocumentCategory enum to EbookCategory
ALTER TYPE "DocumentCategory" RENAME TO "EbookCategory";

-- Step 6: Remove DOCUMENT from ItemType enum
ALTER TYPE "ItemType" RENAME TO "ItemType_old";
CREATE TYPE "ItemType" AS ENUM ('VIDEO', 'WORKSHOP', 'COURSE', 'EBOOK');
ALTER TABLE "Favorite" ALTER COLUMN "itemType" TYPE "ItemType" USING "itemType"::text::"ItemType";
ALTER TABLE "Cart" ALTER COLUMN "itemType" TYPE "ItemType" USING "itemType"::text::"ItemType";
ALTER TABLE "OrderItem" ALTER COLUMN "itemType" TYPE "ItemType" USING "itemType"::text::"ItemType";
DROP TYPE "ItemType_old";
