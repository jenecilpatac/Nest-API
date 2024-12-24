/*
  Warnings:

  - You are about to drop the column `is_set` on the `cover_photos` table. All the data in the column will be lost.
  - You are about to drop the column `is_set` on the `profile_pictures` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cover_photos" DROP COLUMN "is_set",
ADD COLUMN     "isSet" BOOLEAN;

-- AlterTable
ALTER TABLE "profile_pictures" DROP COLUMN "is_set",
ADD COLUMN     "isSet" BOOLEAN;
