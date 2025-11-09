"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieLabelRenderProps,
} from "recharts";

import {
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  Folder,
  Activity,
  Zap,
} from "lucide-react";

interface AnalyticsData {
  totalTasks: number;
  completed: number;
  pending: number;
  tasksByProject: {
    projectId: string;
    _count: { id: number };
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json: AnalyticsData) => setData(json))
      .catch((err) => console.error("Failed to fetch analytics:", err));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-400 dark:border-indigo-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Activity className="w-6 h-6 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  const completionRate =
    Math.round((data.completed / data.totalTasks) * 100) || 0;

  const statCards = [
    {
      title: "Total Tasks",
      value: data.totalTasks,
      icon: ListTodo,
      gradient: "from-primary-500 via-gray-500 to-pink-500",
      glowColor: "shadow-pink-500/50",
    },
    {
      title: "Completed",
      value: data.completed,
      icon: CheckCircle2,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      glowColor: "shadow-emerald-500/50",
      subtitle: `${completionRate}% completion rate`,
    },
    {
      title: "Pending",
      value: data.pending,
      icon: Clock,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      glowColor: "shadow-amber-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-3">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Real-time insights into your team&apos;s performance
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="relative">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              <div className="absolute inset-0 bg-yellow-400/20 blur-md"></div>
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Live
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/50"
              >
                <div
                  className={`absolute inset-0 ${stat.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-2">
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    <div
                      className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl shadow-xl ${stat.glowColor} group-hover:shadow-2xl transition-shadow duration-500`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* PIE CHART SECTION */}
        <Card className="group bg-white/80 dark:bg-gray-900/80 my-10 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/50">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-gray-900 to-pink-600 dark:from-gray-700 dark:to-pink-500 rounded-xl shadow-lg shadow-purple-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Task Distribution
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <defs>
                  <linearGradient
                    id="completedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient
                    id="pendingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>

                <Pie
                  data={[
                    { name: "Completed", value: data.completed },
                    { name: "Pending", value: data.pending },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  label={({ name, percent, x, y }: PieLabelRenderProps) => {
                    const p = (percent as number) ?? 0;
                    const isDark =
                      document.documentElement.classList.contains("dark");
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                          fill: isDark ? "#e5e7eb" : "#374151",
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}
                      >
                        {`${name ?? ""} ${(p * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  labelLine={false}
                >
                  <Cell fill="url(#completedGradient)" />
                  <Cell fill="url(#pendingGradient)" />
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(229, 231, 235, 0.8)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(10px)",
                    color: "#1f2937",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* completion rate */}
        <Card className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/50">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Completion Rate
              </h2>
            </div>
            <div className="flex items-center justify-center h-[320px]">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  {/* outer-glowing */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-20"></div>
                  <svg className="w-56 h-56 transform -rotate-90 relative z-10">
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-700"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="url(#progressGradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${completionRate * 6.28} 628`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute">
                    <div className="text-6xl font-black bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {completionRate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-bold uppercase tracking-wider">
                      Complete
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 backdrop-blur-sm">
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {data.completed}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-1 uppercase tracking-wider">
                      Done
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 backdrop-blur-sm">
                    <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                      {data.pending}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-1 uppercase tracking-wider">
                      Left
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Project */}
        <Card className="group mt-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-2xl dark:hover:shadow-gray-900/50">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Tasks by Project
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.tasksByProject}>
                <defs>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#803b3b" />
                    <stop offset="100%" stopColor="#d9c7c7" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="projectId"
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <YAxis
                  stroke="#6b7280"
                  className="dark:stroke-gray-400"
                  style={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid rgba(229, 231, 235, 0.8)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(10px)",
                    color: "#1f2937",
                  }}
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                />
                <Bar
                  dataKey="_count.id"
                  fill="url(#barGradient2)"
                  radius={[12, 12, 0, 0]}
                  name="Tasks"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
