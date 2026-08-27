-- AlterTable
ALTER TABLE "ClassDefinition" ADD COLUMN "teacherId" TEXT;

-- AddForeignKey
ALTER TABLE "ClassDefinition" ADD CONSTRAINT "ClassDefinition_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
