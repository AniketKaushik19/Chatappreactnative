/*
  Warnings:

  - You are about to drop the column `pushToken` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "pushToken";

-- CreateTable
CREATE TABLE "pushToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pushToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pushToken_token_key" ON "pushToken"("token");

-- CreateIndex
CREATE INDEX "pushToken_userId_idx" ON "pushToken"("userId");

-- AddForeignKey
ALTER TABLE "pushToken" ADD CONSTRAINT "pushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
