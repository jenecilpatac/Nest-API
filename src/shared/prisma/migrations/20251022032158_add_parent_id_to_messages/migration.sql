-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "parentId" INTEGER;

-- CreateTable
CREATE TABLE "reactions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT,
    "messageId" INTEGER,
    "value" TEXT NOT NULL,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
