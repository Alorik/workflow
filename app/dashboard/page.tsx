import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import SignInButton from "@/components/SignInButton";
import Profilepage from "@/components/Profile";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="flex flex-col items-center justify-center h-screen  bg-white/10 border">
        <p className="text-2xl text-gray-900 mb-4">
          You need to sign in to view your dashboard.
        </p>

        <div className="flex items-center justify-center x">
          <SignInButton />
        </div>
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
    <div className="max-w-9xl mx-auto px-4 mt-10">
      <div className="">
        <Profilepage />
      </div>
      <div className="flex justify-between items-center ">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <Link
          href="/projects"
          className="px-4 py-2 bg-gradient-to-r from-[#91ead4] via-[#a5f0dd] to-white text-black rounded-xl hover:scale-103"
        >
          + New Project
        </Link>
      </div>
      {/* condition */}
      {projects.length === 0 ? (
        <p className="text-gray-600">No projects yet </p>
      ) : (
        <div className="flex flex-col md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`projects/${project.id}`}
              className="p-6 bg-white shadow-xl rounded-2xl hover:shadow-2xl transition"
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
