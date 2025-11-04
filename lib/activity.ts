import { prisma } from "./prisma";
import { pusherServer } from "./pusher";

export async function logActivity({
    type,
  message,
  projectId,
  taskId,
  userId,
}:{
  type: string;
  message: string;
  projectId: string;
  taskId?: string;
  userId?: string;
}){
  const activity = await prisma.activity.create({
    data: { type, message, projectId, taskId, userId },
    include: { user: true }
  });

  await pusherServer.trigger(
    `project-${projectId}`,
    "activity-created",
    activity
  );
  return activity;
}