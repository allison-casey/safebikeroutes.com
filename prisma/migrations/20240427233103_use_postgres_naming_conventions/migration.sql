/*
  Warnings:

  - You are about to drop the `Route` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Route";

-- CreateTable
CREATE TABLE "route" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "region" "Region" NOT NULL,
    "route_type" "RouteType" NOT NULL,
    "geometry" geography(Linestring, 4326) NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("id")
);
