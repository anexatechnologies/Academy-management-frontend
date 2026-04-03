import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import MainLayout from "@/components/layout/MainLayout"
import LoginPage from "@/pages/auth/LoginPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import Dashboard from "@/pages/dashboard"
import UsersListPage from "@/pages/users/UsersListPage"
import UserCreatePage from "@/pages/users/UserCreatePage"
import UserEditPage from "@/pages/users/UserEditPage"
import CoursesListPage from "@/pages/courses/CoursesListPage"
import CourseCreatePage from "@/pages/courses/CourseCreatePage"
import CourseEditPage from "@/pages/courses/CourseEditPage"
import StaffListPage from "@/pages/staff/StaffListPage"
import StaffCreatePage from "@/pages/staff/StaffCreatePage"
import StaffEditPage from "@/pages/staff/StaffEditPage"
import StaffViewPage from "@/pages/staff/StaffViewPage"
import BatchesListPage from "@/pages/batches/BatchesListPage"
import BatchCreatePage from "@/pages/batches/BatchCreatePage"
import BatchEditPage from "@/pages/batches/BatchEditPage"
import BatchViewPage from "@/pages/batches/BatchViewPage"
import StudentsListPage from "@/pages/students/StudentsListPage"
import StudentCreatePage from "@/pages/students/StudentCreatePage"
import StudentEditPage from "@/pages/students/StudentEditPage"
import StudentViewPage from "@/pages/students/StudentViewPage"
import PendingPaymentsPage from "@/pages/students/PendingPaymentsPage"
import SettingsPage from "@/pages/settings-page"
import AttendanceSettingsPage from "@/pages/settings/attendance/AttendanceSettingsPage"
import RolesListPage from "@/pages/settings/roles/RolesListPage"
import ReportsPage from "@/pages/reports/ReportsPage"
import CertificationPage from "@/pages/certificates/CertificationPage"
import StudentAttendancePage from "@/pages/attendance/StudentAttendancePage"
import StaffAttendancePage from "@/pages/attendance/StaffAttendancePage"
import EnquiryListPage from "@/pages/enquiries/EnquiryListPage"
import EnquiryCreatePage from "@/pages/enquiries/EnquiryCreatePage"
import EnquiryEditPage from "@/pages/enquiries/EnquiryEditPage"
import EnquiryViewPage from "@/pages/enquiries/EnquiryViewPage"
import AnnouncementPage from "@/pages/announcements/AnnouncementPage"
import { PageTitle } from "@/components/PageTitle"

function App() {
  return (
    <BrowserRouter>
      <PageTitle />
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

            <Route path="/staff" element={<StaffListPage />} />
            <Route path="/staff/new" element={<StaffCreatePage />} />
            <Route path="/staff/edit/:id" element={<StaffEditPage />} />
            <Route path="/staff/view/:id" element={<StaffViewPage />} />

            <Route path="/batches" element={<BatchesListPage />} />
            <Route path="/batches/new" element={<BatchCreatePage />} />
            <Route path="/batches/edit/:id" element={<BatchEditPage />} />
            <Route path="/batches/view/:id" element={<BatchViewPage />} />

            <Route path="/students" element={<StudentsListPage />} />
            <Route element={<ProtectedRoute requiredPermissions={["payments:read"]} />}>
              <Route path="/students/pending-payments" element={<PendingPaymentsPage />} />
            </Route>
            <Route path="/students/new" element={<StudentCreatePage />} />
            <Route path="/students/edit/:id" element={<StudentEditPage />} />
            <Route path="/students/view/:id" element={<StudentViewPage />} />

            <Route path="/enquiries" element={<EnquiryListPage />} />
            <Route path="/enquiries/new" element={<EnquiryCreatePage />} />
            <Route path="/enquiries/edit/:id" element={<EnquiryEditPage />} />
            <Route path="/enquiries/view/:id" element={<EnquiryViewPage />} />

            <Route path="/certificates" element={<CertificationPage />} />
            <Route path="/attendance" element={<Navigate to="/attendance/students" replace />} />
            <Route path="/attendance/students" element={<StudentAttendancePage />} />
            <Route path="/attendance/staff" element={<StaffAttendancePage />} />
            <Route element={<ProtectedRoute requiredPermissions={["announcements:read"]} />}>
              <Route path="/announcements" element={<AnnouncementPage />} />
            </Route>
            <Route path="/reports" element={<ReportsPage />} />

            <Route path="/configure" element={<Navigate to="/settings" replace />} />
            <Route path="/settings/fees" element={<Navigate to="/settings" replace />} />
            <Route path="/settings/attendance" element={<AttendanceSettingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/roles" element={<RolesListPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
