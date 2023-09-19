-- CreateTable
CREATE TABLE "AirQuality" (
    "id" SERIAL NOT NULL,
    "ts" TIMESTAMP(6) NOT NULL,
    "aqius" INTEGER NOT NULL,
    "mainus" TEXT NOT NULL,
    "aqicn" INTEGER NOT NULL,
    "maincn" TEXT NOT NULL,

    CONSTRAINT "AirQuality_pkey" PRIMARY KEY ("id")
);
