-- AlterTable
ALTER TABLE "profile_pictures" ADD COLUMN     "is_set" BOOLEAN;

-- CreateTable
CREATE TABLE "cover_photos" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "avatar" TEXT NOT NULL,
    "is_set" BOOLEAN,
    "published_as" "privacy" NOT NULL DEFAULT 'public',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cover_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cover_photos" ADD CONSTRAINT "cover_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
