-- CreateTable
CREATE TABLE "Scripts" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Scripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Scripts_key_key" ON "Scripts"("key");
