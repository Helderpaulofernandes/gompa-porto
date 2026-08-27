-- DropTable
DROP TABLE "ClassConfig";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ClassDefinition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "dropInPriceCents" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSlotDef" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "time" TEXT NOT NULL,

    CONSTRAINT "ClassSlotDef_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassDefinition_slug_key" ON "ClassDefinition"("slug");

-- AddForeignKey
ALTER TABLE "ClassSlotDef" ADD CONSTRAINT "ClassSlotDef_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
