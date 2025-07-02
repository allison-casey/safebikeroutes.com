/*
  Warnings:

  - Made the column `region_id` on table `route` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "route" ALTER COLUMN "region_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region_config"("region") ON DELETE CASCADE ON UPDATE CASCADE;
