import { supabase } from "../lib/supabaseClient";

export interface AnalyticsData {
  studentId: string;
  studentName: string;
  email: string;
  quizData: QuizAnalytics[];
  materialData: MaterialAnalytics[];
  overallStats: StudentOverallStats;
}

export interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  score: number;
  completed: boolean;
  attemptDate: string;
  timeSpent?: number;
  questionsCorrect: number;
  totalQuestions: number;
}

export interface MaterialAnalytics {
  materialId: string;
  materialTitle: string;
  materialType: string;
  viewedAt: string;
  viewDuration?: number;
  downloadCount?: number;
}

export interface StudentOverallStats {
  totalQuizzesTaken: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalMaterialsViewed: number;
  totalStudyTime: number;
  engagementScore: number;
  progressTrend: 'improving' | 'declining' | 'stable';
  lastActiveDate: string;
  streakDays: number;
  completionRate: number;
}

export interface ClassAnalytics {
  totalStudents: number;
  activeStudents: number;
  averageClassScore: number;
  topPerformers: StudentRanking[];
  strugglingStudents: StudentRanking[];
  quizStatistics: QuizStatistics[];
  materialPopularity: MaterialPopularity[];
  engagementTrends: EngagementTrend[];
  performanceDistribution: PerformanceDistribution;
}

export interface StudentRanking {
  studentId: string;
  studentName: string;
  averageScore: number;
  completionRate: number;
  engagementLevel: 'high' | 'medium' | 'low';
}

export interface QuizStatistics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  mostMissedQuestions: string[];
}

export interface MaterialPopularity {
  materialId: string;
  materialTitle: string;
  totalViews: number;
  uniqueViewers: number;
  averageViewDuration: number;
  downloadCount: number;
}

export interface EngagementTrend {
  date: string;
  activeUsers: number;
  quizAttempts: number;
  materialViews: number;
  totalEngagementScore: number;
}

export interface PerformanceDistribution {
  excellent: number; // 90-100%
  good: number; // 70-89%
  average: number; // 50-69%
  needsImprovement: number; // 0-49%
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics data for all students
   */
  static async getClassAnalytics(teacherId?: string, timeRange: number = 30): Promise<ClassAnalytics> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - timeRange);

    try {
      // Fetch all students
      const { data: students } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student');

      // Fetch quiz submissions
      const { data: quizSubmissions } = await supabase
        .from('quiz_submissions')
        .select(`
          *,
          profiles!inner(full_name, email),
          quizzes!inner(title)
        `)
        .gte('created_at', dateThreshold.toISOString());

      // Fetch material views
      const { data: materialViews } = await supabase
        .from('material_views')
        .select(`
          *,
          profiles!inner(full_name),
          materials!inner(title, file_type)
        `)
        .gte('viewed_at', dateThreshold.toISOString());

      // Calculate analytics
      const totalStudents = students?.length || 0;
      const activeStudents = this.calculateActiveStudents(students || [], quizSubmissions || [], materialViews || []);
      const averageClassScore = this.calculateAverageClassScore(quizSubmissions || []);
      const topPerformers = this.getTopPerformers(students || [], quizSubmissions || []);
      const strugglingStudents = this.getStrugglingStudents(students || [], quizSubmissions || []);
      const quizStatistics = this.calculateQuizStatistics(quizSubmissions || []);
      const materialPopularity = this.calculateMaterialPopularity(materialViews || []);
      const engagementTrends = this.calculateEngagementTrends(quizSubmissions || [], materialViews || [], timeRange);
      const performanceDistribution = this.calculatePerformanceDistribution(quizSubmissions || []);

      return {
        totalStudents,
        activeStudents,
        averageClassScore,
        topPerformers,
        strugglingStudents,
        quizStatistics,
        materialPopularity,
        engagementTrends,
        performanceDistribution,
      };
    } catch (error) {
      console.error('Error fetching class analytics:', error);
      throw error;
    }
  }

  /**
   * Get detailed analytics for a specific student
   */
  static async getStudentAnalytics(studentId: string, timeRange: number = 30): Promise<AnalyticsData | null> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - timeRange);

    try {
      // Fetch student profile
      const { data: student } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (!student) return null;

      // Fetch quiz data
      const { data: quizSubmissions } = await supabase
        .from('quiz_submissions')
        .select(`
          *,
          quizzes!inner(title),
          quiz_answers!inner(is_correct, question_id)
        `)
        .eq('student_id', studentId)
        .gte('created_at', dateThreshold.toISOString());

      // Fetch material data
      const { data: materialViews } = await supabase
        .from('material_views')
        .select(`
          *,
          materials!inner(title, file_type)
        `)
        .eq('student_id', studentId)
        .gte('viewed_at', dateThreshold.toISOString());

      // Process data
      const quizData = this.processQuizData(quizSubmissions || []);
      const materialData = this.processMaterialData(materialViews || []);
      const overallStats = this.calculateOverallStats(quizData, materialData);

      return {
        studentId,
        studentName: student.full_name || student.email,
        email: student.email,
        quizData,
        materialData,
        overallStats,
      };
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      throw error;
    }
  }

  /**
   * Get learning path recommendations for a student
   */
  static async getStudentRecommendations(studentId: string): Promise<string[]> {
    const analytics = await this.getStudentAnalytics(studentId);
    if (!analytics) return [];

    const recommendations: string[] = [];
    const { overallStats, quizData, materialData } = analytics;

    // Performance-based recommendations
    if (overallStats.averageScore < 70) {
      recommendations.push("Consider reviewing fundamental concepts before attempting advanced quizzes");
      recommendations.push("Schedule regular study sessions to improve understanding");
    }

    if (overallStats.completionRate < 80) {
      recommendations.push("Focus on completing started quizzes to improve learning outcomes");
    }

    // Engagement-based recommendations
    if (overallStats.engagementScore < 50) {
      recommendations.push("Increase interaction with course materials for better engagement");
      recommendations.push("Join study groups or discussion forums");
    }

    // Activity-based recommendations
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(overallStats.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity > 7) {
      recommendations.push("Re-engage with the course - it's been a while since your last activity");
    }

    // Material-specific recommendations
    if (materialData.length < 3) {
      recommendations.push("Explore more study materials to enhance your understanding");
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Calculate engagement score based on various factors
   */
  private static calculateEngagementScore(quizData: QuizAnalytics[], materialData: MaterialAnalytics[]): number {
    let score = 0;

    // Quiz engagement (40% of total score)
    const quizEngagement = Math.min((quizData.length / 10) * 40, 40);
    score += quizEngagement;

    // Material engagement (30% of total score)
    const materialEngagement = Math.min((materialData.length / 15) * 30, 30);
    score += materialEngagement;

    // Completion rate (20% of total score)
    const completedQuizzes = quizData.filter(q => q.completed).length;
    const completionRate = quizData.length > 0 ? (completedQuizzes / quizData.length) * 20 : 0;
    score += completionRate;

    // Consistency (10% of total score)
    const consistencyScore = this.calculateConsistencyScore(quizData, materialData) * 10;
    score += consistencyScore;

    return Math.round(Math.min(score, 100));
  }

  /**
   * Calculate consistency score based on activity distribution
   */
  private static calculateConsistencyScore(quizData: QuizAnalytics[], materialData: MaterialAnalytics[]): number {
    const allActivities = [
      ...quizData.map(q => new Date(q.attemptDate)),
      ...materialData.map(m => new Date(m.viewedAt))
    ].sort((a, b) => a.getTime() - b.getTime());

    if (allActivities.length < 2) return 0;

    const daysBetween = (allActivities[allActivities.length - 1].getTime() - allActivities[0].getTime()) / (1000 * 60 * 60 * 24);
    const activeDays = new Set(allActivities.map(date => date.toDateString())).size;

    return daysBetween > 0 ? Math.min(activeDays / daysBetween, 1) : 0;
  }

  private static calculateActiveStudents(students: any[], quizSubmissions: any[], materialViews: any[]): number {
    const activeStudentIds = new Set([
      ...quizSubmissions.map(q => q.student_id),
      ...materialViews.map(m => m.student_id)
    ]);
    return activeStudentIds.size;
  }

  private static calculateAverageClassScore(quizSubmissions: any[]): number {
    const completedQuizzes = quizSubmissions.filter(q => q.completed && q.score != null);
    if (completedQuizzes.length === 0) return 0;

    const totalScore = completedQuizzes.reduce((sum, q) => sum + q.score, 0);
    return Math.round((totalScore / completedQuizzes.length) * 100) / 100;
  }

  private static getTopPerformers(students: any[], quizSubmissions: any[]): StudentRanking[] {
    return students
      .map(student => {
        const studentQuizzes = quizSubmissions.filter(q => q.student_id === student.id && q.completed);
        const averageScore = studentQuizzes.length > 0
          ? studentQuizzes.reduce((sum, q) => sum + q.score, 0) / studentQuizzes.length
          : 0;
        const completionRate = studentQuizzes.length / Math.max(quizSubmissions.filter(q => q.student_id === student.id).length, 1);

        return {
          studentId: student.id,
          studentName: student.full_name || student.email,
          averageScore: Math.round(averageScore * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100,
          engagementLevel: averageScore >= 80 && completionRate >= 0.8 ? 'high' as const :
                         averageScore >= 60 && completionRate >= 0.6 ? 'medium' as const : 'low' as const
        };
      })
      .filter(s => s.averageScore > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
  }

  private static getStrugglingStudents(students: any[], quizSubmissions: any[]): StudentRanking[] {
    return students
      .map(student => {
        const studentQuizzes = quizSubmissions.filter(q => q.student_id === student.id && q.completed);
        const averageScore = studentQuizzes.length > 0
          ? studentQuizzes.reduce((sum, q) => sum + q.score, 0) / studentQuizzes.length
          : 0;
        const completionRate = studentQuizzes.length / Math.max(quizSubmissions.filter(q => q.student_id === student.id).length, 1);

        return {
          studentId: student.id,
          studentName: student.full_name || student.email,
          averageScore: Math.round(averageScore * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100,
          engagementLevel: 'low' as const
        };
      })
      .filter(s => s.averageScore < 60 && s.averageScore > 0)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);
  }

  private static calculateQuizStatistics(quizSubmissions: any[]): QuizStatistics[] {
    const quizGroups = quizSubmissions.reduce((acc, submission) => {
      const quizId = submission.quiz_id;
      if (!acc[quizId]) {
        acc[quizId] = {
          quizId,
          quizTitle: submission.quizzes?.title || 'Unknown Quiz',
          submissions: []
        };
      }
      acc[quizId].submissions.push(submission);
      return acc;
    }, {});

    return Object.values(quizGroups).map((group: any) => {
      const totalAttempts = group.submissions.length;
      const completedAttempts = group.submissions.filter((s: any) => s.completed).length;
      const scores = group.submissions.filter((s: any) => s.completed && s.score != null).map((s: any) => s.score);
      const averageScore = scores.length > 0 ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0;

      let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
      if (averageScore >= 80) difficultyLevel = 'easy';
      else if (averageScore < 60) difficultyLevel = 'hard';

      return {
        quizId: group.quizId,
        quizTitle: group.quizTitle,
        totalAttempts,
        completedAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        difficultyLevel,
        mostMissedQuestions: [] // This would require more complex query
      };
    });
  }

  private static calculateMaterialPopularity(materialViews: any[]): MaterialPopularity[] {
    const materialGroups = materialViews.reduce((acc, view) => {
      const materialId = view.material_id;
      if (!acc[materialId]) {
        acc[materialId] = {
          materialId,
          materialTitle: view.materials?.title || 'Unknown Material',
          views: []
        };
      }
      acc[materialId].views.push(view);
      return acc;
    }, {});

    return Object.values(materialGroups).map((group: any) => ({
      materialId: group.materialId,
      materialTitle: group.materialTitle,
      totalViews: group.views.length,
      uniqueViewers: new Set(group.views.map((v: any) => v.student_id)).size,
      averageViewDuration: 0, // Would need additional tracking
      downloadCount: 0 // Would need additional tracking
    }));
  }

  private static calculateEngagementTrends(quizSubmissions: any[], materialViews: any[], timeRange: number): EngagementTrend[] {
    const trends: { [date: string]: EngagementTrend } = {};

    // Process quiz submissions
    quizSubmissions.forEach(submission => {
      const date = new Date(submission.created_at).toDateString();
      if (!trends[date]) {
        trends[date] = {
          date,
          activeUsers: new Set(),
          quizAttempts: 0,
          materialViews: 0,
          totalEngagementScore: 0
        };
      }
      (trends[date].activeUsers as Set<string>).add(submission.student_id);
      trends[date].quizAttempts++;
    });

    // Process material views
    materialViews.forEach(view => {
      const date = new Date(view.viewed_at).toDateString();
      if (!trends[date]) {
        trends[date] = {
          date,
          activeUsers: new Set(),
          quizAttempts: 0,
          materialViews: 0,
          totalEngagementScore: 0
        };
      }
      (trends[date].activeUsers as Set<string>).add(view.student_id);
      trends[date].materialViews++;
    });

    // Convert to array and calculate engagement scores
    return Object.values(trends).map(trend => ({
      ...trend,
      activeUsers: (trend.activeUsers as Set<string>).size,
      totalEngagementScore: (trend.activeUsers as Set<string>).size * 10 + trend.quizAttempts * 5 + trend.materialViews * 2
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private static calculatePerformanceDistribution(quizSubmissions: any[]): PerformanceDistribution {
    const completedQuizzes = quizSubmissions.filter(q => q.completed && q.score != null);
    const total = completedQuizzes.length;

    if (total === 0) {
      return { excellent: 0, good: 0, average: 0, needsImprovement: 0 };
    }

    const excellent = completedQuizzes.filter(q => q.score >= 90).length;
    const good = completedQuizzes.filter(q => q.score >= 70 && q.score < 90).length;
    const average = completedQuizzes.filter(q => q.score >= 50 && q.score < 70).length;
    const needsImprovement = completedQuizzes.filter(q => q.score < 50).length;

    return {
      excellent: Math.round((excellent / total) * 100),
      good: Math.round((good / total) * 100),
      average: Math.round((average / total) * 100),
      needsImprovement: Math.round((needsImprovement / total) * 100)
    };
  }

  private static processQuizData(quizSubmissions: any[]): QuizAnalytics[] {
    return quizSubmissions.map(submission => ({
      quizId: submission.quiz_id,
      quizTitle: submission.quizzes?.title || 'Unknown Quiz',
      score: submission.score || 0,
      completed: submission.completed,
      attemptDate: submission.created_at,
      timeSpent: 0, // Would need additional tracking
      questionsCorrect: submission.quiz_answers?.filter((a: any) => a.is_correct).length || 0,
      totalQuestions: submission.quiz_answers?.length || 0
    }));
  }

  private static processMaterialData(materialViews: any[]): MaterialAnalytics[] {
    return materialViews.map(view => ({
      materialId: view.material_id,
      materialTitle: view.materials?.title || 'Unknown Material',
      materialType: view.materials?.file_type || 'unknown',
      viewedAt: view.viewed_at,
      viewDuration: 0, // Would need additional tracking
      downloadCount: 0 // Would need additional tracking
    }));
  }

  private static calculateOverallStats(quizData: QuizAnalytics[], materialData: MaterialAnalytics[]): StudentOverallStats {
    const completedQuizzes = quizData.filter(q => q.completed);
    const scores = completedQuizzes.map(q => q.score).filter(s => s > 0);

    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0;
    const completionRate = quizData.length > 0 ? (completedQuizzes.length / quizData.length) * 100 : 0;

    // Calculate progress trend (simplified)
    let progressTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (scores.length >= 3) {
      const recentScores = scores.slice(-3);
      const earlierScores = scores.slice(0, -3);
      if (earlierScores.length > 0) {
        const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const earlierAvg = earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length;
        if (recentAvg > earlierAvg + 5) progressTrend = 'improving';
        else if (recentAvg < earlierAvg - 5) progressTrend = 'declining';
      }
    }

    // Calculate streak days (simplified)
    const allActivities = [
      ...quizData.map(q => new Date(q.attemptDate)),
      ...materialData.map(m => new Date(m.viewedAt))
    ].sort((a, b) => b.getTime() - a.getTime());

    let streakDays = 0;
    if (allActivities.length > 0) {
      const today = new Date();
      let currentDate = new Date(allActivities[0]);

      while (currentDate >= today.setDate(today.getDate() - 30)) { // Check last 30 days
        const dayActivities = allActivities.filter(date =>
          date.toDateString() === currentDate.toDateString()
        );

        if (dayActivities.length > 0) {
          streakDays++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const lastActiveDate = allActivities.length > 0
      ? allActivities[0].toISOString()
      : new Date().toISOString();

    return {
      totalQuizzesTaken: quizData.length,
      totalQuizzesCompleted: completedQuizzes.length,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      worstScore,
      totalMaterialsViewed: materialData.length,
      totalStudyTime: 0, // Would need additional tracking
      engagementScore: this.calculateEngagementScore(quizData, materialData),
      progressTrend,
      lastActiveDate,
      streakDays,
      completionRate: Math.round(completionRate * 100) / 100
    };
  }
}

export default AnalyticsService;
