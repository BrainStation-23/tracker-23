-- CreateTable
CREATE TABLE "ApiRequestLimitLog" (
    "id" SERIAL NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "lastRequestTimestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiRequestLimitLog_pkey" PRIMARY KEY ("id")
);
