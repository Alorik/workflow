import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const membership = await prisma.projectMember.findMany({
    where: { userId },
    include: {
      project: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const projects = membership.map((m) => m.project);
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const { name, description } = await req.json();

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId, // ✅ no `any`
    },
  });

  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId,
      role: "OWNER",
    },
  });

  return NextResponse.json(project);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }

  const { id, name, description, status } = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      description,
      status,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
