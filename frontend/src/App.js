import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import UserQuizzes from './pages/UserQuizzes';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuizzes from './pages/AdminQuizzes';
import AdminQuestions from './pages/AdminQuestions';
import UserLayout from './components/UserLayout';
import AdminLayout from './components/AdminLayout';
import HomeRedirect from './components/HomeRedirect';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<UserLayout />}>
          <Route path="/user" element={<UserHome />} />
          <Route path="/quizzes" element={<UserQuizzes />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="quizzes" element={<AdminQuizzes />} />
          <Route path="questions" element={<AdminQuestions />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
