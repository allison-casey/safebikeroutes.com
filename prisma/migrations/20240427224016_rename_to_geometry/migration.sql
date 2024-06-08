/*
  Warnings:

  - You are about to drop the column `route` on the `Route` table. All the data in the column will be lost.
  - Added the required column `geometry` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "route",
ADD COLUMN     "geometry" geography(Linestring, 4326) NOT NULL;
