/*
  Warnings:

  - Made the column `region_id` on table `user_roles` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_roles" ALTER COLUMN "region" DROP NOT NULL,
ALTER COLUMN "region_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region_config"("region") ON DELETE CASCADE ON UPDATE CASCADE;
