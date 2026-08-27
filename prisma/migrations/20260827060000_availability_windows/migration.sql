-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "services" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ClassDefinition" ADD COLUMN "roomId" TEXT;

-- CreateTable
CREATE TABLE "AvailabilityWindow" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TherapySettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "breakMinutes" INTEGER NOT NULL DEFAULT 15,
    "lunchStart" TEXT,
    "lunchEnd" TEXT,

    CONSTRAINT "TherapySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AvailabilityWindow_teacherId_weekday_idx" ON "AvailabilityWindow"("teacherId", "weekday");

-- CreateIndex
CREATE INDEX "TherapySlot_teacherId_date_idx" ON "TherapySlot"("teacherId", "date");

-- CreateIndex
CREATE INDEX "TherapySlot_roomId_date_idx" ON "TherapySlot"("roomId", "date");

-- AddForeignKey
ALTER TABLE "ClassDefinition" ADD CONSTRAINT "ClassDefinition_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityWindow" ADD CONSTRAINT "AvailabilityWindow_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityWindow" ADD CONSTRAINT "AvailabilityWindow_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
