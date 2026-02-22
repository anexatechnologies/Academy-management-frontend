import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import MainLayout from "@/components/layout/MainLayout"
import LoginPage from "@/pages/auth/LoginPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import ComponentsPage from "@/pages/components-page"
import Dashboard from "@/pages/dashboard"
import UsersListPage from "@/pages/users/UsersListPage"
import UserCreatePage from "@/pages/users/UserCreatePage"
import UserEditPage from "@/pages/users/UserEditPage"
import CoursesListPage from "@/pages/courses/CoursesListPage"
import CourseCreatePage from "@/pages/courses/CourseCreatePage"
import CourseEditPage from "@/pages/courses/CourseEditPage"
import SettingsPage from "@/pages/settings-page"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/new" element={<UserCreatePage />} />
            <Route path="/users/edit/:id" element={<UserEditPage />} />

            <Route path="/courses" element={<CoursesListPage />} />
            <Route path="/courses/new" element={<CourseCreatePage />} />
            <Route path="/courses/edit/:id" element={<CourseEditPage />} />
            <Route path="/components" element={<ComponentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
