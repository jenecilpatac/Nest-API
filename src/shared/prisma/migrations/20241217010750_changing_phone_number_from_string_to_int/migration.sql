/*
  Warnings:

  - You are about to drop the column `published_as` on the `cover_photos` table. All the data in the column will be lost.
  - You are about to drop the column `published_as` on the `profile_pictures` table. All the data in the column will be lost.
  - You are about to drop the column `job_title` on the `users` table. All the data in the column will be lost.
  - The `phoneNumber` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "cover_photos" DROP COLUMN "published_as",
ADD COLUMN     "publishedAs" "privacy" NOT NULL DEFAULT 'public';

-- AlterTable
ALTER TABLE "profile_pictures" DROP COLUMN "published_as",
ADD COLUMN     "publishedAs" "privacy" NOT NULL DEFAULT 'public';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "job_title",
ADD COLUMN     "jobTitle" TEXT,
DROP COLUMN "phoneNumber",
ADD COLUMN     "phoneNumber" INTEGER;
