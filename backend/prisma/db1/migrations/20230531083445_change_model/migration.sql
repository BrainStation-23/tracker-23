/*
  Warnings:

  - The `id` column on the `StatusDetail` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `projectId` on the `Task` table. All the data in the column will be lost.
  - Added the required column `statusId` to the `StatusDetail` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `projectId` on the `StatusDetail` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "StatusDetail" DROP CONSTRAINT "StatusDetail_projectId_fkey";

-- DropIndex
DROP INDEX "Projects_projectId_key";

-- DropIndex
DROP INDEX "StatusDetail_id_key";

-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Projects_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "StatusDetail" ADD COLUMN     "statusId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD CONSTRAINT "StatusDetail_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "projectId",
ADD COLUMN     "projectsId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "StatusDetail_name_projectId_key" ON "StatusDetail"("name", "projectId");

-- AddForeignKey
ALTER TABLE "StatusDetail" ADD CONSTRAINT "StatusDetail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectsId_fkey" FOREIGN KEY ("projectsId") REFERENCES "Projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
