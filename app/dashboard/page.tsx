import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth"; 
import { PrismaClient } from "@prisma/client";
import SignInButton from "@/components/SignInButton";
import Profilepage from "@/components/Profile";
import {
  FolderKanban,
  Plus,
  Folder,
  FileText,
  ArrowRight,
  Lock,
  LayoutDashboard,
} from "lucide-react";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4">
        <div className="max-w-md w-full bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-2xl text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-gray-500 to-rose-600 rounded-full mb-6 shadow-lg shadow-gray-500/30">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to access your dashboard and manage your projects.
          </p>
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
    <div className="min-h-screen bg-white">
      {/* Profile Section */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Profilepage />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-rose-600 rounded-2xl shadow-lg shadow-gray-500/30">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                Your Projects
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {projects.length}
                {projects.length === 1 ? "project" : "projects"} in your
                workspace
              </p>
            </div>
          </div>
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-[#c0e3da] text-white font-semibold rounded-xl hover:from-gray-700 hover:to-[#c0e3da] transition-all duration-300 shadow-lg shadow-gray-500/30 hover:shadow-xl hover:shadow-gray-500/40 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                <FolderKanban className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                No Projects Yet
              </h3>
              <p className="text-gray-600 mb-8">
                Start building something amazing! Create your first project to
                organize tasks and collaborate with your team.
              </p>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-rose-600 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-rose-700 transition-all duration-300 shadow-lg shadow-gray-500/30 hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const gradients = [
                "from-rose-500 to-gray-600",
                "from-emerald-500 to-gray-600",
                "from-pink-500 to-gray-600",
                "from-amber-500 to-gray-600",
                "from-blue-500 to-gray-600",
                "from-rose-500 to-gray-600",
              ];
              const gradient = gradients[index % gradients.length];

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  ></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`inline-flex p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Folder className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                      {project.name}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description || "No description provided"}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <FileText className="w-4 h-4" />
                        <span>Project</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
