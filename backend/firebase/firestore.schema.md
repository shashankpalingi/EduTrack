# EduTrack Firestore Database Schema

## Collections

### users
Stores user profile information for both teachers and students.

```typescript
interface User {
  uid: string;              // Firebase Auth UID
  displayName: string;      // User's display name
  email: string;           // User's email address
  photoURL?: string;       // Profile picture URL
  role: 'teacher' | 'student'; // User role
  bio?: string;            // Short biography
  createdAt: Timestamp;    // Account creation date
  updatedAt: Timestamp;    // Last update date
}
```

### courses
Stores information about courses offered in the platform.

```typescript
interface Course {
  id: string;              // Course ID
  title: string;           // Course title
  description: string;     // Course description
  category: string;        // Course category (e.g., 'STEM', 'Humanities')
  teacherId: string;       // UID of teacher who created the course
  coverImage?: string;     // URL to course cover image
  enrolledStudents: number; // Count of enrolled students
  createdAt: Timestamp;    // Creation date
  updatedAt: Timestamp;    // Last update date
  isPublished: boolean;    // Whether the course is published and visible to students
}
```

### resources
Stores educational resources uploaded by teachers.

```typescript
interface Resource {
  id: string;              // Resource ID
  title: string;           // Resource title
  description: string;     // Resource description
  courseId: string;        // ID of the course this resource belongs to
  teacherId: string;       // UID of teacher who created the resource
  type: 'document' | 'video' | 'link' | 'assignment'; // Resource type
  url: string;             // URL to the resource content
  createdAt: Timestamp;    // Creation date
  updatedAt: Timestamp;    // Last update date
  isPublished: boolean;    // Whether the resource is published and visible to students
}
```

### quizzes
Stores quizzes created by teachers for assessment.

```typescript
interface Quiz {
  id: string;              // Quiz ID
  title: string;           // Quiz title
  description: string;     // Quiz description
  courseId: string;        // ID of the course this quiz belongs to
  teacherId: string;       // UID of teacher who created the quiz
  questions: Question[];   // Array of questions
  timeLimit?: number;      // Time limit in minutes (optional)
  passingScore: number;    // Minimum score to pass (percentage)
  createdAt: Timestamp;    // Creation date
  updatedAt: Timestamp;    // Last update date
  isPublished: boolean;    // Whether the quiz is published and visible to students
}

interface Question {
  id: string;              // Question ID
  text: string;            // Question text
  type: 'multiple-choice' | 'true-false' | 'short-answer'; // Question type
  options?: string[];      // Answer options for multiple-choice questions
  correctAnswer: string | string[]; // Correct answer(s)
  points: number;          // Points awarded for correct answer
}
```

### submissions
Stores student submissions for quizzes and assignments.

```typescript
interface Submission {
  id: string;              // Submission ID
  studentId: string;       // UID of student who submitted
  courseId: string;        // ID of the course
  resourceId?: string;     // ID of the resource (for assignments)
  quizId?: string;         // ID of the quiz (for quizzes)
  answers?: Answer[];      // Array of answers (for quizzes)
  fileUrl?: string;        // URL to submitted file (for assignments)
  score?: number;          // Score achieved (if graded)
  feedback?: string;       // Teacher feedback
  status: 'submitted' | 'graded' | 'returned'; // Submission status
  submittedAt: Timestamp;  // Submission date
  gradedAt?: Timestamp;    // Grading date
}

interface Answer {
  questionId: string;      // Question ID
  answer: string | string[]; // Student's answer
  isCorrect: boolean;      // Whether the answer is correct
  points: number;          // Points awarded
}
```

### enrollments
Stores student enrollments in courses.

```typescript
interface Enrollment {
  id: string;              // Enrollment ID
  studentId: string;       // UID of enrolled student
  courseId: string;        // ID of the course
  enrolledAt: Timestamp;   // Enrollment date
  progress: number;        // Course progress percentage
  lastAccessedAt: Timestamp; // Last access date
  status: 'active' | 'completed' | 'dropped'; // Enrollment status
}
```

### notifications
Stores notifications for users.

```typescript
interface Notification {
  id: string;              // Notification ID
  userId: string;          // UID of user to notify
  title: string;           // Notification title
  message: string;         // Notification message
  type: 'assignment' | 'quiz' | 'feedback' | 'announcement'; // Notification type
  resourceId?: string;     // ID of related resource
  read: boolean;           // Whether notification has been read
  createdAt: Timestamp;    // Creation date
}
```

### ai_interactions
Stores interactions with the AI doubt assistant.

```typescript
interface AIInteraction {
  id: string;              // Interaction ID
  userId: string;          // UID of user
  query: string;           // User's question
  response: string;        // AI's response
  courseId?: string;       // Related course (if applicable)
  resourceId?: string;     // Related resource (if applicable)
  createdAt: Timestamp;    // Creation date
  feedback?: 'helpful' | 'not_helpful'; // User feedback on AI response
}
```

## Security Rules

The following security rules should be implemented:

1. Users can only read and update their own profile data
2. Teachers can create and manage courses, resources, and quizzes
3. Students can only read published courses, resources, and quizzes
4. Students can create and read their own submissions
5. Teachers can read and grade submissions for their courses
6. Users can only read notifications addressed to them
7. AI interactions are private to the user who created them