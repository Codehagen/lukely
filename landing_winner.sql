-- CreateTable
CREATE TABLE "landing_winner" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "prizeName" TEXT,
    "prizeValue" DOUBLE PRECISION,
    "description" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "landing_winner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "landing_winner_calendarId_idx" ON "landing_winner"("calendarId");

-- CreateIndex
CREATE INDEX "landing_winner_leadId_idx" ON "landing_winner"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "landing_winner_calendarId_key" ON "landing_winner"("calendarId");

-- AddForeignKey
ALTER TABLE "landing_winner" ADD CONSTRAINT "landing_winner_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "calendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_winner" ADD CONSTRAINT "landing_winner_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

