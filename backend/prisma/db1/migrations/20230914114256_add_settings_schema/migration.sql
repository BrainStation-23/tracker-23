-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "syncTime" INTEGER NOT NULL,
    "userWorkspaceId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userWorkspaceId_key" ON "Settings"("userWorkspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_id_userWorkspaceId_key" ON "Settings"("id", "userWorkspaceId");

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userWorkspaceId_fkey" FOREIGN KEY ("userWorkspaceId") REFERENCES "UserWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
