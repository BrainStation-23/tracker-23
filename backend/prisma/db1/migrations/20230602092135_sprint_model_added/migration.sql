-- CreateTable
CREATE TABLE "Sprint" (
    "id" SERIAL NOT NULL,
    "sprintId" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "completeDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);
