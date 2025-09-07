import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import GradientPage from '../components/ui/gradient-page';
import GlassCard from '../components/ui/glass-card';
import MaterialUpload from '../components/teacher/MaterialUpload';
import QuizCreator from '../components/teacher/QuizCreator';
import SubmissionViewer from '../components/teacher/SubmissionViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, BookOpen, CheckSquare, BarChart } from 'lucide-react';

const TeacherDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');

  return (
    <GradientPage>
      <div className="max-w-7xl mx-auto p-6 text-white">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/80">{user?.email}</span>
            <Button variant="outline" onClick={signOut}>Sign Out</Button>
          </div>
        </header>

        <GlassCard>
        <Tabs defaultValue="materials" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="materials" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Study Materials
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Create Quizzes
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center">
              <CheckSquare className="mr-2 h-4 w-4" />
              Student Submissions
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Student Progress
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="materials" className="mt-0">
            <MaterialUpload />
          </TabsContent>
          
          <TabsContent value="quizzes" className="mt-0">
            <QuizCreator />
          </TabsContent>
          
          <TabsContent value="submissions" className="mt-0">
            <SubmissionViewer />
          </TabsContent>
          
          <TabsContent value="progress" className="mt-0">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Student Progress</h2>
              <div className="p-4 rounded-lg border border-white/20">
                <p className="text-center text-white/70">Student progress tracking features coming soon. This will include analytics on quiz performance, material engagement, and learning outcomes.</p>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
        </GlassCard>
      </div>
    </GradientPage>
  );
};

export default TeacherDashboard;