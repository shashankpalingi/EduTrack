import React, { useState } from "react";
import {
  Brain,
  Download,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import aiService, {
  QuizQuestion,
  QuizGenerationResponse,
} from "../../services/aiService";

interface QuizGeneratorProps {
  className?: string;
}

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Psychology",
  "Art",
  "Music",
  "Philosophy",
  "Literature",
  "Environmental Science",
];

const difficultyLevels = [
  {
    value: "easy",
    label: "Easy",
    description: "Basic concepts and definitions",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Applied knowledge and understanding",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Critical thinking and analysis",
  },
  { value: "expert", label: "Expert", description: "Advanced problem-solving" },
];

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({
  className = "",
}) => {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for the quiz");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedQuiz([]);

    try {
      // Check if AI service is configured
      if (!aiService.isConfigured()) {
        setError(
          "AI service is not configured. Please add API keys in your environment variables.",
        );
        setIsGenerating(false);
        return;
      }

      const fullTopic =
        subject && subject !== "any" ? `${subject}: ${topic}` : topic;
      const response: QuizGenerationResponse = await aiService.generateQuiz(
        fullTopic,
        numQuestions,
        difficulty,
      );

      if (response.success && response.questions.length > 0) {
        setGeneratedQuiz(response.questions);
        setProvider(response.provider);
      } else {
        setError(response.error || "Failed to generate quiz questions");
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(
        "An error occurred while generating the quiz. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const exportQuiz = () => {
    if (generatedQuiz.length === 0) return;

    const quizData = {
      topic: topic,
      subject: subject,
      difficulty: difficulty,
      numberOfQuestions: numQuestions,
      generatedAt: new Date().toISOString(),
      provider: provider,
      questions: generatedQuiz,
    };

    const blob = new Blob([JSON.stringify(quizData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz-${topic.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const configStatus = aiService.getConfigurationStatus();

  return (
    <div className={`max-w-6xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <CardTitle>AI Quiz Generator</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {configStatus.configured}/{configStatus.total} AI models
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle className="text-lg">Quiz Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Configuration Warning */}
            {!configStatus.hasAnyProvider && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No AI providers configured. Please add API keys to enable quiz
                  generation.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Topic Input */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Textarea
                id="topic"
                placeholder="e.g., Newton's Laws of Motion, World War II, Photosynthesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                disabled={isGenerating}
              />
            </div>

            {/* Subject Selection */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Select
                value={subject}
                onValueChange={setSubject}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Subject</SelectItem>
                  {subjects.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-gray-500">
                          {level.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Number of Questions */}
            <div className="space-y-2">
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Select
                value={numQuestions.toString()}
                onValueChange={(value) => setNumQuestions(parseInt(value))}
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 10, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} questions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={
                !topic.trim() || isGenerating || !configStatus.hasAnyProvider
              }
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>

            {/* Export Button */}
            {generatedQuiz.length > 0 && (
              <Button
                onClick={exportQuiz}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Quiz
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quiz Display Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Generated Quiz</CardTitle>
              {provider && (
                <Badge variant="secondary" className="text-xs">
                  Generated by {provider}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedQuiz.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg mb-2">No quiz generated yet</p>
                <p className="text-sm">
                  Configure your quiz settings and click "Generate Quiz" to
                  create questions
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quiz Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Quiz Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Topic:</span> {topic}
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span>{" "}
                      {subject || "Any"}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>{" "}
                      {difficulty}
                    </div>
                    <div>
                      <span className="font-medium">Questions:</span>{" "}
                      {generatedQuiz.length}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Questions */}
                <div className="space-y-6">
                  {generatedQuiz.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="mb-4">
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="mt-1">
                            Q{index + 1}
                          </Badge>
                          <h4 className="font-medium text-lg flex-1">
                            {question.question}
                          </h4>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`flex items-center gap-2 p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {optionIndex === question.correctAnswer ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <div className="w-4 h-4 border border-gray-300 rounded-full" />
                              )}
                            </div>
                            <span className="font-medium text-sm mr-2">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <span className="flex-1">{option}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sm text-blue-800 mb-1">
                              Explanation:
                            </p>
                            <p className="text-sm text-blue-700">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuizGenerator;
