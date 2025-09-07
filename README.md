# EduTrack: Empowering Educational Experiences 🚀

<div align="center">
  
  [![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blueviolet?logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/Vite-Build-purple?logo=vite)](https://vitejs.dev/)
</div>

## 🌟 Our Vision

**Transforming Education for Everyone** - EduTrack is a comprehensive educational platform designed to bridge the gap between teachers and students. With role-based access, intuitive dashboards, and powerful features, we're making education more accessible, engaging, and effective.

## 🎯 Key Features

### 👨‍🏫 Teacher Features
- **Study Material Management**: Upload and organize learning resources
- **Quiz Creation**: Build quizzes with multiple-choice and short-answer questions
- **Student Progress Tracking**: Monitor student performance and engagement
- **Submission Viewing**: Review and evaluate student quiz submissions

### 👨‍🎓 Student Features
- **Material Browser**: Access and download study materials
- **Interactive Quizzes**: Take quizzes and receive immediate feedback
- **Progress Analytics**: Track learning progress with visual charts
- **Performance Metrics**: View scores and improvement over time

### 🔒 Authentication & Security
- **Role-based Access**: Separate dashboards for teachers and students
- **Protected Routes**: Secure access to role-specific features
- **User Profiles**: Personalized user experience

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **Build Tool**: Vite
- **State Management**: React Context API
- **UI Components**: Shadcn/ui
- **Data Visualization**: Recharts

## 🏗️ Project Structure

```
edutrack/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── student/    # Student-specific components
│   │   │   ├── teacher/    # Teacher-specific components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── contexts/       # React context providers
│   │   ├── lib/            # Utility functions and API clients
│   │   └── pages/          # Main application pages
├── supabase/
│   └── schema.sql          # Database schema definition
└── SUPABASE_SETUP.md       # Supabase setup guide
```

## 🎮 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase Account

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/edutrack.git
cd edutrack
```

2. Install dependencies
```bash
cd frontend
npm install  # or yarn install
```

3. Set up environment variables
- Copy `.env.example` to `.env`
- Add your Supabase URL and anon key
```bash
cp .env.example .env
```

4. Set up Supabase
- Follow the instructions in `SUPABASE_SETUP.md`
- Import the database schema from `supabase/schema.sql`

5. Run the development server
```bash
npm run dev  # or yarn dev
```

6. Access the application
- Open your browser and navigate to `http://localhost:5173`
- Sign up as a teacher or student to explore the respective dashboards

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Coming Soon

- AI Assistant for personalized learning support
- Enhanced analytics for teachers
- Mobile-responsive design improvements
- Real-time collaboration features



---

<div align="center">
  <b>Built with ❤️ by the Study Buddy Team</b><br>
  
</div>
