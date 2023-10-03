-- CreateTable
CREATE TABLE "TaskIntegration" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "integratedTaskId" INTEGER NOT NULL,

    CONSTRAINT "TaskIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskIntegration_type_integratedTaskId_key" ON "TaskIntegration"("type", "integratedTaskId");

-- AddForeignKey
ALTER TABLE "TaskIntegration" ADD CONSTRAINT "TaskIntegration_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
