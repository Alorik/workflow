import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, broadcastMessage } from "@/lib/pusher";
import { sendNotification } from "@/lib/notify";

async function ensureTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      projectId: true,
      project: {
        select: {
          ownerId: true, //Get project owner ID
        },
      },
    },
  });
  if (!task) return null;

  const hasAccess = task.project.ownerId === userId;

  return hasAccess ? task : null;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id as string;
  try {
    const task = await ensureTaskAccess(id, userId);
    if (!task) {
      return NextResponse.json(
        { error: "You do not have access to this task" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.status && { status: body.status }),
        ...(body.dueDate !== undefined && {
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
        }),
        ...(body.assignedToId !== undefined && {
          assignedToId: body.assignedToId,
        }),
      },
      include: {
        assignedTo: true,
      },
    });

    if (updatedTask.assignedToId && updatedTask.assignedToId !== userId) {
      await sendNotification({
        userId: updatedTask.assignedToId,
        message: `${session.user.name} assigned you a task: ${updatedTask.title}`,
        link: `/projects/${updatedTask.projectId}/tasks/${updatedTask.id}`,
      });
    }

    const activity = await prisma.activity.create({
      data: {
        type: "TASK_UPDATED",
        message: `Task "${updatedTask.title}" was updated by ${session.user.name}`,
        projectId: updatedTask.projectId,
        taskId: updatedTask.id,
        userId: session.user.id,
      },
      include: { user: true },
    });

    await pusherServer.trigger(
      `project-${updatedTask.projectId}`,
      "activity-created",
      activity
    );

    broadcastMessage({
      projectId: updatedTask.projectId,
      type: "TASK_UPDATED",
      data: updatedTask,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;
  try {
    const task = await ensureTaskAccess(id, userId);
    if (!task) {
      return NextResponse.json(
        { error: "You do not have access to this task" },
        { status: 403 }
      );
    }
    const deletedTask = await prisma.task.delete({
      where: { id },
    });

    await prisma.activity.create({
      data: {
        type: "TASK_DELETED",
        message: `Task "${deletedTask.title}" was deleted by ${session.user.name}`,
        projectId: deletedTask.projectId,
        taskId: deletedTask.id,
        userId: session.user.id,
      },
    });

    broadcastMessage({
      projectId: deletedTask.projectId,
      type: "TASK_DELETED",
      data: deletedTask,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
