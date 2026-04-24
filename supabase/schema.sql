


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "app_auth";


ALTER SCHEMA "app_auth" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."CourseCategory" AS ENUM (
    'INTERVIEW',
    'RESUME',
    'NETWORKING'
);


ALTER TYPE "public"."CourseCategory" OWNER TO "postgres";


CREATE TYPE "public"."DocumentCategory" AS ENUM (
    'MARKETING',
    'IT',
    'DESIGN',
    'PUBLIC',
    'ACCOUNTING',
    'SERVICE'
);


ALTER TYPE "public"."DocumentCategory" OWNER TO "postgres";


CREATE TYPE "public"."Interest" AS ENUM (
    'INTERVIEW',
    'RESUME',
    'NETWORKING',
    'MARKETING',
    'IT',
    'DESIGN',
    'PUBLIC',
    'ACCOUNTING',
    'SERVICE'
);


ALTER TYPE "public"."Interest" OWNER TO "postgres";


CREATE TYPE "public"."ItemType" AS ENUM (
    'VIDEO',
    'DOCUMENT',
    'WORKSHOP',
    'COURSE',
    'EBOOK'
);


ALTER TYPE "public"."ItemType" OWNER TO "postgres";


CREATE TYPE "public"."OrderStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE "public"."OrderStatus" OWNER TO "postgres";


CREATE TYPE "public"."TargetAudienceType" AS ENUM (
    'IT',
    'GOVERNMENT',
    'FINANCE',
    'DESIGN',
    'RESUME',
    'INTERVIEW',
    'NETWORKING',
    'SERVICE'
);


ALTER TYPE "public"."TargetAudienceType" OWNER TO "postgres";


CREATE TYPE "public"."VideoCategory" AS ENUM (
    'INTERVIEW',
    'RESUME',
    'NETWORKING'
);


ALTER TYPE "public"."VideoCategory" OWNER TO "postgres";


CREATE TYPE "public"."WorkshopCategory" AS ENUM (
    'INTERVIEW',
    'RESUME',
    'NETWORKING'
);


ALTER TYPE "public"."WorkshopCategory" OWNER TO "postgres";


CREATE TYPE "public"."WorkshopStatus" AS ENUM (
    'RECRUITING',
    'CLOSED',
    'COMPLETED',
    'HIDDEN'
);


ALTER TYPE "public"."WorkshopStatus" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "app_auth"."clerk_session_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN (current_setting('request.headers', true)::json->>'x-clerk-session')::uuid;
END;
$$;


ALTER FUNCTION "app_auth"."clerk_session_id"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."Cart" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "itemId" "text" NOT NULL,
    "itemType" "public"."ItemType" NOT NULL
);


ALTER TABLE "public"."Cart" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Course" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "description" "text",
    "price" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "category" "public"."CourseCategory",
    "targetAudienceTypes" "public"."TargetAudienceType"[],
    "isPublic" boolean DEFAULT false NOT NULL,
    "processContent" "text",
    "processTitle" "text",
    "showOnMain" boolean DEFAULT false NOT NULL,
    "thumbnailUrl" "text",
    "time" "text",
    "videoLink" "text",
    "visualTitle" "text",
    "visualTitle2" "text",
    "recommendedLinks" "jsonb"
);


ALTER TABLE "public"."Course" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Document" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "documentId" "text" NOT NULL,
    "title" "text",
    "description" "text",
    "uploadDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "price" double precision,
    "bucketUrl" "text" NOT NULL,
    "category" "public"."DocumentCategory",
    "isMain" boolean DEFAULT false NOT NULL,
    "isPublic" boolean DEFAULT false NOT NULL,
    "subDescription" "text",
    "subTitle" "text",
    "tableOfContents" "jsonb",
    "thumbnail" "text",
    "visualTitle1" "text",
    "visualTitle2" "text",
    "recommendedLinks" "jsonb",
    "targetAudienceTypes" "public"."TargetAudienceType"[] DEFAULT ARRAY[]::"public"."TargetAudienceType"[]
);


ALTER TABLE "public"."Document" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Favorite" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "itemId" "text" NOT NULL,
    "itemType" "public"."ItemType" NOT NULL
);


ALTER TABLE "public"."Favorite" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Image" (
    "id" "text" NOT NULL,
    "fileName" "text" NOT NULL,
    "url" "text" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."Image" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Instructor" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "profileImage" "text",
    "description" "text",
    "careers" "jsonb"
);


ALTER TABLE "public"."Instructor" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."MainVisual" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "isPublic" boolean DEFAULT false NOT NULL,
    "startDate" timestamp(3) without time zone,
    "endDate" timestamp(3) without time zone,
    "startTime" "text",
    "endTime" "text",
    "thumbnail" "text",
    "link" "text",
    "linkName" "text",
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."MainVisual" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Order" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid",
    "totalAmount" double precision NOT NULL,
    "status" "public"."OrderStatus" DEFAULT 'PENDING'::"public"."OrderStatus" NOT NULL,
    "stripePaymentIntentId" "text",
    "stripeInvoiceId" "text",
    "stripeInvoiceUrl" "text",
    "orderedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."Order" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."OrderItem" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "orderId" "uuid" NOT NULL,
    "priceAtPurchase" double precision NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "itemId" "text" NOT NULL,
    "itemType" "public"."ItemType" NOT NULL
);


ALTER TABLE "public"."OrderItem" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Review" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid" NOT NULL,
    "courseId" "uuid" NOT NULL,
    "rating" double precision NOT NULL,
    "content" "text" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."Review" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Section" (
    "courseId" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "orderIndex" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."Section" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "image" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isSubscribed" boolean DEFAULT false NOT NULL,
    "subscriptionEndDate" timestamp(3) without time zone,
    "lastLoginAt" timestamp(3) without time zone,
    "clerkId" "text" NOT NULL,
    "roleId" "text" DEFAULT 'USER'::"text" NOT NULL,
    "interest" "public"."Interest"[],
    "nickname" "text"
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."UserRole" (
    "id" "text" NOT NULL,
    "label" "text" NOT NULL
);


ALTER TABLE "public"."UserRole" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Video" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "videoId" "text" NOT NULL,
    "title" "text",
    "description" "text",
    "uploadDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "price" double precision,
    "category" "public"."VideoCategory",
    "thumbnail" "text",
    "courseId" "uuid" NOT NULL,
    "sectionId" "uuid"
);


ALTER TABLE "public"."Video" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."WatchedVideo" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid" NOT NULL,
    "watchedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "progress" double precision NOT NULL,
    "videoId" "uuid" NOT NULL
);


ALTER TABLE "public"."WatchedVideo" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Workshop" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "price" double precision,
    "locationOrUrl" "text",
    "status" "public"."WorkshopStatus" DEFAULT 'RECRUITING'::"public"."WorkshopStatus" NOT NULL,
    "instructorId" "uuid" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "thumbnail" "text",
    "category" "public"."WorkshopCategory"
);


ALTER TABLE "public"."Workshop" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."WorkshopRegistration" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "userId" "uuid" NOT NULL,
    "workshopId" "uuid" NOT NULL,
    "registeredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "attended" boolean DEFAULT false NOT NULL,
    "orderId" "uuid"
);


ALTER TABLE "public"."WorkshopRegistration" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."_CourseToInstructor" (
    "A" "uuid" NOT NULL,
    "B" "uuid" NOT NULL
);


ALTER TABLE "public"."_CourseToInstructor" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";


ALTER TABLE ONLY "public"."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Course"
    ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Document"
    ADD CONSTRAINT "Document_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Favorite"
    ADD CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Image"
    ADD CONSTRAINT "Image_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Instructor"
    ADD CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."MainVisual"
    ADD CONSTRAINT "MainVisual_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Section"
    ADD CONSTRAINT "Section_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Video"
    ADD CONSTRAINT "Video_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."WatchedVideo"
    ADD CONSTRAINT "WatchedVideo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."WorkshopRegistration"
    ADD CONSTRAINT "WorkshopRegistration_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Workshop"
    ADD CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_CourseToInstructor"
    ADD CONSTRAINT "_CourseToInstructor_AB_pkey" PRIMARY KEY ("A", "B");



ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "Cart_userId_itemType_itemId_key" ON "public"."Cart" USING "btree" ("userId", "itemType", "itemId");



CREATE UNIQUE INDEX "Document_documentId_key" ON "public"."Document" USING "btree" ("documentId");



CREATE UNIQUE INDEX "Favorite_userId_itemType_itemId_key" ON "public"."Favorite" USING "btree" ("userId", "itemType", "itemId");



CREATE UNIQUE INDEX "Order_stripeInvoiceId_key" ON "public"."Order" USING "btree" ("stripeInvoiceId");



CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "public"."Order" USING "btree" ("stripePaymentIntentId");



CREATE INDEX "Review_courseId_idx" ON "public"."Review" USING "btree" ("courseId");



CREATE INDEX "Review_userId_idx" ON "public"."Review" USING "btree" ("userId");



CREATE INDEX "Section_courseId_idx" ON "public"."Section" USING "btree" ("courseId");



CREATE UNIQUE INDEX "User_clerkId_key" ON "public"."User" USING "btree" ("clerkId");



CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING "btree" ("email");



CREATE UNIQUE INDEX "Video_videoId_key" ON "public"."Video" USING "btree" ("videoId");



CREATE UNIQUE INDEX "WatchedVideo_userId_videoId_key" ON "public"."WatchedVideo" USING "btree" ("userId", "videoId");



CREATE UNIQUE INDEX "WorkshopRegistration_userId_workshopId_key" ON "public"."WorkshopRegistration" USING "btree" ("userId", "workshopId");



CREATE INDEX "_CourseToInstructor_B_index" ON "public"."_CourseToInstructor" USING "btree" ("B");





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;





























































































































































































































































































































































