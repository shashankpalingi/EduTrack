import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Target,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import {
  AnalyticsService,
  ClassAnalytics,
} from "../../services/analyticsService";
import StudentDetailView from "./StudentDetailView";
import { ExportUtils, ExportData, ExportMenu } from "./ExportUtils";

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface QuizSubmissionData {
  student_id: string;
  score: number;
  completed: boolean;
  created_at: string;
  quiz_id: string;
  profiles: {
    full_name: string;
  };
  quizzes: {
    title: string;
  };
}

interface MaterialViewData {
  student_id: string;
  viewed_at: string;
  material_id: string;
  profiles: {
    full_name: string;
  };
  materials: {
    title: string;
    file_type: string;
  };
}

interface QuizPerformance {
  student_id: string;
  student_name: string;
  quiz_title: string;
  score: number;
  completed: boolean;
  created_at: string;
  quiz_id: string;
}

interface MaterialEngagement {
  student_id: string;
  student_name: string;
  material_title: string;
  viewed_at: string;
  material_id: string;
  material_type: string;
}

export interface StudentStats {
  student_id: string;
  student_name: string;
  total_quizzes: number;
  completed_quizzes: number;
  average_score: number;
  materials_viewed: number;
  last_activity: string;
  engagement_level: "High" | "Medium" | "Low";
}

export interface PerformanceMetrics {
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  completionRate: number;
  totalQuizzes: number;
  totalMaterials: number;
}

const StudentProgress = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [quizPerformances, setQuizPerformances] = useState<QuizPerformance[]>(
    [],
  );
  const [materialEngagements, setMaterialEngagements] = useState<
    MaterialEngagement[]
  >([]);
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(
    null,
  );
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalStudents: 0,
    activeStudents: 0,
    averageScore: 0,
    completionRate: 0,
    totalQuizzes: 0,
    totalMaterials: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [timeRange, setTimeRange] = useState("30");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudents = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("role", "student");

    if (error) {
      console.error("Error fetching students:", error);
      return;
    }

    setStudents(data || []);
  }, []);

  const fetchQuizPerformances = React.useCallback(async () => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(timeRange));

    const { data, error } = await supabase
      .from("quiz_submissions")
      .select(
        `
        student_id,
        score,
        completed,
        created_at,
        quiz_id,
        profiles!inner(full_name),
        quizzes!inner(title)
      `,
      )
      .gte("created_at", dateThreshold.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quiz performances:", error);
      return;
    }

    const performances =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.map((item: any) => ({
        student_id: item.student_id,
        student_name: item.profiles.full_name,
        quiz_title: item.quizzes.title,
        score: item.score || 0,
        completed: item.completed,
        created_at: item.created_at,
        quiz_id: item.quiz_id,
      })) || [];

    setQuizPerformances(performances);
  }, [timeRange]);

  const fetchMaterialEngagements = React.useCallback(async () => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(timeRange));

    const { data, error } = await supabase
      .from("material_views")
      .select(
        `
        student_id,
        viewed_at,
        material_id,
        profiles!inner(full_name),
        materials!inner(title, file_type)
      `,
      )
      .gte("viewed_at", dateThreshold.toISOString())
      .order("viewed_at", { ascending: false });

    if (error) {
      console.error("Error fetching material engagements:", error);
      return;
    }

    const engagements =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.map((item: any) => ({
        student_id: item.student_id,
        student_name: item.profiles.full_name,
        material_title: item.materials.title,
        viewed_at: item.viewed_at,
        material_id: item.material_id,
        material_type: item.materials.file_type,
      })) || [];

    setMaterialEngagements(engagements);
  }, [timeRange]);

  const fetchDataCallback = React.useCallback(async () => {
    setLoading(true);
    try {
      const [analytics] = await Promise.all([
        AnalyticsService.getClassAnalytics(user?.id, parseInt(timeRange)),
        fetchStudents(),
        fetchQuizPerformances(),
        fetchMaterialEngagements(),
      ]);
      setClassAnalytics(analytics);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    timeRange,
    fetchStudents,
    fetchQuizPerformances,
    fetchMaterialEngagements,
  ]);

  useEffect(() => {
    if (user) {
      fetchDataCallback();
    }
  }, [user, fetchDataCallback]);

  const fetchData = async () => {
    await fetchDataCallback();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleExport = (type: "csv" | "json" | "pdf") => {
    const exportData: ExportData = {
      studentStats,
      metrics,
      timestamp: new Date().toISOString(),
      timeRange,
    };

    switch (type) {
      case "csv":
        ExportUtils.exportToCSV(exportData);
        break;
      case "json":
        ExportUtils.exportToJSON(exportData);
        break;
      case "pdf":
        ExportUtils.exportToPDF(exportData);
        break;
    }
  };

  const calculateStudentStatsCallback = React.useCallback(() => {
    const stats: StudentStats[] = students.map((student) => {
      const studentQuizzes = quizPerformances.filter(
        (q) => q.student_id === student.id,
      );
      const studentMaterials = materialEngagements.filter(
        (m) => m.student_id === student.id,
      );

      const completedQuizzes = studentQuizzes.filter((q) => q.completed);
      const averageScore =
        completedQuizzes.length > 0
          ? completedQuizzes.reduce((acc, q) => acc + q.score, 0) /
            completedQuizzes.length
          : 0;

      const lastQuizActivity =
        studentQuizzes.length > 0
          ? Math.max(
              ...studentQuizzes.map((q) => new Date(q.created_at).getTime()),
            )
          : 0;
      const lastMaterialActivity =
        studentMaterials.length > 0
          ? Math.max(
              ...studentMaterials.map((m) => new Date(m.viewed_at).getTime()),
            )
          : 0;

      const lastActivity = Math.max(lastQuizActivity, lastMaterialActivity);
      const daysSinceLastActivity =
        lastActivity > 0
          ? Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24))
          : Infinity;

      let engagementLevel: "High" | "Medium" | "Low" = "Low";
      if (
        daysSinceLastActivity <= 3 &&
        (completedQuizzes.length > 0 || studentMaterials.length > 2)
      ) {
        engagementLevel = "High";
      } else if (
        daysSinceLastActivity <= 7 &&
        (completedQuizzes.length > 0 || studentMaterials.length > 0)
      ) {
        engagementLevel = "Medium";
      }

      return {
        student_id: student.id,
        student_name: student.full_name || student.email,
        total_quizzes: studentQuizzes.length,
        completed_quizzes: completedQuizzes.length,
        average_score: Math.round(averageScore * 100) / 100,
        materials_viewed: studentMaterials.length,
        last_activity:
          lastActivity > 0
            ? new Date(lastActivity).toLocaleDateString()
            : "No activity",
        engagement_level: engagementLevel,
      };
    });

    setStudentStats(stats);
  }, [students, quizPerformances, materialEngagements]);

  const calculateMetricsCallback = React.useCallback(() => {
    const totalStudents = students.length;
    const activeStudents = studentStats.filter(
      (s) => s.engagement_level !== "Low",
    ).length;

    const completedQuizzes = quizPerformances.filter((q) => q.completed);
    const averageScore =
      completedQuizzes.length > 0
        ? completedQuizzes.reduce((acc, q) => acc + q.score, 0) /
          completedQuizzes.length
        : 0;

    const completionRate =
      quizPerformances.length > 0
        ? (completedQuizzes.length / quizPerformances.length) * 100
        : 0;

    const uniqueQuizzes = new Set(quizPerformances.map((q) => q.quiz_id)).size;
    const uniqueMaterials = new Set(
      materialEngagements.map((m) => m.material_id),
    ).size;

    setMetrics({
      totalStudents,
      activeStudents,
      averageScore: Math.round(averageScore * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      totalQuizzes: uniqueQuizzes,
      totalMaterials: uniqueMaterials,
    });
  }, [students, studentStats, quizPerformances, materialEngagements]);

  useEffect(() => {
    if (
      students.length > 0 &&
      quizPerformances.length >= 0 &&
      materialEngagements.length >= 0
    ) {
      calculateStudentStatsCallback();
    }
  }, [
    students,
    quizPerformances,
    materialEngagements,
    calculateStudentStatsCallback,
  ]);

  useEffect(() => {
    calculateMetricsCallback();
  }, [calculateMetricsCallback]);

  const getFilteredStudents = () => {
    let filtered = studentStats;

    if (searchTerm) {
      filtered = filtered.filter((student) =>
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterBy !== "all") {
      filtered = filtered.filter(
        (student) => student.engagement_level === filterBy,
      );
    }

    return filtered;
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const chartColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

  const quizPerformanceChart = quizPerformances
    .reduce(
      (
        acc: Array<{
          quiz_title: string;
          total_attempts: number;
          completed_attempts: number;
          total_score: number;
        }>,
        curr,
      ) => {
        const existing = acc.find(
          (item) => item.quiz_title === curr.quiz_title,
        );
        if (existing) {
          existing.total_attempts += 1;
          if (curr.completed) {
            existing.completed_attempts += 1;
            existing.total_score += curr.score;
          }
        } else {
          acc.push({
            quiz_title:
              curr.quiz_title.substring(0, 20) +
              (curr.quiz_title.length > 20 ? "..." : ""),
            total_attempts: 1,
            completed_attempts: curr.completed ? 1 : 0,
            total_score: curr.completed ? curr.score : 0,
          });
        }
        return acc;
      },
      [],
    )
    .map((item) => ({
      ...item,
      average_score:
        item.completed_attempts > 0
          ? item.total_score / item.completed_attempts
          : 0,
      completion_rate: (item.completed_attempts / item.total_attempts) * 100,
    }))
    .slice(0, 10);

  const engagementData = [
    {
      name: "High Engagement",
      value: studentStats.filter((s) => s.engagement_level === "High").length,
      color: "#22c55e",
    },
    {
      name: "Medium Engagement",
      value: studentStats.filter((s) => s.engagement_level === "Medium").length,
      color: "#eab308",
    },
    {
      name: "Low Engagement",
      value: studentStats.filter((s) => s.engagement_level === "Low").length,
      color: "#ef4444",
    },
  ];

  const activityTrend = materialEngagements
    .reduce((acc: Array<{ date: string; views: number }>, curr) => {
      const date = new Date(curr.viewed_at).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.views += 1;
      } else {
        acc.push({ date, views: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show detailed student view if a student is selected
  if (selectedStudentId) {
    return (
      <StudentDetailView
        studentId={selectedStudentId}
        onBack={() => setSelectedStudentId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Student Progress Analytics
          </h2>
          <p className="text-white/70">
            Track student performance, engagement, and learning outcomes
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <ExportMenu
            data={{
              studentStats,
              metrics,
              timestamp: new Date().toISOString(),
              timeRange,
            }}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.totalStudents}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Active Students
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.activeStudents}
            </div>
            <p className="text-xs text-white/60 mt-1">
              {metrics.totalStudents > 0
                ? Math.round(
                    (metrics.activeStudents / metrics.totalStudents) * 100,
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Avg Quiz Score
            </CardTitle>
            <Award className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.averageScore}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.completionRate}%
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Total Quizzes
            </CardTitle>
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.totalQuizzes}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">
              Materials
            </CardTitle>
            <Eye className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {metrics.totalMaterials}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Quiz Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Levels</TabsTrigger>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="students">Student Details</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  Quiz Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={quizPerformanceChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis dataKey="quiz_title" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="average_score"
                      fill="#8884d8"
                      name="Average Score %"
                    />
                    <Bar
                      dataKey="completion_rate"
                      fill="#82ca9d"
                      name="Completion Rate %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {classAnalytics && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classAnalytics.topPerformers
                      .slice(0, 5)
                      .map((student, index) => (
                        <div
                          key={student.studentId}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {student.studentName}
                              </p>
                              <p className="text-white/60 text-sm">
                                {student.averageScore}% avg
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedStudentId(student.studentId)
                            }
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    {classAnalytics.topPerformers.length === 0 && (
                      <p className="text-center text-white/50 py-4">
                        No performance data available yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  Student Engagement Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={engagementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  Engagement Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">High Engagement</span>
                    <Badge className="bg-green-500/20 text-green-300">
                      {engagementData[0]?.value || 0} students
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Medium Engagement</span>
                    <Badge className="bg-yellow-500/20 text-yellow-300">
                      {engagementData[1]?.value || 0} students
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Low Engagement</span>
                    <Badge className="bg-red-500/20 text-red-300">
                      {engagementData[2]?.value || 0} students
                    </Badge>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-sm font-medium text-white mb-2">
                    Recommendations
                  </h4>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Reach out to low-engagement students</li>
                    <li>• Create interactive content for better engagement</li>
                    <li>• Consider gamification elements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">
                Material Activity Trend (Last 14 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={activityTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="date" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    fill="rgba(136, 132, 216, 0.3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="High">High Engagement</SelectItem>
                <SelectItem value="Medium">Medium Engagement</SelectItem>
                <SelectItem value="Low">Low Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/20">
                    <tr className="text-left">
                      <th className="p-4 text-white font-medium">Student</th>
                      <th className="p-4 text-white font-medium">Quizzes</th>
                      <th className="p-4 text-white font-medium">Avg Score</th>
                      <th className="p-4 text-white font-medium">Materials</th>
                      <th className="p-4 text-white font-medium">Engagement</th>
                      <th className="p-4 text-white font-medium">
                        Last Activity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredStudents().map((student) => (
                      <tr
                        key={student.student_id}
                        className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => setSelectedStudentId(student.student_id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-white">
                              {student.student_name}
                            </div>
                            <ExternalLink className="h-3 w-3 text-white/50" />
                          </div>
                        </td>
                        <td className="p-4 text-white/80">
                          {student.completed_quizzes}/{student.total_quizzes}
                        </td>
                        <td className="p-4">
                          <span className="text-white font-medium">
                            {student.average_score > 0
                              ? `${student.average_score}%`
                              : "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-white/80">
                          {student.materials_viewed}
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`${getEngagementColor(student.engagement_level)}/20 border-0`}
                          >
                            {student.engagement_level}
                          </Badge>
                        </td>
                        <td className="p-4 text-white/70 text-sm">
                          {student.last_activity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredStudents().length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    No students found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProgress;
