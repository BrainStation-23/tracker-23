-- CreateIndex
CREATE INDEX "TaskIntegration_integratedTaskId_userId_type_idx" ON "TaskIntegration"("integratedTaskId", "userId", "type");
