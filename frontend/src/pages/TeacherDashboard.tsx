import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import GradientPage from "../components/ui/gradient-page";
import GlassCard from "../components/ui/glass-card";
import MaterialUpload from "../components/teacher/MaterialUpload";
import QuizCreator from "../components/teacher/QuizCreator";
import SubmissionViewer from "../components/teacher/SubmissionViewer";
import StudentProgress from "../components/teacher/StudentProgress";
import QuizGenerator from "../components/ai/QuizGenerator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { FileText, BookOpen, CheckSquare, BarChart, Brain } from "lucide-react";

const TeacherDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("materials");

  return (
    <GradientPage>
      <div className="max-w-7xl mx-auto p-6 text-white">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/80">{user?.email}</span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </header>

        <GlassCard>
          <Tabs
            defaultValue="materials"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="materials" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Study Materials
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Create Quizzes
              </TabsTrigger>
              <TabsTrigger value="ai-quiz" className="flex items-center">
                <Brain className="mr-2 h-4 w-4" />
                AI Quiz Generator
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

            <TabsContent value="ai-quiz" className="mt-0">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    AI Quiz Generator
                  </h2>
                  <p className="text-white/80">
                    Generate comprehensive quizzes instantly using AI on any
                    topic
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <QuizGenerator className="[&_.max-w-6xl]:max-w-none" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="mt-0">
              <SubmissionViewer />
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <StudentProgress />
            </TabsContent>
          </Tabs>
        </GlassCard>
      </div>
    </GradientPage>
  );
};

export default TeacherDashboard;
