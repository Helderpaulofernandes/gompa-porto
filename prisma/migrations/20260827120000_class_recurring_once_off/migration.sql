-- Add recurring/once-off + public-calendar visibility support to ClassDefinition
ALTER TABLE "ClassDefinition" ADD COLUMN "recurring" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ClassDefinition" ADD COLUMN "endDate" TIMESTAMP(3);
ALTER TABLE "ClassDefinition" ADD COLUMN "publicCalendar" BOOLEAN NOT NULL DEFAULT true;

-- ClassSlotDef: allow either a weekly weekday or a specific once-off date
ALTER TABLE "ClassSlotDef" ALTER COLUMN "weekday" DROP NOT NULL;
ALTER TABLE "ClassSlotDef" ADD COLUMN "specificDate" TIMESTAMP(3);
