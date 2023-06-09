-- AlterTable
ALTER TABLE "Sprint" ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "completeDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SprintTask" (
    "id" SERIAL NOT NULL,
    "sprintId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "SprintTask_pkey" PRIMARY KEY ("id")
);
