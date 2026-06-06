-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "document_status" AS ENUM ('PROCESSING', 'VERIFIED', 'REJECTED', 'INCONCLUSIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "action_type" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "actor_type" AS ENUM ('SYSTEM', 'ADMIN', 'SELLER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verification_id" TEXT,
    "job_id" TEXT,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "status" "document_status" NOT NULL DEFAULT 'PROCESSING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "actionType" "action_type" NOT NULL,
    "actor_id" TEXT,
    "actorType" "actor_type" NOT NULL,
    "prev_status" TEXT,
    "next_status" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_verification_id_idx" ON "documents"("verification_id");

-- CreateIndex
CREATE INDEX "documents_user_id_status_idx" ON "documents"("user_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_document_id_idx" ON "audit_logs"("document_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
