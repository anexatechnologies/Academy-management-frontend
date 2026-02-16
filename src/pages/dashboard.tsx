import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Users, BookOpen, GraduationCap } from "lucide-react"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      icon: Users,
      description: "+12% from last month",
    },
    {
      title: "Active Courses",
      value: "45",
      icon: BookOpen,
      description: "3 new courses added",
    },
    {
      title: "Instructors",
      value: "12",
      icon: GraduationCap,
      description: "All currently active",
    },
    {
      title: "Revenue",
      value: "$12,345",
      icon: LayoutDashboard,
      description: "+5.4% from last month",
    },
  ]

  return (
    <div className="container mx-auto py-10 px-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening in your academy today.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Placeholder for future charts/activity */}
         <Card className="h-[300px] flex items-center justify-center border-dashed">
            <p className="text-muted-foreground">Activity Analytics Chart Placeholder</p>
         </Card>
         <Card className="h-[300px] flex items-center justify-center border-dashed">
            <p className="text-muted-foreground">Recent Enrollments Placeholder</p>
         </Card>
      </div>
    </div>
  )
}
