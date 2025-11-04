import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { broadcastMessage } from "@/lib/pusher";
import { pusherServer } from "@/lib/pusher"; // ✅ make sure this import exists
import { sendNotification } from "@/lib/notify";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, status, dueDate, assignedToId } =
      await req.json();

    // ✅ Update the task
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });


    if (updatedTask.assignedToId && updatedTask.assignedToId !== session.user.id) {
      await sendNotification({
        userId: updatedTask.assignedToId,
        message: `${session.user.name} assigned you a task: ${updatedTask.title}`,
        link: `/projects/${updatedTask.projectId}/tasks/${updatedTask.id}`
      });
    }

    // ✅ Log an activity in DB
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

    // ✅ Broadcast the activity to the ActivityFeed (real-time update)
    await pusherServer.trigger(
      `project-${updatedTask.projectId}`,
      "activity-created",
      activity
    );

    // ✅ Broadcast the task update (for task list sync)
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
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const deletedTask = await prisma.task.delete({
      where: { id: params.id },
    });

    // ✅ Log deletion as well (optional)
    await prisma.activity.create({
      data: {
        type: "TASK_DELETED",
        message: `Task "${deletedTask.title}" was deleted by ${session.user.name}`,
        projectId: deletedTask.projectId,
        taskId: deletedTask.id,
        userId: session.user.id,
      },
    });

    //  Broadcast the delete event
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
