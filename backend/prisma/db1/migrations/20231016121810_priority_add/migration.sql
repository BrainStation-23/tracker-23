-- CreateTable
CREATE TABLE "PriorityScheme" (
    "id" SERIAL NOT NULL,
    "priorityId" INTEGER,
    "name" TEXT NOT NULL,
    "priorityCategoryName" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "PriorityScheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PriorityScheme_name_projectId_key" ON "PriorityScheme"("name", "projectId");

-- AddForeignKey
ALTER TABLE "PriorityScheme" ADD CONSTRAINT "PriorityScheme_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
