import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }

  // Check if the member exists and is not the owner
  const member = await prisma.projectMember.findUnique({
    where: { id: params.memberId },
  });

  if (!member) {
    return NextResponse.json({ message: "Member not found" }, { status: 404 });
  }

  if (member.role === "OWNER") {
    return NextResponse.json(
      { message: "Cannot remove project owner" },
      { status: 400 }
    );
  }

  // Delete the member
  await prisma.projectMember.delete({
    where: { id: params.memberId },
  });

  return NextResponse.json({ success: true });
}