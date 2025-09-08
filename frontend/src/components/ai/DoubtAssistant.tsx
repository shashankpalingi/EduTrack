import React, { useState } from "react";
import { Send, Bot, User, Loader2, AlertCircle, BookOpen } from "lucide-react";
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
import aiService, { AIResponse } from "../../services/aiService";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  provider?: string;
}

interface DoubtAssistantProps {
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
];

const gradeLevels = [
  "Elementary",
  "Middle School",
  "High School",
  "College",
  "Advanced",
];

export const DoubtAssistant: React.FC<DoubtAssistantProps> = ({
  className = "",
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hi! I'm your AI doubt assistant. Ask me any question and I'll provide a clear explanation. You can also specify the subject and grade level for more targeted help.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    const question = inputValue.trim();
    setInputValue("");
    setError("");

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if AI service is configured
      if (!aiService.isConfigured()) {
        setError(
          "AI service is not configured. Please add API keys in your environment variables.",
        );
        setIsLoading(false);
        return;
      }

      // Get AI response
      const response: AIResponse = await aiService.explainConcept(
        question,
        selectedSubject === "any" ? undefined : selectedSubject || undefined,
        selectedGrade === "any" ? undefined : selectedGrade || undefined,
      );

      if (response.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: response.content,
          timestamp: new Date(),
          provider: response.provider,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setError(response.error || "Failed to get AI response");
      }
    } catch (err) {
      console.error("Error getting AI response:", err);
      setError(
        "An error occurred while processing your question. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        type: "ai",
        content:
          "Hi! I'm your AI doubt assistant. Ask me any question and I'll provide a clear explanation.",
        timestamp: new Date(),
      },
    ]);
    setError("");
  };

  const configStatus = aiService.getConfigurationStatus();

  return (
    <div className={`max-w-4xl mx-auto p-4 ${className}`}>
      <Card className="h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <CardTitle>AI Doubt Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {configStatus.configured}/{configStatus.total} AI models
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-xs"
              >
                Clear Chat
              </Button>
            </div>
          </div>

          {/* Subject and Grade Level Selectors */}
          <div className="flex gap-2 mt-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Subject (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Subject</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Grade Level (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Level</SelectItem>
                {gradeLevels.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Configuration Warning */}
          {!configStatus.hasAnyProvider && (
            <Alert className="m-4 mb-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No AI providers configured. Please add API keys to your
                environment variables to enable the doubt assistant.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="m-4 mb-0" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 w-full items-start ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`flex-1 min-w-0 overflow-hidden ${
                    message.type === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[85%] ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div
                      className="whitespace-pre-wrap break-words"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        hyphens: "auto",
                      }}
                    >
                      {message.content}
                    </div>
                    {message.provider && (
                      <div className="text-xs opacity-70 mt-1">
                        via {message.provider}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 w-full items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 overflow-hidden flex justify-start">
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-900 max-w-[85%]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="flex-shrink-0 border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask your question here... (e.g., Explain Newton's first law)"
                  className="pr-10"
                  disabled={isLoading || !configStatus.hasAnyProvider}
                />
                <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button
                type="submit"
                disabled={
                  !inputValue.trim() ||
                  isLoading ||
                  !configStatus.hasAnyProvider
                }
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Example questions */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Try:</span>
              {[
                "Explain photosynthesis",
                "What is calculus?",
                "How does gravity work?",
              ].map((example) => (
                <Button
                  key={example}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 py-1 text-xs"
                  onClick={() => setInputValue(example)}
                  disabled={isLoading || !configStatus.hasAnyProvider}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoubtAssistant;
