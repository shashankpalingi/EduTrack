import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getQuizzes, getQuiz, getQuizQuestions, getQuizOptions, createQuizSubmission, createQuizAnswer } from '../../lib/supabaseDatabase';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  teacher_id: string;
  created_at?: string;
}

interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_answer';
}

interface Option {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
}

interface Answer {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
}

const QuizTaker = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionOptions, setQuestionOptions] = useState<{[key: string]: Option[]}>({});
  const [answers, setAnswers] = useState<{[key: string]: Answer}>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const result = await getQuizzes();
      if (result.error) {
        throw result.error;
      }
      setQuizzes(result.data || []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      setSelectedQuizId(quizId);
      setQuizStarted(false);
      setQuizCompleted(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setScore(null);
      
      // Get quiz details
      const quizResult = await getQuiz(quizId);
      if (quizResult.error || !quizResult.data) {
        throw quizResult.error || new Error('Failed to load quiz');
      }
      setCurrentQuiz(quizResult.data);
      
      // Get quiz questions
      const questionsResult = await getQuizQuestions(quizId);
      if (questionsResult.error) {
        throw questionsResult.error;
      }
      setQuestions(questionsResult.data || []);
      
      // Get options for each question
      const optionsMap: {[key: string]: Option[]} = {};
      for (const question of questionsResult.data || []) {
        if (question.question_type === 'multiple_choice') {
          const optionsResult = await getQuizOptions(question.id);
          if (!optionsResult.error && optionsResult.data) {
            optionsMap[question.id] = optionsResult.data;
          }
        }
      }
      setQuestionOptions(optionsMap);
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz details');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (questions.length === 0) {
      toast.error('This quiz has no questions');
      return;
    }
    setQuizStarted(true);
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: {
        questionId,
        selectedOptionId: optionId
      }
    });
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setAnswers({
      ...answers,
      [questionId]: {
        questionId,
        textAnswer: text
      }
    });
  };

  const goToNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Validate answer
    if (!answers[currentQuestion.id]) {
      toast.error('Please answer the question before proceeding');
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question, show summary
      setQuizCompleted(true);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = questions.length;
    
    for (const question of questions) {
      const answer = answers[question.id];
      if (!answer) continue;
      
      if (question.question_type === 'multiple_choice' && answer.selectedOptionId) {
        const options = questionOptions[question.id] || [];
        const selectedOption = options.find(o => o.id === answer.selectedOptionId);
        if (selectedOption?.is_correct) {
          correctAnswers++;
        }
      }
      // For short answer questions, we can't automatically score them
    }
    
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const submitQuiz = async () => {
    if (!user?.id || !currentQuiz) {
      toast.error('You must be logged in to submit a quiz');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Calculate score
      const calculatedScore = calculateScore();
      setScore(calculatedScore);
      
      // Create submission
      const submissionResult = await createQuizSubmission({
        quiz_id: currentQuiz.id,
        student_id: user.id,
        score: calculatedScore,
        completed: true
      });
      
      if (submissionResult.error || !submissionResult.data) {
        throw submissionResult.error || new Error('Failed to create submission');
      }
      
      const submissionId = submissionResult.data.id;
      
      // Create answers
      for (const question of questions) {
        const answer = answers[question.id];
        if (!answer) continue;
        
        let isCorrect: boolean | undefined;
        
        if (question.question_type === 'multiple_choice' && answer.selectedOptionId) {
          const options = questionOptions[question.id] || [];
          const selectedOption = options.find(o => o.id === answer.selectedOptionId);
          isCorrect = selectedOption?.is_correct;
          
          await createQuizAnswer({
            submission_id: submissionId,
            question_id: question.id,
            selected_option_id: answer.selectedOptionId,
            is_correct: isCorrect
          });
        } else if (question.question_type === 'short_answer' && answer.textAnswer) {
          await createQuizAnswer({
            submission_id: submissionId,
            question_id: question.id,
            text_answer: answer.textAnswer
          });
        }
      }
      
      toast.success('Quiz submitted successfully');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setSelectedQuizId(null);
    setCurrentQuiz(null);
    setQuestions([]);
    setQuestionOptions({});
    setAnswers({});
    setCurrentQuestionIndex(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setScore(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };

  const renderQuestion = () => {
    if (!quizStarted || questions.length === 0) return null;
    
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id] || {};
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <div className="text-sm text-white/70">
            {currentQuestion.question_type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}
          </div>
        </div>
        
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-lg">{currentQuestion.question_text}</p>
        </div>
        
        {currentQuestion.question_type === 'multiple_choice' && (
          <div className="space-y-3">
            {(questionOptions[currentQuestion.id] || []).map((option) => (
              <div 
                key={option.id} 
                className={`p-3 border rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 border-white/20 ${answer.selectedOptionId === option.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
              >
                {option.option_text}
              </div>
            ))}
          </div>
        )}
        
        {currentQuestion.question_type === 'short_answer' && (
          <textarea
            value={answer.textAnswer || ''}
            onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-3 border rounded-lg h-32 bg-white/5 border-white/20"
          />
        )}
        
        <div className="flex justify-between pt-4">
          <Button
            onClick={goToPreviousQuestion}
            variant="outline"
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={goToNextQuestion}>
              Next
            </Button>
          ) : (
            <Button onClick={goToNextQuestion} variant="default">
              Finish
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderQuizSummary = () => {
    if (!quizCompleted) return null;
    
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length;
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Quiz Summary</h3>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-medium">Questions Answered</p>
              <p className="text-2xl font-bold">{answeredQuestions} / {totalQuestions}</p>
            </div>
            
            {score !== null && (
              <div className="text-right">
                <p className="font-medium">Your Score</p>
                <p className="text-2xl font-bold">{score}%</p>
              </div>
            )}
          </div>
          
          {answeredQuestions < totalQuestions && (
            <div className="flex items-center text-amber-400 mb-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>You haven't answered all questions. Unanswered questions will be marked as incorrect.</p>
            </div>
          )}
          
          <div className="space-y-4 mt-6">
            <h4 className="font-medium">Question Summary</h4>
            
            {questions.map((question, index) => {
              const answer = answers[question.id];
              let status = 'unanswered';
              
              if (answer) {
                if (question.question_type === 'multiple_choice' && answer.selectedOptionId) {
                  const options = questionOptions[question.id] || [];
                  const selectedOption = options.find(o => o.id === answer.selectedOptionId);
                  status = selectedOption?.is_correct ? 'correct' : 'incorrect';
                } else if (question.question_type === 'short_answer' && answer.textAnswer) {
                  status = 'answered';
                }
              }
              
              return (
                <div key={question.id} className="flex items-center">
                  <div className="mr-3">
                    {status === 'correct' && <CheckCircle className="h-5 w-5 text-green-400" />}
                    {status === 'incorrect' && <XCircle className="h-5 w-5 text-red-400" />}
                    {status === 'answered' && <Clock className="h-5 w-5 text-amber-400" />}
                    {status === 'unanswered' && <AlertCircle className="h-5 w-5 text-white/40" />}
                  </div>
                  <div>
                    <p className="font-medium">Question {index + 1}</p>
                    <p className="text-sm text-white/70 truncate">{question.question_text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button onClick={resetQuiz} variant="outline">
            Take Another Quiz
          </Button>
          
          <Button 
            onClick={submitQuiz} 
            disabled={submitting}
            variant="default"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 rounded-lg border border-white/10 bg-white/5 text-white">
      <h2 className="text-2xl font-bold mb-6">Quizzes</h2>
      
      {loading && <p className="text-center py-4">Loading...</p>}
      
      {!loading && !selectedQuizId && (
        <div>
          {quizzes.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/20 rounded-md">
              <p className="text-white/70">No quizzes available yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Quizzes</h3>
              
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="border border-white/10 rounded-lg p-4 bg-white/5 cursor-pointer hover:bg-white/10"
                  onClick={() => loadQuiz(quiz.id)}
                >
                  <h4 className="font-medium text-lg">{quiz.title}</h4>
                  {quiz.description && (
                    <p className="text-white/80 mt-1">{quiz.description}</p>
                  )}
                  <p className="text-sm text-white/70 mt-2">
                    Created: {formatDate(quiz.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {!loading && selectedQuizId && currentQuiz && !quizStarted && !quizCompleted && (
        <div className="space-y-6">
          <div className="flex items-center">
            <Button 
              onClick={resetQuiz} 
              variant="ghost" 
              size="sm"
              className="mr-4"
            >
              ← Back to Quizzes
            </Button>
            <h3 className="text-xl font-semibold">{currentQuiz.title}</h3>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            {currentQuiz.description && (
              <p className="mb-4">{currentQuiz.description}</p>
            )}
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Questions</p>
                <p className="text-2xl font-bold">{questions.length}</p>
              </div>
              
              <Button onClick={startQuiz}>
                Start Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {renderQuestion()}
      {renderQuizSummary()}
    </div>
  );
};

export default QuizTaker;