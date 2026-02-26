import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Calendar, Users, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import BodyLayout from "@/components/layout/BodyLayout"
import { useBatch } from "@/hooks/api/use-batches"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateCell } from "@/components/ui/date-cell"
import { cn } from "@/lib/utils"

const BatchViewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batch, isLoading } = useBatch(Number(id))

  const breadcrumbs = [
    { label: "Batch Management", href: "/batches" },
    { label: batch ? batch.name : "View Batch" },
  ]

  if (isLoading) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="max-w-5xl space-y-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </BodyLayout>
    )
  }

  if (!batch) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Batch not found</h2>
          <Button variant="link" onClick={() => navigate("/batches")}>Back to list</Button>
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/batches")} className="rounded-full h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{batch.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800">
                  {batch.course_name}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                  batch.status === "active"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {batch.status}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate(`/batches/edit/${batch.id}`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Batch
          </Button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-none bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Schedule & Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <DetailItem label="Start Date" value={<DateCell date={batch.start_date} />} />
                <DetailItem label="End Date" value={<DateCell date={batch.end_date} />} />
                <DetailItem label="Capacity" value={`${batch.capacity} Students`} />
                <DetailItem label="Hall Number" value={batch.hall_no} icon={<MapPin className="h-3.5 w-3.5" />} />
                <DetailItem label="Assigned Staff" value={batch.staff_name} icon={<Users className="h-3.5 w-3.5" />} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Coming Soon</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Student assignment and transfer functionality will be available once the Student module is integrated.
                </p>
              </div>
            </CardContent>
          </Card>
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

export default BatchViewPage
