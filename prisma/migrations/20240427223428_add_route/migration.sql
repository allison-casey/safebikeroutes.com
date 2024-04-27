-- CreateEnum
CREATE TYPE "Region" AS ENUM ('LA');

-- CreateEnum
CREATE TYPE "RouteType" AS ENUM ('SIDEWALK', 'STREET', 'LANE', 'PROTECTED', 'TRACK');

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "region" "Region" NOT NULL,
    "route_type" "RouteType" NOT NULL,
    "route" geography(Linestring, 4326) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);
