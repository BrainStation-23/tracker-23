-- CreateTable
CREATE TABLE "ProjectStatus" (
    "projectId" TEXT NOT NULL,
    "integrationID" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "StatusDetail" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "untranslatedName" TEXT NOT NULL,
    "statusCategoryId" TEXT NOT NULL,
    "statusCategoryName" TEXT NOT NULL,
    "projectId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStatus_projectId_key" ON "ProjectStatus"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "StatusDetail_id_key" ON "StatusDetail"("id");

-- AddForeignKey
ALTER TABLE "ProjectStatus" ADD CONSTRAINT "ProjectStatus_integrationID_fkey" FOREIGN KEY ("integrationID") REFERENCES "Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusDetail" ADD CONSTRAINT "StatusDetail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ProjectStatus"("projectId") ON DELETE RESTRICT ON UPDATE CASCADE;
