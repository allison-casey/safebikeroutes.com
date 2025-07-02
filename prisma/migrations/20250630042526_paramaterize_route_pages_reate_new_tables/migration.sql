-- AlterTable
ALTER TABLE "route" ADD COLUMN     "region_id" TEXT;

-- CreateTable
CREATE TABLE "region_config" (
    "region" TEXT NOT NULL,
    "url_segment" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "center" geometry(Point) NOT NULL,
    "bbox" box2d NOT NULL,
    "zoom" INTEGER NOT NULL,

    CONSTRAINT "region_config_pkey" PRIMARY KEY ("region")
);
