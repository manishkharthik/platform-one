/*
  Warnings:

  - You are about to drop the column `frequency` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `engagementFrequency` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "frequency",
ADD COLUMN     "participantCapacity" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "volunteerCapacity" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "engagementFrequency";

-- DropEnum
DROP TYPE "EngagementFrequency";

-- DropEnum
DROP TYPE "EventFrequency";
