import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg mb-4">
          You need to sign in to view your dashboard.
        </p>
        <Link
          href="/signin"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const projects = await prisma.project.findMany({
    where: {
      owner: {
        email: session.user.email,
      },
    },
  });

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl"
        >
          + New Project
        </Link>
      </div>
      {/* condition */}
      {projects.length === 0 ? (
        <p className="text-gray-600">No projects yet </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`projects/${project.id}`}
              className="p-6 bg-white shadow rounded-2xl hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <p className="text-gray-500 mt-2">
                {project.description || "No description"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
