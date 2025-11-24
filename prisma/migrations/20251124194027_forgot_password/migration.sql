/*
  Warnings:

  - You are about to drop the column `resetokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetokenExpiry",
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
