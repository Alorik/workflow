/*
  Warnings:

  - You are about to drop the `_UserMemberProjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_UserMemberProjects" DROP CONSTRAINT "_UserMemberProjects_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_UserMemberProjects" DROP CONSTRAINT "_UserMemberProjects_B_fkey";

-- DropTable
DROP TABLE "public"."_UserMemberProjects";
