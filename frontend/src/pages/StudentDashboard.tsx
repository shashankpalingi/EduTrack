import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import MaterialBrowser from '../components/student/MaterialBrowser';
import QuizTaker from '../components/student/QuizTaker';
import ProgressTracker from '../components/student/ProgressTracker';
import { BookOpen, FileQuestion, BarChart3, Bot } from 'lucide-react';

const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{user?.email}</span>
          <Button onClick={signOut} variant="outline">Sign Out</Button>
        </div>
      </div>

      <Tabs defaultValue="materials" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="materials" className="flex items-center gap-2">
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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">AI Learning Assistant</h2>
            <p className="text-gray-600 mb-4">Get help with your studies using our AI assistant.</p>
            <div className="p-6 border border-dashed rounded-lg text-center">
              <p className="text-gray-500">AI Assistant feature coming soon!</p>
              <p className="text-gray-500 mt-2">This feature will allow you to ask questions about your study materials and get instant help.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;