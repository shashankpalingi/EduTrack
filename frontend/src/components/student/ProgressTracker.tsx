import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getQuizSubmissionsByStudent } from '../../lib/supabaseDatabase';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  completed: boolean;
  created_at: string;
  quiz: {
    title: string;
  };
}

const ProgressTracker = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageScore, setAverageScore] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(0);
  const [scoreDistribution, setScoreDistribution] = useState<{name: string; count: number}[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  useEffect(() => {
    if (user?.id) {
      loadSubmissions();
    }
  }, [user]);

  const loadSubmissions = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const result = await getQuizSubmissionsByStudent(user.id);
      
      if (result.error) {
        throw result.error;
      }
      
      const submissionsData = result.data || [];
      setSubmissions(submissionsData);
      
      // Calculate statistics
      if (submissionsData.length > 0) {
        // Average score
        const totalScore = submissionsData.reduce((sum, sub) => sum + sub.score, 0);
        setAverageScore(Math.round(totalScore / submissionsData.length));
        
        // Completed quizzes
        setCompletedQuizzes(submissionsData.filter(sub => sub.completed).length);
        
        // Score distribution
        const distribution = [
          { name: '0-20%', count: 0 },
          { name: '21-40%', count: 0 },
          { name: '41-60%', count: 0 },
          { name: '61-80%', count: 0 },
          { name: '81-100%', count: 0 },
        ];
        
        submissionsData.forEach(sub => {
          if (sub.score <= 20) distribution[0].count++;
          else if (sub.score <= 40) distribution[1].count++;
          else if (sub.score <= 60) distribution[2].count++;
          else if (sub.score <= 80) distribution[3].count++;
          else distribution[4].count++;
        });
        
        setScoreDistribution(distribution);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load your progress data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="p-6 text-center">Loading your progress data...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center">Please log in to view your progress.</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-gray-500">You haven't completed any quizzes yet.</p>
          <p className="text-gray-500 mt-2">Take some quizzes to see your progress here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Average Score</p>
          <p className="text-3xl font-bold">{averageScore}%</p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Quizzes Completed</p>
          <p className="text-3xl font-bold">{completedQuizzes}</p>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">Latest Score</p>
          <p className="text-3xl font-bold">
            {submissions.length > 0 ? `${submissions[0].score}%` : 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Score Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Performance Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={submissions.slice().reverse().map(sub => ({
                  name: sub.quiz.title.substring(0, 15) + (sub.quiz.title.length > 15 ? '...' : ''),
                  score: sub.score
                })).slice(0, 5)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Quiz History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{submission.quiz.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(submission.created_at)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{submission.score}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${submission.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {submission.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;