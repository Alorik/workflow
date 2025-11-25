import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await context.params; // ✅ Must await params

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ role: null, allowed: false }, { status: 401 });
  }

  const membership = await prisma.projectMember.findFirst({
    where: {
      projectId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    return NextResponse.json({ role: null, allowed: false });
  }

  return NextResponse.json({
    role: membership.role,
    allowed: true,
  });
}
