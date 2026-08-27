-- Services (marketing metadata + therapy transactional pricing) become admin-editable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "duration" TEXT,
    "priceLabel" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo" TEXT,
    "bookable" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priceCents" INTEGER,
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
