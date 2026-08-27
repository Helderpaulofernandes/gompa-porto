-- CreateTable
CREATE TABLE "ClassConfig" (
    "slug" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassConfig_pkey" PRIMARY KEY ("slug")
);
