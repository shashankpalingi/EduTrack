import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createQuiz, createQuizQuestion, createQuizOption } from '../../lib/supabaseDatabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Save } from 'lucide-react';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer';
  options: QuestionOption[];
}

const QuizCreator = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      text: '',
      type: 'multiple_choice',
      options: [
        { id: `temp-option-${Date.now()}-1`, text: '', isCorrect: false },
        { id: `temp-option-${Date.now()}-2`, text: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [
            ...q.options,
            { id: `temp-option-${Date.now()}`, text: '', isCorrect: false }
          ]
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.filter(o => o.id !== optionId)
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionId: string, field: keyof QuestionOption, value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => {
            if (o.id === optionId) {
              return { ...o, [field]: value };
            }
            return o;
          })
        };
      }
      return q;
    }));
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          options: q.options.map(o => ({
            ...o,
            isCorrect: o.id === optionId
          }))
        };
      }
      return q;
    }));
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return false;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return false;
    }

    for (const question of questions) {
      if (!question.text.trim()) {
        toast.error('All questions must have text');
        return false;
      }

      if (question.type === 'multiple_choice') {
        if (question.options.length < 2) {
          toast.error('Multiple choice questions must have at least 2 options');
          return false;
        }

        if (!question.options.some(o => o.isCorrect)) {
          toast.error('Each multiple choice question must have a correct answer');
          return false;
        }

        for (const option of question.options) {
          if (!option.text.trim()) {
            toast.error('All options must have text');
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('You must be logged in to create a quiz');
      return;
    }

    if (!validateQuiz()) {
      return;
    }

    setIsSaving(true);

    try {
      // Create the quiz
      const quizResult = await createQuiz({
        title,
        description,
        teacher_id: user.id
      });

      if (quizResult.error || !quizResult.data) {
        throw new Error(quizResult.error?.message || 'Failed to create quiz');
      }

      const quizId = quizResult.data.id;

      // Create questions and options
      for (const question of questions) {
        const questionResult = await createQuizQuestion({
          quiz_id: quizId,
          question_text: question.text,
          question_type: question.type
        });

        if (questionResult.error || !questionResult.data) {
          throw new Error(questionResult.error?.message || 'Failed to create question');
        }

        const questionId = questionResult.data.id;

        if (question.type === 'multiple_choice') {
          for (const option of question.options) {
            const optionResult = await createQuizOption({
              question_id: questionId,
              option_text: option.text,
              is_correct: option.isCorrect
            });

            if (optionResult.error) {
              throw new Error(optionResult.error.message || 'Failed to create option');
            }
          }
        }
      }

      toast.success('Quiz created successfully');
      
      // Reset form
      setTitle('');
      setDescription('');
      setQuestions([]);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create Quiz</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Quiz Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            rows={3}
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Questions</h3>
            <Button 
              type="button" 
              onClick={addQuestion}
              variant="outline"
              size="sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
          
          {questions.length === 0 && (
            <div className="text-center py-8 border border-dashed rounded-md">
              <p className="text-gray-500">No questions added yet. Click "Add Question" to start.</p>
            </div>
          )}
          
          {questions.map((question, qIndex) => (
            <div key={question.id} className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Question {qIndex + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`question-${question.id}`}>Question Text</Label>
                <Textarea
                  id={`question-${question.id}`}
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                  placeholder="Enter question text"
                  rows={2}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`question-type-${question.id}`}>Question Type</Label>
                <select
                  id={`question-type-${question.id}`}
                  value={question.type}
                  onChange={(e) => updateQuestion(
                    question.id, 
                    'type', 
                    e.target.value as 'multiple_choice' | 'short_answer'
                  )}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              
              {question.type === 'multiple_choice' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Answer Options</Label>
                    <Button
                      type="button"
                      onClick={() => addOption(question.id)}
                      variant="outline"
                      size="sm"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  
                  {question.options.map((option, oIndex) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`option-${option.id}`}
                        name={`correct-${question.id}`}
                        checked={option.isCorrect}
                        onChange={() => setCorrectOption(question.id, option.id)}
                        className="h-4 w-4"
                      />
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(question.id, option.id, 'text', e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => removeOption(question.id, option.id)}
                        variant="ghost"
                        size="sm"
                        disabled={question.options.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">Select the radio button next to the correct answer</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          type="submit" 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? 'Saving Quiz...' : 'Save Quiz'}
          {!isSaving && <Save className="ml-2 h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default QuizCreator;