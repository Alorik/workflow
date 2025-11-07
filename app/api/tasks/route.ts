import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; 
import { getServerSession } from "next-auth";
import { pusherServer } from "@/lib/pusher";
import { logActivity } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  // ✅ Explicitly type your "where" filter instead of using any
  const where: { projectId: string; status?: string } = { projectId };
  if (status && status !== "all") {
    where.status = status;
  }

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "due"
      ? { dueDate: "asc" }
      : { createdAt: "desc" };

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
  if (!session?.user?.id) {
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

  await pusherServer.trigger(`project-${projectId}`, "task-created", task);

  await logActivity({
    type: "TASK_CREATED",
    message: `New task created: ${task.title}`,
    projectId: task.projectId,
    taskId: task.id,
    userId: session.user.id,
  });

  return NextResponse.json(task);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { id, title, description, status, assignedToId, dueDate } =
    await req.json();

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

  await logActivity({
    type: "TASK_UPDATED",
    message: `${session.user.name} updated task: ${task.title}`,
    projectId: task.projectId,
    taskId: task.id,
    userId: session.user.id,
  });

  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
