import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Not Authenticated" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: {
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "not Authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description } = body;

  const project = await prisma.project.create({
    data: {
      name: name,
      description: description,
      ownerId: (session as any).user.id,
    },
  });

  return NextResponse.json(project);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "not Authenticated" }, { status: 401 });
  }

  const { id, name, description, status } = await req.json();
  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      status,
      description,
    },
  });

  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "not Authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({
    success: true,
  });
}
