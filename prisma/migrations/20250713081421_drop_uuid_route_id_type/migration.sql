/*
  Warnings:

  - The primary key for the `route` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "route" DROP CONSTRAINT "route_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "route_pkey" PRIMARY KEY ("id");
