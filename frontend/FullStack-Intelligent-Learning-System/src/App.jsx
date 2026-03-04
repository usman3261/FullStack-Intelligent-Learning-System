import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; 

// Layout & Auth
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute'; 

// Pages
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage'; 
import DashboardPage from './pages/Dashboard/DashboardPage';
import DocumentsListPage from './pages/Documents/DocumentsListPage';
import DocumentsDetailPage from './pages/Documents/DocumentsDetailPage';
import FlashcardsListPage from './pages/FlashCards/FlashcardsListPage';
import FlashcardPage from './pages/FlashCards/FlashcardPage';
import QuizzesListPage from './pages/Quizzes/QuizzesListPage'; // ADDED THIS
import QuizTakePage from './pages/Quizzes/QuizTakePage';
import QuizResultPage from './pages/Quizzes/QuizResultPage';
import ProfilePage from './pages/Profile/ProfilePage';

const App = () => {
  const { isAuthenticated, loading } = useAuth(); 

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-slate-50'>
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-slate-700 font-mono tracking-tight">Initializing System...</p>
        </div>
      </div> 
    );
  }

  return (
    <Router>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={isAuthenticated ? 
          <Navigate to="/dashboard" replace/> : 
          <Navigate to="/login" replace/>} 
        />
        
        {/* Public Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage/> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage/> : <Navigate to="/dashboard" />} />

        {/* Protected Routes with Sidebar/Navbar Layout */}
        <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
                {/* Dashboard & Profile */}
                <Route path="/dashboard" element={<DashboardPage />}/>
                <Route path="/profile" element={<ProfilePage />}/>

                {/* Documents Management */}
                <Route path="/documents" element={<DocumentsListPage />}/>
                <Route path="/documents/:id" element={<DocumentsDetailPage />}/>

                {/* Flashcards & Study */}
                <Route path="/flashcards" element={<FlashcardsListPage />}/>
                <Route path="/documents/:id/flashcards" element={<FlashcardPage />}/>

                {/* Quizzes & Results - FIXED AND SYNCED */}
                <Route path="/quizzes" element={<QuizzesListPage />}/> 
                <Route path="/quizzes/:quizId" element={<QuizTakePage />}/>
                <Route path="/quizzes/:quizId/results" element={<QuizResultPage />}/>
            </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />}/> 
      </Routes>
    </Router>
  );
}

export default App;