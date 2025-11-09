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
  const [isDark, setIsDark] = useState(false);

  // Check if dark mode is active
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json: AnalyticsData) => setData(json))
      .catch((err) => console.error("Failed to fetch analytics:", err));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-400 dark:border-pink-500 mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Activity className="w-6 h-6 text-pink-500 dark:text-pink-400 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-900 dark:text-gray-100 text-lg font-medium">
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
      gradient: "from-pink-400 via-rose-400 to-orange-300",
      bgLight: "bg-pink-50",
      bgDark: "dark:bg-pink-950/30",
    },
    {
      title: "Completed",
      value: data.completed,
      icon: CheckCircle2,
      gradient: "from-green-400 via-emerald-400 to-teal-300",
      bgLight: "bg-green-50",
      bgDark: "dark:bg-green-950/30",
      subtitle: `${completionRate}% completion rate`,
    },
    {
      title: "Pending",
      value: data.pending,
      icon: Clock,
      gradient: "from-orange-400 via-amber-400 to-yellow-300",
      bgLight: "bg-orange-50",
      bgDark: "dark:bg-orange-950/30",
    },
  ];

  // Tooltip styles that adapt to theme
  const tooltipStyle = {
    backgroundColor: isDark
      ? "rgba(17, 24, 39, 0.98)"
      : "rgba(255, 255, 255, 0.98)",
    border: isDark
      ? "1px solid rgba(75, 85, 99, 0.8)"
      : "1px solid rgba(229, 231, 235, 0.8)",
    borderRadius: "12px",
    boxShadow: isDark
      ? "0 4px 20px rgba(0,0,0,0.4)"
      : "0 4px 20px rgba(0,0,0,0.08)",
    color: isDark ? "#f9fafb" : "#1f2937",
  };

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Real-time insights into your team&apos;s performance
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-gray-100 dark:bg-gray-900 backdrop-blur-xl rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="relative">
              <Zap className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                className={`group relative overflow-hidden ${stat.bgLight} ${stat.bgDark} backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-2xl`}
              >
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        {stat.title}
                      </p>
                      <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    <div
                      className={`bg-gradient-to-br ${stat.gradient} p-4 rounded-2xl shadow-lg`}
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
        <Card className="group bg-white dark:bg-gray-950/50 my-10 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient
                    id="pendingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
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
                    return (
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                          fill: isDark ? "#ffffff" : "#000000",
                          fontWeight: "600",
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

                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* completion rate */}
        <Card className="group bg-white dark:bg-gray-950/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Completion Rate
              </h2>
            </div>
            <div className="flex items-center justify-center h-[320px]">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-56 h-56 transform -rotate-90 relative z-10">
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="#f3f4f6"
                      className="dark:stroke-gray-800"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="url(#progressGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${completionRate * 6.28} 628`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient
                        id="progressGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute">
                    <div className="text-6xl font-bold bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      {completionRate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-semibold uppercase tracking-wider">
                      Complete
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-950/30 p-5 rounded-2xl border border-green-200 dark:border-green-900/50">
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                      {data.completed}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-2 uppercase tracking-wider">
                      Done
                    </div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-2xl border border-orange-200 dark:border-orange-900/50">
                    <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                      {data.pending}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-2 uppercase tracking-wider">
                      Left
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Project */}
        <Card className="group mt-10 bg-white dark:bg-gray-950/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl shadow-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Tasks by Project
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.tasksByProject}>
                <defs>
                  <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="projectId"
                  stroke={isDark ? "#6b7280" : "#9ca3af"}
                  style={{ fontSize: "12px", fontWeight: "600" }}
                />
                <YAxis
                  stroke={isDark ? "#6b7280" : "#9ca3af"}
                  style={{ fontSize: "12px", fontWeight: "600" }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{
                    fill: isDark
                      ? "rgba(251, 146, 60, 0.1)"
                      : "rgba(251, 146, 60, 0.05)",
                  }}
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
