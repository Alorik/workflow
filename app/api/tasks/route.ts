import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/lib/pusher";


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status"); // new
  const sort = searchParams.get("sort"); 

  if (!projectId) {
    return NextResponse.json(
      { error: "Project ID required" },
      { status: 400 }
    );
  }
  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "due"
      ? { dueDate: "asc" }
      : { createdAt: "desc" };
  
   const where: any = { projectId };
   if (status && status !== "all") {
     where.status = status;
   }


  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy,
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { title, description, projectId, assignedToId, dueDate } =
    await req.json();

  if (!title || !projectId) {
    return NextResponse.json(
      { error: "Title and projectId required" },
      { status: 400 }
    );
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assignedToId: assignedToId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
    },
  });

//realtime broadcast channel
  await pusherServer.trigger(`project-${projectId}`, "task-created", task);

  return NextResponse.json(task);
}

export async function PUT(req: NextRequest) {
  
  
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

export async function DELETE(req: NextRequest) {
  
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