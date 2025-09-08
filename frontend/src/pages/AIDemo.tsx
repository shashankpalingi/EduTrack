import React, { useState } from 'react';
import { Brain, MessageCircle, Settings, BookOpen, Users, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import DoubtAssistant from '../components/ai/DoubtAssistant';
import QuizGenerator from '../components/ai/QuizGenerator';
import AIConfiguration from '../components/ai/AIConfiguration';

interface AIDemoProps {
  className?: string;
}

const AIDemo: React.FC<AIDemoProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: MessageCircle,
      title: 'Doubt Assistant',
      description: 'Students can ask questions in plain English and get clear, educational explanations',
      benefits: [
        '24/7 availability for student queries',
        'Subject-specific explanations',
        'Grade-level appropriate responses',
        'Multiple AI providers for reliability'
      ]
    },
    {
      icon: Brain,
      title: 'Quiz Generator',
      description: 'Teachers can generate multiple-choice quizzes on any topic automatically',
      benefits: [
        'Instant quiz creation',
        'Customizable difficulty levels',
        'Detailed explanations for answers',
        'Export functionality for reuse'
      ]
    },
    {
      icon: Settings,
      title: 'Multi-Provider Support',
      description: 'Supports multiple AI providers with automatic fallback for maximum reliability',
      benefits: [
        'Google Gemini (most generous free tier)',
        'Hugging Face (free community models)',
        'Cohere (free tier available)',
        'OpenAI (premium option)'
      ]
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI-Powered Education</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Enhance your educational platform with intelligent doubt resolution and automated quiz generation
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-sm">
              <BookOpen className="h-3 w-3 mr-1" />
              For Students
            </Badge>
            <Badge variant="outline" className="text-sm">
              <GraduationCap className="h-3 w-3 mr-1" />
              For Teachers
            </Badge>
            <Badge variant="outline" className="text-sm">
              Free AI Models
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="doubt-assistant">Doubt Assistant</TabsTrigger>
            <TabsTrigger value="quiz-generator">Quiz Generator</TabsTrigger>
            <TabsTrigger value="configuration">Setup</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Start Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-xl">Quick Start Guide</CardTitle>
                <p className="text-gray-600">Get started with AI features in 3 simple steps</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      1
                    </div>
                    <h3 className="font-semibold mb-2">Configure AI Provider</h3>
                    <p className="text-sm text-gray-600">
                      Sign up for Google Gemini (free) and add your API key to environment variables
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      2
                    </div>
                    <h3 className="font-semibold mb-2">Test Connection</h3>
                    <p className="text-sm text-gray-600">
                      Use the configuration tab to verify your API keys are working correctly
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                      3
                    </div>
                    <h3 className="font-semibold mb-2">Start Using</h3>
                    <p className="text-sm text-gray-600">
                      Begin using the doubt assistant and quiz generator with your students
                    </p>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <Button onClick={() => setActiveTab('configuration')} size="lg">
                    <Settings className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">For Students</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Instant Doubt Resolution</p>
                        <p className="text-sm text-gray-600">Get explanations anytime, anywhere</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Personalized Learning</p>
                        <p className="text-sm text-gray-600">Explanations tailored to your grade level</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Multiple Subjects</p>
                        <p className="text-sm text-gray-600">Support across all academic subjects</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">For Teachers</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Automated Quiz Creation</p>
                        <p className="text-sm text-gray-600">Generate quizzes in seconds, not hours</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Settings className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Customizable Difficulty</p>
                        <p className="text-sm text-gray-600">Adjust complexity for different student levels</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Detailed Explanations</p>
                        <p className="text-sm text-gray-600">Every answer comes with clear explanations</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Doubt Assistant Tab */}
          <TabsContent value="doubt-assistant">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">AI Doubt Assistant</h2>
                <p className="text-gray-600 mb-6">
                  Students can ask questions in plain English and receive clear, educational explanations
                </p>
              </div>
              <DoubtAssistant />
            </div>
          </TabsContent>

          {/* Quiz Generator Tab */}
          <TabsContent value="quiz-generator">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">AI Quiz Generator</h2>
                <p className="text-gray-600 mb-6">
                  Teachers can generate comprehensive quizzes on any topic with customizable settings
                </p>
              </div>
              <QuizGenerator />
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration">
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">AI Configuration</h2>
                <p className="text-gray-600 mb-6">
                  Set up your AI providers to enable intelligent features
                </p>
              </div>
              <AIConfiguration />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIDemo;
