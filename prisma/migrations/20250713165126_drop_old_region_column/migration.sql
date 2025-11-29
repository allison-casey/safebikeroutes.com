/*
  Warnings:

  - You are about to drop the column `region` on the `route` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `user_roles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "route" DROP COLUMN "region";

-- AlterTable
ALTER TABLE "user_roles" DROP COLUMN "region";

-- DropEnum
DROP TYPE "Region";
