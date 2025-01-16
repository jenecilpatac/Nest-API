/*
  Warnings:

  - You are about to drop the column `updateAt` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `likes` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chats" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "likes" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "updateAt",
ADD COLUMN     "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
