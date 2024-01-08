-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('TIME_SHEET', 'SPRINT_ESTIMATION', 'TASK_LIST', 'SPRINT_REPORT');

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "userWorkspaceId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "config" JSONB[],
    "reportType" "ReportType" NOT NULL,
    "pageId" INTEGER,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Page_workspaceId_key" ON "Page"("workspaceId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_userWorkspaceId_fkey" FOREIGN KEY ("userWorkspaceId") REFERENCES "UserWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
