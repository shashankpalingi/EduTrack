import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import GradientPage from "../components/ui/gradient-page";
import GlassCard from "../components/ui/glass-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import MaterialBrowser from "../components/student/MaterialBrowser";
import QuizTaker from "../components/student/QuizTaker";
import ProgressTracker from "../components/student/ProgressTracker";
import DoubtAssistant from "../components/ai/DoubtAssistant";
import { BookOpen, FileQuestion, BarChart3, Bot, Users } from "lucide-react";

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("materials");

  return (
    <GradientPage>
      <div className="container mx-auto p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/80">{user?.email}</span>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        <GlassCard>
          <Tabs
            defaultValue="materials"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger
                value="materials"
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                <span>Study Materials</span>
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                <span>Quizzes</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span>AI Assistant</span>
              </TabsTrigger>
              <TabsTrigger
                value="studyroom"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Study Room</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials">
              <MaterialBrowser />
            </TabsContent>

            <TabsContent value="quizzes">
              <QuizTaker />
            </TabsContent>

            <TabsContent value="progress">
              <ProgressTracker />
            </TabsContent>

            <TabsContent value="ai">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    AI Study Assistant
                  </h2>
                  <p className="text-white/80">
                    Ask any question and get instant, clear explanations to help
                    with your studies
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <DoubtAssistant className="[&_.max-w-4xl]:max-w-none" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="studyroom">
              <GlassCard className="p-0 overflow-hidden">
                <div className="h-[70vh] w-full">
                  <iframe
                    src="https://studybuddy08.netlify.app/"
                    title="Study Room"
                    className="w-full h-full border-0"
                    allow="clipboard-write; microphone; camera; fullscreen; autoplay"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </GlassCard>
      </div>
    </GradientPage>
  );
};

export default StudentDashboard;
