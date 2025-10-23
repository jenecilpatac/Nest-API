/*
  Warnings:

  - The primary key for the `seeners` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `int` on the `seeners` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "seeners" DROP CONSTRAINT "seeners_pkey",
DROP COLUMN "int",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "seeners_pkey" PRIMARY KEY ("id");
