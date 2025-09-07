-- Schema for EduTrack Learning Portal

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table to store additional user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study materials table
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz questions table
CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'short_answer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz options table (for multiple choice questions)
CREATE TABLE quiz_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz submissions table
CREATE TABLE quiz_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, student_id)
);

-- Create quiz answers table
CREATE TABLE quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES quiz_submissions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE NOT NULL,
  selected_option_id UUID REFERENCES quiz_options(id) ON DELETE CASCADE,
  text_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

-- Create material views tracking table
CREATE TABLE material_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(material_id, student_id)
);

-- Create AI assistant questions table
CREATE TABLE ai_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create functions and triggers

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_questions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Materials policies
CREATE POLICY "Teachers can create materials"
  ON materials FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "Teachers can update their own materials"
  ON materials FOR UPDATE
  USING (teacher_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "Everyone can view materials"
  ON materials FOR SELECT
  USING (true);

-- Quizzes policies
CREATE POLICY "Teachers can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "Teachers can update their own quizzes"
  ON quizzes FOR UPDATE
  USING (teacher_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

CREATE POLICY "Everyone can view quizzes"
  ON quizzes FOR SELECT
  USING (true);

-- Quiz questions policies
CREATE POLICY "Teachers can manage quiz questions"
  ON quiz_questions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quizzes
    WHERE quizzes.id = quiz_id
    AND quizzes.teacher_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  ));

CREATE POLICY "Students can view quiz questions"
  ON quiz_questions FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'student');

-- Quiz options policies
CREATE POLICY "Teachers can manage quiz options"
  ON quiz_options FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quiz_questions
    JOIN quizzes ON quiz_questions.quiz_id = quizzes.id
    WHERE quiz_questions.id = question_id
    AND quizzes.teacher_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher'
  ));

CREATE POLICY "Students can view quiz options"
  ON quiz_options FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'student');

-- Quiz submissions policies
CREATE POLICY "Students can create and view their own submissions"
  ON quiz_submissions FOR ALL
  USING (student_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student');

CREATE POLICY "Teachers can view all submissions"
  ON quiz_submissions FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

-- Quiz answers policies
CREATE POLICY "Students can manage their own answers"
  ON quiz_answers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quiz_submissions
    WHERE quiz_submissions.id = submission_id
    AND quiz_submissions.student_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
  ));

CREATE POLICY "Teachers can view all answers"
  ON quiz_answers FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

-- Material views policies
CREATE POLICY "Students can track their own material views"
  ON material_views FOR ALL
  USING (student_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student');

CREATE POLICY "Teachers can view all material views"
  ON material_views FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');

-- AI questions policies
CREATE POLICY "Students can manage their own AI questions"
  ON ai_questions FOR ALL
  USING (student_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student');

CREATE POLICY "Teachers can view all AI questions"
  ON ai_questions FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'teacher');