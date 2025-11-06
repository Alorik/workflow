import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "not authenticated" }, { status: 401 });
    }

    const totalTasks = await prisma.task.count({
      where: { project: { ownerId: session.user.id } },
    });

    const completed = await prisma.task.count({
      where: {
        status: { equals: "done", mode: "insensitive" },
        project: { ownerId: session.user.id },
      },
    });

    const pending = totalTasks - completed;

    const tasksByProject = await prisma.task.groupBy({
      by: ["projectId"],
      _count: { id: true },
    });

    const tasksByUser = await prisma.task.groupBy({
      by: ["assignedToId"],
      _count: { id: true },
    });

 

    return NextResponse.json({
      totalTasks,
      completed,
      pending,
      tasksByProject,
      tasksByUser,
    });
  } catch (error) {
    console.error("Error in /api/analytics:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
