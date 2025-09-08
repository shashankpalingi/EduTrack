import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Progress } from "../ui/progress";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  Clock,
  BookOpen,
  Brain,
  Activity,
  CheckCircle,
  AlertTriangle,
  Star,
  Download,
  Mail,
  MessageSquare,
} from "lucide-react";
import { AnalyticsService, AnalyticsData } from "../../services/analyticsService";

interface StudentDetailViewProps {
  studentId: string;
  onBack: () => void;
}

interface LearningRecommendation {
  type: 'strength' | 'improvement' | 'suggestion';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ studentId, onBack }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchStudentData();
  }, [studentId, timeRange]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [data, recs] = await Promise.all([
        AnalyticsService.getStudentAnalytics(studentId, timeRange),
        AnalyticsService.getStudentRecommendations(studentId)
      ]);

      setAnalyticsData(data);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDetailedRecommendations = (data: AnalyticsData): LearningRecommendation[] => {
    const recs: LearningRecommendation[] = [];
    const { overallStats, quizData, materialData } = data;

    // Performance analysis
    if (overallStats.averageScore >= 85) {
      recs.push({
        type: 'strength',
        title: 'Excellent Performance',
        description: 'Maintaining high quiz scores consistently. Consider advanced challenges.',
        priority: 'low'
      });
    } else if (overallStats.averageScore < 60) {
      recs.push({
        type: 'improvement',
        title: 'Performance Needs Attention',
        description: 'Focus on fundamental concepts before attempting advanced topics.',
        priority: 'high'
      });
    }

    // Engagement analysis
    if (overallStats.engagementScore < 40) {
      recs.push({
        type: 'improvement',
        title: 'Low Engagement Detected',
        description: 'Increase interaction with course materials and participate in discussions.',
        priority: 'high'
      });
    }

    // Activity pattern analysis
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(overallStats.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity > 7) {
      recs.push({
        type: 'improvement',
        title: 'Inactive for Extended Period',
        description: 'Regular study sessions are crucial for retention. Consider setting up a study schedule.',
        priority: 'high'
      });
    }

    // Progress trend analysis
    if (overallStats.progressTrend === 'improving') {
      recs.push({
        type: 'strength',
        title: 'Showing Improvement',
        description: 'Keep up the excellent work! Your scores are consistently improving.',
        priority: 'low'
      });
    } else if (overallStats.progressTrend === 'declining') {
      recs.push({
        type: 'improvement',
        title: 'Performance Declining',
        description: 'Recent quiz scores show a downward trend. Review recent materials.',
        priority: 'medium'
      });
    }

    // Material engagement
    if (materialData.length < 5) {
      recs.push({
        type: 'suggestion',
        title: 'Explore More Resources',
        description: 'Access more study materials to broaden your understanding of the subject.',
        priority: 'medium'
      });
    }

    return recs;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'strength': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'improvement': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      default: return <Brain className="h-5 w-5 text-blue-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      low: 'bg-green-500/20 text-green-300'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No data available for this student.</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
      </div>
    );
  }

  const { overallStats, quizData, materialData } = analyticsData;
  const detailedRecommendations = generateDetailedRecommendations(analyticsData);

  // Prepare chart data
  const quizScoreTrend = quizData
    .filter(q => q.completed)
    .sort((a, b) => new Date(a.attemptDate).getTime() - new Date(b.attemptDate).getTime())
    .map((quiz, index) => ({
      attempt: index + 1,
      score: quiz.score,
      date: new Date(quiz.attemptDate).toLocaleDateString(),
      title: quiz.quizTitle.substring(0, 15) + '...'
    }));

  const engagementData = [
    { name: 'Quiz Performance', value: overallStats.averageScore, color: '#8884d8' },
    { name: 'Completion Rate', value: overallStats.completionRate, color: '#82ca9d' },
    { name: 'Material Engagement', value: Math.min((materialData.length / 10) * 100, 100), color: '#ffc658' },
    { name: 'Consistency', value: overallStats.streakDays * 10, color: '#ff7c7c' }
  ];

  const activityHeatmap = materialData
    .reduce((acc: any, curr) => {
      const date = new Date(curr.viewedAt).toLocaleDateString();
      const existing = acc.find((item: any) => item.date === date);
      if (existing) {
        existing.views += 1;
      } else {
        acc.push({ date, views: 1 });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${analyticsData.studentId}`} />
              <AvatarFallback>{analyticsData.studentName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-white">{analyticsData.studentName}</h1>
              <p className="text-white/70">{analyticsData.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Average Score</CardTitle>
            <Award className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(overallStats.averageScore)}`}>
              {overallStats.averageScore}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(overallStats.progressTrend)}
              <span className="text-xs text-white/60">{overallStats.progressTrend}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overallStats.completionRate}%</div>
            <Progress value={overallStats.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Engagement Score</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overallStats.engagementScore}/100</div>
            <p className="text-xs text-white/60 mt-1">
              {overallStats.engagementScore >= 70 ? 'High' : overallStats.engagementScore >= 40 ? 'Medium' : 'Low'} engagement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">Activity Streak</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overallStats.streakDays}</div>
            <p className="text-xs text-white/60 mt-1">days active</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Quiz Score Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={quizScoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="attempt" stroke="#fff" />
                    <YAxis domain={[0, 100]} stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Best Score</span>
                    <span className={`font-bold ${getScoreColor(overallStats.bestScore)}`}>
                      {overallStats.bestScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Lowest Score</span>
                    <span className={`font-bold ${getScoreColor(overallStats.worstScore)}`}>
                      {overallStats.worstScore}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Total Quizzes</span>
                    <span className="text-white font-bold">{overallStats.totalQuizzesTaken}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Completed</span>
                    <span className="text-white font-bold">{overallStats.totalQuizzesCompleted}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-medium mb-3">Recent Quiz Performance</h4>
                  <div className="space-y-2">
                    {quizScoreTrend.slice(-3).map((quiz, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-white/70 text-sm">{quiz.title}</span>
                        <Badge className={`${getScoreColor(quiz.score)}/20 border-0`}>
                          {quiz.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={engagementData}>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={(entry: any) => entry.color}
                    label={{ position: 'insideStart' }}
                  />
                  <Legend />
                  <Tooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Daily Activity Pattern (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityHeatmap}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#82ca9d"
                    fill="rgba(130, 202, 157, 0.3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Material Access History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {materialData.length === 0 ? (
                  <p className="text-center text-white/50 py-8">No material access recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {materialData.slice(0, 10).map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{material.materialTitle}</p>
                            <p className="text-white/60 text-sm">{material.materialType}</p>
                          </div>
                        </div>
                        <span className="text-white/60 text-sm">
                          {new Date(material.viewedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {detailedRecommendations.map((rec, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(rec.type)}
                      <CardTitle className="text-white text-lg">{rec.title}</CardTitle>
                    </div>
                    <Badge className={getPriorityBadge(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white/80">{rec.description}</p>
                </CardContent>
              </Card>
            ))}

            {recommendations.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI-Generated Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="text-white/80 flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDetailView;
