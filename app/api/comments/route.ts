import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { broadcastMessage } from "@/lib/pusher";
import { sendNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const { content, taskId } = await req.json();

  const comment = await prisma.comment.create({
    data: {
      content,
      taskId,
      authorId: session.user.id,
    },
    include: { author: true },
  });

  await broadcastMessage({
    type: "COMMENT_ADDED",
    data: comment,
  });

  const mentionRegx = /@(\S+)/g;
  const mentions = content.match(mentionRegx) || [];
  if (mentions.length > 0) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    for (const mention of mentions) {
      const username = mention.replace("@", "").trim();
      const mentionedUser = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { equals: username, mode: "insensitive" } },
            { email: { equals: username, mode: "insensitive" } },
          ],
        },
      });
      if (mentionedUser) {
        await sendNotification({
          userId: mentionedUser.id,
          message: `${session.user.name} mentioned you in a comment.`,
          link: `/projects/${task?.projectId}/tasks/${task?.id}`,
        });
      }
    }
  }
  return NextResponse.json(comment);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(comments);
}
