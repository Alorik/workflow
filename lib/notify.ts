import { prisma } from "./prisma";
import { pusherServer } from "./pusher";

export async function sendNotification({
  userId,
  message,
  link
}: {
    userId: string;
    message: string;
    link?: string;
  }) {
  
  const notification = await prisma.notification.create({
    data: { userId, message, link },
  });

  await pusherServer.trigger(`user-${userId}`, "notification", notification);

  return notification;
} 