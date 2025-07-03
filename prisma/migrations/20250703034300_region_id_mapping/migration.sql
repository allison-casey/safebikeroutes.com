/*
  Warnings:

  - You are about to drop the column `regionId` on the `user_roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "regionId",
ADD COLUMN     "region_id" TEXT;
