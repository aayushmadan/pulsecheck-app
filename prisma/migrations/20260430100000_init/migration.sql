-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "Monitor" (
  "id" SERIAL NOT NULL,
  "url" TEXT NOT NULL,
  "interval" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Check" (
  "id" SERIAL NOT NULL,
  "monitorId" INTEGER NOT NULL,
  "status" "CheckStatus" NOT NULL,
  "statusCode" INTEGER,
  "responseTime" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Monitor_isActive_idx" ON "Monitor"("isActive");

-- CreateIndex
CREATE INDEX "Monitor_createdAt_idx" ON "Monitor"("createdAt");

-- CreateIndex
CREATE INDEX "Check_monitorId_createdAt_idx" ON "Check"("monitorId", "createdAt");

-- CreateIndex
CREATE INDEX "Check_status_idx" ON "Check"("status");

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
