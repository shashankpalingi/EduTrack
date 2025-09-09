import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  X,
  BookOpen,
  Target,
  Timer,
  Volume2,
  VolumeX,
  Lightbulb,
  Coffee,
  Brain,
  Users,
  MessageSquare,
  Video,
  Save,
  CheckCircle2,
  ExternalLink,
  Globe,
  Headphones,
  Waves,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

// Types
interface PomodoroSession {
  id: string;
  type: "work" | "shortBreak" | "longBreak";
  duration: number;
  completed: boolean;
  startTime?: Date;
  endTime?: Date;
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetHours: number;
  currentHours: number;
  deadline: Date;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  subject: string;
}

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  members: number;
  isActive: boolean;
  lastActivity: Date;
}

const StudyRoom: React.FC = () => {
  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] =
    useState<PomodoroSession["type"]>("work");
  const [sessionCount, setSessionCount] = useState(0);
  const [pomodoroHistory, setPomodoroHistory] = useState<PomodoroSession[]>([]);

  // Study Goals State
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetHours: 1,
    deadline: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Study Groups State
  const [studyGroups] = useState<StudyGroup[]>([
    {
      id: "1",
      name: "Mathematics Study Group",
      subject: "Mathematics",
      members: 12,
      isActive: true,
      lastActivity: new Date(),
    },
    {
      id: "2",
      name: "Physics Discussion",
      subject: "Physics",
      members: 8,
      isActive: false,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "3",
      name: "Chemistry Lab Partners",
      subject: "Chemistry",
      members: 6,
      isActive: true,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    },
  ]);

  // Settings State
  const [settings, setSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    notifications: true,
    darkMode: true,
  });

  // Focus Tools State
  const [ambientSounds, setAmbientSounds] = useState({
    rain: false,
    ocean: false,
    forest: false,
    cafe: false,
  });
  const [whiteNoise, setWhiteNoise] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSessionComplete = React.useCallback(() => {
    setIsRunning(false);
    const completedSession: PomodoroSession = {
      id: Date.now().toString(),
      type: currentSession,
      duration: getDurationByType(currentSession),
      completed: true,
      startTime: new Date(
        Date.now() - getDurationByType(currentSession) * 60 * 1000,
      ),
      endTime: new Date(),
    };

    setPomodoroHistory((prev) => [...prev, completedSession]);

    if (currentSession === "work") {
      setSessionCount((prev) => prev + 1);
      const nextSession =
        (sessionCount + 1) % settings.sessionsUntilLongBreak === 0
          ? "longBreak"
          : "shortBreak";
      setCurrentSession(nextSession);
      setTimeLeft(getDurationByType(nextSession) * 60);
    } else {
      setCurrentSession("work");
      setTimeLeft(settings.workDuration * 60);
    }

    if (settings.soundEnabled) {
      playNotificationSound();
    }
  }, [
    currentSession,
    sessionCount,
    settings.sessionsUntilLongBreak,
    settings.workDuration,
    settings.soundEnabled,
    getDurationByType,
  ]);

  // Pomodoro Timer Logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, handleSessionComplete]);

  const getDurationByType = (type: PomodoroSession["type"]) => {
    switch (type) {
      case "work":
        return settings.workDuration;
      case "shortBreak":
        return settings.shortBreakDuration;
      case "longBreak":
        return settings.longBreakDuration;
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log("Audio context not available");
    }
  };

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationByType(currentSession) * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionIcon = (type: PomodoroSession["type"]) => {
    switch (type) {
      case "work":
        return <Brain className="h-4 w-4" />;
      case "shortBreak":
        return <Coffee className="h-4 w-4" />;
      case "longBreak":
        return <Coffee className="h-4 w-4" />;
    }
  };

  const getSessionColor = (type: PomodoroSession["type"]) => {
    switch (type) {
      case "work":
        return "bg-blue-500";
      case "shortBreak":
        return "bg-green-500";
      case "longBreak":
        return "bg-purple-500";
    }
  };

  // Study Goals Logic
  const addStudyGoal = () => {
    if (!newGoal.title || !newGoal.deadline) return;

    const goal: StudyGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetHours: newGoal.targetHours,
      currentHours: 0,
      deadline: new Date(newGoal.deadline),
      completed: false,
      priority: newGoal.priority,
    };

    setStudyGoals((prev) => [...prev, goal]);
    setNewGoal({
      title: "",
      description: "",
      targetHours: 1,
      deadline: "",
      priority: "medium",
    });
  };

  const updateGoalProgress = (goalId: string, hours: number) => {
    setStudyGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              currentHours: Math.min(
                goal.currentHours + hours,
                goal.targetHours,
              ),
            }
          : goal,
      ),
    );
  };

  const completeGoal = (goalId: string) => {
    setStudyGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, completed: true } : goal,
      ),
    );
  };

  const deleteGoal = (goalId: string) => {
    setStudyGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  // Notes Logic
  const saveNote = () => {
    if (!noteTitle || !noteContent) return;

    const note: Note = {
      id: currentNote?.id || Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      tags: noteTags,
      createdAt: currentNote?.createdAt || new Date(),
      subject: "General",
    };

    if (currentNote) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    } else {
      setNotes((prev) => [...prev, note]);
    }

    clearNoteEditor();
  };

  const clearNoteEditor = () => {
    setCurrentNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteTags([]);
  };

  const editNote = (note: Note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags);
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (currentNote?.id === noteId) {
      clearNoteEditor();
    }
  };

  const addTag = () => {
    if (tagInput && !noteTags.includes(tagInput)) {
      setNoteTags((prev) => [...prev, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setNoteTags((prev) => prev.filter((t) => t !== tag));
  };

  const getPriorityColor = (priority: StudyGoal["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30";
    }
  };

  const toggleAmbientSound = (soundType: keyof typeof ambientSounds) => {
    setAmbientSounds((prev) => ({
      ...prev,
      [soundType]: !prev[soundType],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Study Room</h2>
        <p className="text-white/80">
          Your personal study space with productivity tools
        </p>
      </div>

      <Tabs defaultValue="pomodoro" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pomodoro" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Pomodoro
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Focus Tools
          </TabsTrigger>
        </TabsList>

        {/* Pomodoro Timer Tab */}
        <TabsContent value="pomodoro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Timer className="h-5 w-5" />
                  Pomodoro Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="relative">
                  <div className="text-6xl font-mono font-bold text-white mb-4">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {getSessionIcon(currentSession)}
                    <span className="text-white capitalize">
                      {currentSession === "shortBreak"
                        ? "Short Break"
                        : currentSession === "longBreak"
                          ? "Long Break"
                          : "Work Session"}
                    </span>
                  </div>
                  <Progress
                    value={
                      (1 -
                        timeLeft / (getDurationByType(currentSession) * 60)) *
                      100
                    }
                    className="w-full h-2 mb-4"
                  />
                </div>

                <div className="flex justify-center gap-4">
                  {!isRunning ? (
                    <Button
                      onClick={startTimer}
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTimer}
                      size="lg"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {sessionCount}
                    </div>
                    <div className="text-sm text-white/70">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.floor(
                        (pomodoroHistory.filter((s) => s.type === "work")
                          .length *
                          settings.workDuration) /
                          60,
                      )}
                      h
                    </div>
                    <div className="text-sm text-white/70">Study Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {
                        pomodoroHistory.filter(
                          (s) => s.completed && s.type === "work",
                        ).length
                      }
                    </div>
                    <div className="text-sm text-white/70">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Session History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pomodoroHistory
                    .slice(-10)
                    .reverse()
                    .map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-2 rounded bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getSessionColor(session.type)}`}
                          ></div>
                          <span className="text-white capitalize text-sm">
                            {session.type === "shortBreak"
                              ? "Short Break"
                              : session.type === "longBreak"
                                ? "Long Break"
                                : "Work"}
                          </span>
                        </div>
                        <div className="text-white/70 text-sm">
                          {session.endTime?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                  {pomodoroHistory.length === 0 && (
                    <div className="text-center text-white/50 py-8">
                      Start your first study session!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Study Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Add New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Goal title"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Target hours"
                    min="1"
                    value={newGoal.targetHours}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        targetHours: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <select
                  value={newGoal.priority}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      priority: e.target.value as "high" | "medium" | "low",
                    }))
                  }
                  className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <Button onClick={addStudyGoal} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Current Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {studyGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-4 rounded-lg border ${goal.completed ? "bg-green-500/10 border-green-500/30" : "bg-white/5 border-white/20"}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">
                          {goal.title}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteGoal(goal.id)}
                            className="text-red-400 hover:text-red-300 p-1 h-auto"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {goal.description && (
                        <p className="text-white/70 text-sm mb-2">
                          {goal.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Progress</span>
                          <span className="text-white">
                            {goal.currentHours}h / {goal.targetHours}h
                          </span>
                        </div>
                        <Progress
                          value={(goal.currentHours / goal.targetHours) * 100}
                          className="h-2"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">
                            Due: {goal.deadline.toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateGoalProgress(goal.id, 0.5)}
                              disabled={goal.completed}
                              className="text-xs"
                            >
                              +30min
                            </Button>
                            {goal.currentHours >= goal.targetHours &&
                              !goal.completed && (
                                <Button
                                  size="sm"
                                  onClick={() => completeGoal(goal.id)}
                                  className="text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {studyGoals.length === 0 && (
                    <div className="text-center text-white/50 py-8">
                      Set your first study goal to get started!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  {currentNote ? "Edit Note" : "Create New Note"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Note title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Textarea
                  placeholder="Write your notes here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={8}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="bg-white/10 border-white/20 text-white flex-1 placeholder:text-white/50"
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {noteTags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                      >
                        {tag}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveNote} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {currentNote ? "Update Note" : "Save Note"}
                  </Button>
                  {currentNote && (
                    <Button onClick={clearNoteEditor} variant="outline">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">My Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white">{note.title}</h4>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editNote(note)}
                            className="text-blue-400 hover:text-blue-300 p-1 h-auto"
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNote(note.id)}
                            className="text-red-400 hover:text-red-300 p-1 h-auto"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm mb-2 line-clamp-3">
                        {note.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-white/50">
                        {note.createdAt.toLocaleDateString()}{" "}
                        {note.createdAt.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center text-white/50 py-8">
                      Create your first note to get started!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Study Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyGroups.map((group) => (
              <Card
                key={group.id}
                className="bg-white/10 backdrop-blur-sm border-white/20"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                      {group.name}
                    </CardTitle>
                    <div
                      className={`w-3 h-3 rounded-full ${group.isActive ? "bg-green-500" : "bg-gray-500"}`}
                    ></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-white/70" />
                      <span className="text-white/70">{group.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-white/70" />
                      <span className="text-white/70">
                        {group.members} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-white/70" />
                      <span className="text-white/70">
                        Last active:{" "}
                        {group.lastActivity.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 flex items-center gap-2"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Video className="h-3 w-3" />
                      Meet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">
                Create New Study Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70">
                Join or create study groups to collaborate with peers and
                enhance your learning experience.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Study Group
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Focus Tools Tab */}
        <TabsContent value="focus" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ambient Sounds */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Ambient Sounds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={ambientSounds.rain ? "default" : "outline"}
                    onClick={() => toggleAmbientSound("rain")}
                    className="flex items-center gap-2"
                  >
                    <Waves className="h-4 w-4" />
                    Rain
                  </Button>
                  <Button
                    variant={ambientSounds.ocean ? "default" : "outline"}
                    onClick={() => toggleAmbientSound("ocean")}
                    className="flex items-center gap-2"
                  >
                    <Waves className="h-4 w-4" />
                    Ocean
                  </Button>
                  <Button
                    variant={ambientSounds.forest ? "default" : "outline"}
                    onClick={() => toggleAmbientSound("forest")}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Forest
                  </Button>
                  <Button
                    variant={ambientSounds.cafe ? "default" : "outline"}
                    onClick={() => toggleAmbientSound("cafe")}
                    className="flex items-center gap-2"
                  >
                    <Coffee className="h-4 w-4" />
                    Café
                  </Button>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <Button
                    variant={whiteNoise ? "default" : "outline"}
                    onClick={() => setWhiteNoise(!whiteNoise)}
                    className="w-full flex items-center gap-2"
                  >
                    {whiteNoise ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                    White Noise
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* StudyBuddy Website Integration */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  StudyBuddy Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/70 text-sm">
                  Access your complete StudyBuddy toolkit with advanced study
                  features and collaboration tools.
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full flex items-center gap-2"
                    onClick={() =>
                      window.open("https://studybuddy08.netlify.app/", "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open StudyBuddy Website
                  </Button>
                  <div className="text-xs text-white/50 text-center">
                    Opens in a new tab
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Focus Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Dark Mode</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          darkMode: !prev.darkMode,
                        }))
                      }
                    >
                      {settings.darkMode ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Sound Notifications</span>
                    <Button
                      variant={settings.soundEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          soundEnabled: !prev.soundEnabled,
                        }))
                      }
                    >
                      {settings.soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm">
                      Work Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          workDuration: parseInt(e.target.value) || 25,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm">
                      Break Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          shortBreakDuration: parseInt(e.target.value) || 5,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* StudyBuddy Embedded Preview */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  StudyBuddy Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
                  <iframe
                    src="https://studybuddy08.netlify.app/"
                    className="w-full h-full rounded-lg"
                    title="StudyBuddy Tools"
                    allow="fullscreen"
                    style={{ minHeight: "400px" }}
                  />
                </div>
                <div className="mt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open("https://studybuddy08.netlify.app/", "_blank")
                    }
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open Full Screen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyRoom;
