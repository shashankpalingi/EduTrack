import { supabase } from "./supabaseClient";
import { PostgrestError } from "@supabase/supabase-js";

// Types for database operations
export interface Profile {
  id: string;
  email: string;
  role: "student" | "teacher";
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  teacher_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "short_answer";
  created_at?: string;
  updated_at?: string;
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  score?: number;
  completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MaterialView {
  id: string;
  material_id: string;
  student_id: string;
  viewed_at: string;
}

export interface AIQuestion {
  id: string;
  student_id: string;
  question: string;
  answer?: string;
  created_at: string;
}

// Database operation results
export type DbResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

// Profile operations
export async function getProfile(userId: string): Promise<DbResult<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

export async function updateProfile(
  profile: Partial<Profile> & { id: string },
): Promise<DbResult<Profile>> {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profile.id)
    .select()
    .single();

  return { data, error };
}

// Materials operations
export async function getMaterials(): Promise<DbResult<Material[]>> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getMaterial(id: string): Promise<DbResult<Material>> {
  const { data, error } = await supabase
    .from("materials")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function createMaterial(
  material: Omit<Material, "id" | "created_at" | "updated_at">,
): Promise<DbResult<Material>> {
  const { data, error } = await supabase
    .from("materials")
    .insert(material)
    .select()
    .single();

  return { data, error };
}

export async function updateMaterial(
  material: Partial<Material> & { id: string },
): Promise<DbResult<Material>> {
  const { data, error } = await supabase
    .from("materials")
    .update(material)
    .eq("id", material.id)
    .select()
    .single();

  return { data, error };
}

export async function deleteMaterial(id: string): Promise<DbResult<null>> {
  const { error } = await supabase.from("materials").delete().eq("id", id);

  return { data: null, error };
}

// Quiz operations
export async function getQuizzes(): Promise<DbResult<Quiz[]>> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getQuiz(id: string): Promise<DbResult<Quiz>> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

export async function createQuiz(
  quiz: Omit<Quiz, "id" | "created_at" | "updated_at">,
): Promise<DbResult<Quiz>> {
  const { data, error } = await supabase
    .from("quizzes")
    .insert(quiz)
    .select()
    .single();

  return { data, error };
}

export async function updateQuiz(
  quiz: Partial<Quiz> & { id: string },
): Promise<DbResult<Quiz>> {
  const { data, error } = await supabase
    .from("quizzes")
    .update(quiz)
    .eq("id", quiz.id)
    .select()
    .single();

  return { data, error };
}

export async function deleteQuiz(id: string): Promise<DbResult<null>> {
  const { error } = await supabase.from("quizzes").delete().eq("id", id);

  return { data: null, error };
}

// Quiz questions operations
export async function getQuizQuestions(
  quizId: string,
): Promise<DbResult<QuizQuestion[]>> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId);

  return { data, error };
}

export async function createQuizQuestion(
  question: Omit<QuizQuestion, "id" | "created_at" | "updated_at">,
): Promise<DbResult<QuizQuestion>> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert(question)
    .select()
    .single();

  return { data, error };
}

// Quiz options operations
export async function getQuizOptions(
  questionId: string,
): Promise<DbResult<QuizOption[]>> {
  const { data, error } = await supabase
    .from("quiz_options")
    .select("*")
    .eq("question_id", questionId);

  return { data, error };
}

export async function createQuizOption(
  option: Omit<QuizOption, "id" | "created_at" | "updated_at">,
): Promise<DbResult<QuizOption>> {
  const { data, error } = await supabase
    .from("quiz_options")
    .insert(option)
    .select()
    .single();

  return { data, error };
}

// Quiz submissions operations
export async function createQuizSubmission(
  submission: Omit<QuizSubmission, "id" | "created_at" | "updated_at">,
): Promise<DbResult<QuizSubmission>> {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .insert(submission)
    .select()
    .single();

  return { data, error };
}

export async function getStudentSubmissions(
  studentId: string,
): Promise<DbResult<QuizSubmission[]>> {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .select("*")
    .eq("student_id", studentId);

  return { data, error };
}

export async function getQuizSubmissions(
  quizId: string,
): Promise<DbResult<QuizSubmission[]>> {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .select("*")
    .eq("quiz_id", quizId);

  return { data, error };
}

// Quiz answers operations
export async function createQuizAnswer(
  answer: Omit<QuizAnswer, "id" | "created_at" | "updated_at">,
): Promise<DbResult<QuizAnswer>> {
  const { data, error } = await supabase
    .from("quiz_answers")
    .insert(answer)
    .select()
    .single();

  return { data, error };
}

export async function getSubmissionAnswers(
  submissionId: string,
): Promise<DbResult<QuizAnswer[]>> {
  const { data, error } = await supabase
    .from("quiz_answers")
    .select("*")
    .eq("submission_id", submissionId);

  return { data, error };
}

// Material views operations
export async function recordMaterialView(
  materialId: string,
  studentId: string,
): Promise<DbResult<MaterialView>> {
  const { data, error } = await supabase
    .from("material_views")
    .upsert({
      material_id: materialId,
      student_id: studentId,
      viewed_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function getMaterialViews(
  materialId: string,
): Promise<DbResult<MaterialView[]>> {
  const { data, error } = await supabase
    .from("material_views")
    .select("*")
    .eq("material_id", materialId);

  return { data, error };
}

// AI questions operations
export async function createAIQuestion(
  question: Omit<AIQuestion, "id" | "created_at">,
): Promise<DbResult<AIQuestion>> {
  const { data, error } = await supabase
    .from("ai_questions")
    .insert(question)
    .select()
    .single();

  return { data, error };
}

export async function updateAIQuestionAnswer(
  id: string,
  answer: string,
): Promise<DbResult<AIQuestion>> {
  const { data, error } = await supabase
    .from("ai_questions")
    .update({ answer })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function getStudentAIQuestions(
  studentId: string,
): Promise<DbResult<AIQuestion[]>> {
  const { data, error } = await supabase
    .from("ai_questions")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return { data, error };
}

// Get quiz submissions by student with quiz details
export async function getQuizSubmissionsByStudent(
  studentId: string,
): Promise<DbResult<(QuizSubmission & { quiz: { title: string } })[]>> {
  const { data, error } = await supabase
    .from("quiz_submissions")
    .select(
      `
      *,
      quiz:quizzes!inner(title)
    `,
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return { data, error };
}
