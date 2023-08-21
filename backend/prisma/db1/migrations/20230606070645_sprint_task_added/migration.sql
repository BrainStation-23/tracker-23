/*
  Warnings:

  - You are about to drop the column `sprintId` on the `Sprint` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sprintId,taskId,userId]` on the table `SprintTask` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jiraSprintId` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Sprint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sprint" DROP COLUMN "sprintId",
ADD COLUMN     "jiraSprintId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SprintTask_sprintId_taskId_userId_key" ON "SprintTask"("sprintId", "taskId", "userId");

-- AddForeignKey
ALTER TABLE "SprintTask" ADD CONSTRAINT "SprintTask_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
