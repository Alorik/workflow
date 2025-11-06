-- CreateTable
CREATE TABLE "_UserMemberProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserMemberProjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserMemberProjects_B_index" ON "_UserMemberProjects"("B");

-- AddForeignKey
ALTER TABLE "_UserMemberProjects" ADD CONSTRAINT "_UserMemberProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserMemberProjects" ADD CONSTRAINT "_UserMemberProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
