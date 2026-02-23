import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, GraduationCap, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import BodyLayout from "@/components/layout/BodyLayout"
import { useStaff } from "@/hooks/api/use-staff"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DateCell } from "@/components/ui/date-cell"
import { cn } from "@/lib/utils"

const StaffViewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: staff, isLoading } = useStaff(Number(id))

  const breadcrumbs = [
    { label: "Staff Management", href: "/staff" },
    { label: staff ? staff.full_name : "View Staff" },
  ]

  if (isLoading) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="max-w-5xl space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </BodyLayout>
    )
  }

  if (!staff) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Staff member not found</h2>
          <Button variant="link" onClick={() => navigate("/staff")}>Back to list</Button>
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/staff")} className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{staff.full_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border",
                  staff.staff_type === "Teaching" 
                    ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" 
                    : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                )}>
                  {staff.staff_type}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                  staff.status === "active" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {staff.status}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate(`/staff/edit/${staff.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic & Profile */}
          <Card className="lg:col-span-1 shadow-sm border-none bg-white dark:bg-slate-950">
            <CardContent className="pt-8 flex flex-col items-center text-center">
              <div className="h-32 w-32 rounded-full ring-4 ring-primary/5 p-1 bg-white dark:bg-slate-900 mb-4 overflow-hidden">
                 {staff.photo_url ? (
                    <img src={staff.photo_url} alt={staff.full_name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                      {staff.full_name.charAt(0)}
                    </div>
                  )}
              </div>
              <h3 className="text-xl font-bold">{staff.full_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Staff ID: #{staff.id}</p>
              
              <Separator className="my-6" />
              
              <div className="w-full space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Email Address</span>
                    <span className="text-sm font-medium transition-colors hover:text-primary cursor-pointer">{staff.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Contact Number</span>
                    <span className="text-sm font-medium">{staff.contact_number}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-semibold">Address</span>
                    <span className="text-sm font-medium">{staff.address}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Detailed Tabs/Sections */}
          <div className="lg:col-span-2 space-y-6">
             <Card className="shadow-sm border-none bg-white dark:bg-slate-950">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <DetailItem label="Date of Birth" value={<DateCell date={staff.date_of_birth} />} />
                  <DetailItem label="Category" value={staff.category} />
                  <div className="sm:col-span-2">
                    <DetailItem label="Remarks" value={staff.remarks || "No remarks provided"} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-none bg-white dark:bg-slate-950">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <DetailItem label="Joining Date" value={<DateCell date={staff.joining_date} />} />
                  <DetailItem label="Education" value={staff.education} icon={<GraduationCap className="h-3.5 w-3.5" />} />
                  <DetailItem label="Experience" value={`${staff.experience_years} Years`} />
                  <DetailItem label="Last Employer" value={staff.last_employer || "N/A"} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BodyLayout>
  )
}

const DetailItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="space-y-1">
    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
    <div className="flex items-center gap-2">
      {icon && <span className="text-primary/70">{icon}</span>}
      <span className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  </div>
)

export default StaffViewPage
