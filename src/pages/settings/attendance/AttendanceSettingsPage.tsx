import { useMemo } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { usePermissions } from "@/hooks/use-permissions"
import BodyLayout from "@/components/layout/BodyLayout"
import { Button } from "@/components/ui/button"
import { Info, ArrowRight } from "lucide-react"

export default function AttendanceSettingsPage() {
  const { hasPermission } = usePermissions()
  const canRead = hasPermission("settings", "read")
  const navigate = useNavigate()

  const breadcrumbs = useMemo(() => [
    { label: "Settings", path: "/settings" },
    { label: "Attendance Parameters" }
  ], [])

  if (!canRead) {
    return <Navigate to="/" replace />
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">
                Global Attendance Timings Removed
              </h3>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                The biometric attendance system no longer uses global timing parameters. Attendance slot detection
                (Ground vs. Lecture) is now determined dynamically by the timings configured on each individual
                Batch. A ± 30-minute buffer is applied automatically by the backend.
              </p>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/70 leading-relaxed">
                To configure attendance timings, edit the relevant Batch and set the Ground and / or Lecture
                start & end times in the <strong>Attendance Timings</strong> section.
              </p>
            </div>
          </div>

          <div className="pl-14">
            <Button
              variant="outline"
              className="bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-xl h-9 text-sm font-semibold"
              onClick={() => navigate("/batches")}
            >
              Go to Batch Management
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </BodyLayout>
  )
}
