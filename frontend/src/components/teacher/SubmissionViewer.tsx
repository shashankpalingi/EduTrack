import { useState, useEffect } from 'react';
import { getQuizzes, getQuizSubmissions, getSubmissionAnswers, getProfile } from '../../lib/supabaseDatabase';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, User, FileText } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description?: string;
}

interface Submission {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number | null;
  completed: boolean;
  created_at: string;
  student_name?: string;
  student_email?: string;
}

interface Answer {
  id: string;
  question_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  question_text?: string;
  selected_option_text?: string;
}

const SubmissionViewer = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [submissionAnswers, setSubmissionAnswers] = useState<{[key: string]: Answer[]}>({});
  const [loading, setLoading] = useState(true);

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

  const loadSubmissions = async (quizId: string) => {
    try {
      setLoading(true);
      setSelectedQuizId(quizId);
      setExpandedSubmission(null);
      setSubmissionAnswers({});
      
      const result = await getQuizSubmissions(quizId);
      if (result.error) {
        throw result.error;
      }
      
      const submissionsWithStudentInfo = await Promise.all(
        (result.data || []).map(async (submission) => {
          try {
            const profileResult = await getProfile(submission.student_id);
            return {
              ...submission,
              student_name: profileResult.data?.full_name || 'Unknown',
              student_email: profileResult.data?.email || 'Unknown'
            };
          } catch (error) {
            return {
              ...submission,
              student_name: 'Unknown',
              student_email: 'Unknown'
            };
          }
        })
      );
      
      setSubmissions(submissionsWithStudentInfo);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionAnswers = async (submissionId: string) => {
    if (submissionAnswers[submissionId]) {
      // Already loaded
      setExpandedSubmission(expandedSubmission === submissionId ? null : submissionId);
      return;
    }
    
    try {
      setLoading(true);
      const result = await getSubmissionAnswers(submissionId);
      if (result.error) {
        throw result.error;
      }
      
      setSubmissionAnswers({
        ...submissionAnswers,
        [submissionId]: result.data || []
      });
      setExpandedSubmission(submissionId);
    } catch (error) {
      console.error('Error loading submission answers:', error);
      toast.error('Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 rounded-lg border border-white/10 bg-white/5 text-white">
      <h2 className="text-2xl font-bold mb-6">Student Submissions</h2>
      
      {loading && <p className="text-center py-4">Loading...</p>}
      
      {!loading && quizzes.length === 0 && (
        <div className="text-center py-8 border border-dashed border-white/20 rounded-md">
          <p className="text-white/70">No quizzes found. Create a quiz first.</p>
        </div>
      )}
      
      {!loading && quizzes.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium">Select Quiz</label>
            <select
              value={selectedQuizId || ''}
              onChange={(e) => loadSubmissions(e.target.value)}
              className="w-full p-2 border rounded-md bg-white/5 border-white/20 text-white"
            >
              <option value="">-- Select a quiz --</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>
          
          {selectedQuizId && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Submissions ({submissions.length})
              </h3>
              
              {submissions.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/20 rounded-md">
                  <p className="text-white/70">No submissions for this quiz yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border border-white/10 rounded-md overflow-hidden bg-white/5">
                      <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-white/10"
                        onClick={() => loadSubmissionAnswers(submission.id)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-white/60" />
                            <span className="font-medium">{submission.student_name}</span>
                          </div>
                          <div className="text-sm text-white/70">{submission.student_email}</div>
                          <div className="text-sm">
                            Submitted: {formatDate(submission.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium">
                              Score: {submission.score !== null ? `${submission.score}%` : 'Not graded'}
                            </div>
                            <div className="text-sm text-white/70">
                              Status: {submission.completed ? 'Completed' : 'In Progress'}
                            </div>
                          </div>
                          {expandedSubmission === submission.id ? (
                            <ChevronUp className="h-5 w-5 text-white/60" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-white/60" />
                          )}
                        </div>
                      </div>
                      
                      {expandedSubmission === submission.id && (
                        <div className="p-4 bg-white/5 border-t border-white/10">
                          <h4 className="font-medium mb-3 flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Answers
                          </h4>
                          
                          {submissionAnswers[submission.id]?.length > 0 ? (
                            <div className="space-y-4">
                              {submissionAnswers[submission.id].map((answer, index) => (
                                <div key={answer.id} className="p-3 rounded border border-white/10 bg-white/5">
                                  <div className="font-medium mb-2">Question {index + 1}</div>
                                  <div className="text-sm mb-2">{answer.question_text || 'Question text not available'}</div>
                                  
                                  <div className="text-sm">
                                    <span className="font-medium">Answer: </span>
                                    {answer.text_answer || answer.selected_option_text || 'No answer provided'}
                                  </div>
                                  
                                  {answer.is_correct !== undefined && (
                                    <div className={`text-sm mt-1 ${answer.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                      {answer.is_correct ? 'Correct' : 'Incorrect'}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-white/70 text-sm">No detailed answer information available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubmissionViewer;