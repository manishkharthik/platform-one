-- CreateEnum
CREATE TYPE "EventFrequency" AS ENUM ('AD_HOC', 'ONCE_A_WEEK', 'TWICE_A_WEEK', 'THREE_PLUS_A_WEEK');

-- CreateEnum
CREATE TYPE "EngagementFrequency" AS ENUM ('AD_HOC', 'ONCE_A_WEEK', 'TWICE_A_WEEK', 'THREE_PLUS_A_WEEK');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "frequency" "EventFrequency";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "engagementFrequency" "EngagementFrequency";
