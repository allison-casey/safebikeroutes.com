-- CreateTable
CREATE TABLE "pin" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" geometry(Point) NOT NULL,
    "region_id" TEXT NOT NULL,

    CONSTRAINT "pin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pin" ADD CONSTRAINT "pin_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region_config"("region") ON DELETE CASCADE ON UPDATE CASCADE;
