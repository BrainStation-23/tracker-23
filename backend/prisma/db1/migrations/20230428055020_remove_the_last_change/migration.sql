-- DropForeignKey
ALTER TABLE "Integration" DROP CONSTRAINT "Integration_userId_fkey";

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
