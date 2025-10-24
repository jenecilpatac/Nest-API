/*
  Warnings:

  - Added the required column `value` to the `message_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message_attachments" ADD COLUMN     "value" TEXT NOT NULL;
