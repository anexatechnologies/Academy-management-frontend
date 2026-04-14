import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export function PageTitle() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    let title = "Pawan Academy"

    // Exact routes
    const exactTitles: Record<string, string> = {
      "/": "Dashboard",
      "/login": "Login",
      "/forgot-password": "Forgot Password",
      "/reset-password": "Reset Password",
      "/users": "User Management",
      "/users/new": "Add User",
      "/courses": "Course Management",
      "/courses/new": "Add Course",
      "/batches": "Batch Management",
      "/batches/new": "Add Batch",
      "/students": "Student Management",
      "/students/new": "Add Student",
      "/students/pending-payments": "Pending Payments",
      "/enquiries": "Enquiry Management",
      "/enquiries/new": "Add Enquiry",
      "/staff": "Staff Management",
      "/staff/new": "Add Staff",
      "/certificates": "Certificates",
      "/attendance/students": "Student Attendance",
      "/attendance/staff": "Staff Attendance",
      "/reports": "Reports",
      "/announcements": "Announcement Center",
      "/settings": "Application Settings",
      "/settings/attendance": "Attendance Settings",
      "/roles": "Roles & Permissions",
    }

    if (exactTitles[path]) {
      title = exactTitles[path]
    } else {
      // Dynamic routes
      if (path.startsWith("/users/edit/")) title = "Edit User"
      else if (path.startsWith("/courses/edit/")) title = "Edit Course"
      else if (path.startsWith("/batches/edit/")) title = "Edit Batch"
      else if (path.startsWith("/batches/view/")) title = "Batch Details"
      else if (path.startsWith("/students/edit/")) title = "Edit Student"
      else if (path.startsWith("/students/view/")) title = "Student Details"
      else if (path.startsWith("/enquiries/edit/")) title = "Edit Enquiry"
      else if (path.startsWith("/enquiries/view/")) title = "Enquiry Details"
      else if (path.startsWith("/staff/edit/")) title = "Edit Staff"
      else if (path.startsWith("/staff/view/")) title = "Staff Details"
    }

    // Set title
    document.title = `${title} | Pawan Academy`
  }, [location.pathname])

  return null
}
