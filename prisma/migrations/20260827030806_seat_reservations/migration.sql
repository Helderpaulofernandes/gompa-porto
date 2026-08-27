-- CreateTable
CREATE TABLE "SeatReservation" (
    "id" TEXT NOT NULL,
    "classSlug" TEXT NOT NULL,
    "classDate" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "paymentType" TEXT NOT NULL,
    "planSlug" TEXT,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeatReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeatReservation_stripeSessionId_key" ON "SeatReservation"("stripeSessionId");

-- CreateIndex
CREATE INDEX "SeatReservation_classSlug_classDate_idx" ON "SeatReservation"("classSlug", "classDate");
