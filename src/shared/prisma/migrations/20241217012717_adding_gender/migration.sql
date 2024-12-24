-- CreateEnum
CREATE TYPE "gender" AS ENUM ('Male', 'Female', 'NonBinary', 'Other', 'PreferNotToSay');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "gender" NOT NULL DEFAULT 'PreferNotToSay';
