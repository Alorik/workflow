import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID required" },
      { status: 400 }
    );
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: { assignedTo: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projectId);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { title, description, projectId, assignedToId, dueDate } =
    await req.json();

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assignedToId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { assignedTo: true },
  });

  return NextResponse.json(task);
}


export async function PUT(){
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { id, title, description, status, assignedToId, dueDate } = await req.json();
  
  const task = await prisma.task.update({
    where: { id }, 
    data: {
      title,
      description,
      status,
      assignedToId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { assignedTo: true },
  });
  
  return NextResponse.json(task);
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id =  searchParams.get("id");

  if (!id) {
     return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  await prisma.task.delete({
    where: {id}
  })
  return NextResponse.json({
    success: true
  })
}