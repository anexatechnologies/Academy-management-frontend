import { useState, useMemo, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAttendanceSettings, useUpdateAttendanceSettings } from "@/hooks/api/use-settings"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormFooter } from "@/components/ui/form-footer"
import { Loader2, Edit2, Clock, CalendarDays } from "lucide-react"

const parseTimeToAMPM = (time24?: string) => {
  if (!time24) return "Not Set"
  const [hoursStr, minStr] = time24.split(":")
  if (!hoursStr || !minStr) return time24
  let h = parseInt(hoursStr, 10)
  const m = minStr
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12
  h = h ? h : 12
  // pad single digit hour with 0
  const hStr = h < 10 ? `0${h}` : h.toString()
  return `${hStr}:${m} ${ampm}`
}

export default function AttendanceSettingsPage() {
  const { data: attendanceParams, isLoading } = useAttendanceSettings()
  const updateSettings = useUpdateAttendanceSettings()
  
  const { hasPermission } = usePermissions()
  const canRead = hasPermission("settings", "read")
  const canEdit = hasPermission("settings", "update")
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    ground_start_time: "",
    ground_end_time: "",
    lecture_start_time: "",
    lecture_end_time: ""
  })

  // Sync state with fetched data when edit mode opens or data loads
  useEffect(() => {
    if (attendanceParams) {
      setFormData({
        ground_start_time: attendanceParams.ground_start_time || "",
        ground_end_time: attendanceParams.ground_end_time || "",
        lecture_start_time: attendanceParams.lecture_start_time || "",
        lecture_end_time: attendanceParams.lecture_end_time || ""
      })
    }
  }, [attendanceParams])

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    try {
      await updateSettings.mutateAsync(formData)
      toast.success("Attendance timings updated successfully")
      setIsEditing(false)
    } catch (error) {
      toast.error("Failed to update timings")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (attendanceParams) {
      setFormData({
        ground_start_time: attendanceParams.ground_start_time || "",
        ground_end_time: attendanceParams.ground_end_time || "",
        lecture_start_time: attendanceParams.lecture_start_time || "",
        lecture_end_time: attendanceParams.lecture_end_time || ""
      })
    }
  }

  const breadcrumbs = useMemo(() => [
    { label: "Settings", path: "/settings" },
    { label: "Attendance Parameters" }
  ], [])

  if (!canRead) {
    return <Navigate to="/" replace />
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <form onSubmit={handleSave} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl shadow-primary/5 overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-slate-100/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Daily Attendance Timings</h3>
                <p className="text-xs text-slate-500 font-medium">Configure the start and end times for Ground activity and Lectures.</p>
              </div>
              {canEdit && !isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline" 
                  className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm rounded-xl h-9"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Timings
                </Button>
              )}
            </div>
          </div>

          <div className="p-8 pb-10 space-y-10">
            {isLoading ? (
              <div className="flex h-[200px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            ) : isEditing ? (
              <div className="space-y-10 animate-in fade-in zoom-in-95 duration-200">
                {/* Ground Timings Edit */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Ground Timings</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <Input 
                      type="time" 
                      label="Start Time"
                      value={formData.ground_start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, ground_start_time: e.target.value }))}
                      leftIcon={<Clock className="w-4 h-4 text-emerald-500" />}
                      className="h-12 rounded-xl text-sm border-slate-200/80 focus:ring-emerald-500/20 font-medium"
                      disabled={updateSettings.isPending}
                    />
                    <Input 
                      type="time" 
                      label="End Time"
                      value={formData.ground_end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, ground_end_time: e.target.value }))}
                      leftIcon={<Clock className="w-4 h-4 text-emerald-500" />}
                      className="h-12 rounded-xl text-sm border-slate-200/80 focus:ring-emerald-500/20 font-medium"
                      disabled={updateSettings.isPending}
                    />
                  </div>
                </div>

                {/* Lecture Timings Edit */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    </span>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Lecture Timings</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    <Input 
                      type="time" 
                      label="Start Time"
                      value={formData.lecture_start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, lecture_start_time: e.target.value }))}
                      leftIcon={<CalendarDays className="w-4 h-4 text-blue-500" />}
                      className="h-12 rounded-xl text-sm border-slate-200/80 focus:ring-blue-500/20 font-medium"
                      disabled={updateSettings.isPending}
                    />
                    <Input 
                      type="time" 
                      label="End Time"
                      value={formData.lecture_end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, lecture_end_time: e.target.value }))}
                      leftIcon={<CalendarDays className="w-4 h-4 text-blue-500" />}
                      className="h-12 rounded-xl text-sm border-slate-200/80 focus:ring-blue-500/20 font-medium"
                      disabled={updateSettings.isPending}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Ground Timings Read */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-100">Ground Timings</h3>
                      <p className="text-xs text-emerald-600/70 font-medium">Daily mandatory physical activity schedule.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-emerald-600/70 dark:text-emerald-400/70 block mb-1">Start Time</span>
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {parseTimeToAMPM(attendanceParams?.ground_start_time)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-emerald-600/70 dark:text-emerald-400/70 block mb-1">End Time</span>
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {parseTimeToAMPM(attendanceParams?.ground_end_time)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lecture Timings Read */}
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 relative overflow-hidden group hover:border-blue-200 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">Lecture Timings</h3>
                      <p className="text-xs text-blue-600/70 font-medium">Core academic session schedule.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-blue-600/70 dark:text-blue-400/70 block mb-1">Start Time</span>
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {parseTimeToAMPM(attendanceParams?.lecture_start_time)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold tracking-widest uppercase text-blue-600/70 dark:text-blue-400/70 block mb-1">End Time</span>
                      <p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {parseTimeToAMPM(attendanceParams?.lecture_end_time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Sticky Footer for Edit Mode */}
          {isEditing && (
            <div className="bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-8 py-5 flex items-center justify-end z-40 rounded-b-3xl">
               <FormFooter 
                  submitLabel="Save Configuration" 
                  cancelLabel="Cancel"
                  onCancel={handleCancel}
                  isLoading={updateSettings.isPending}
                  className="border-none shadow-none p-0 bg-transparent mt-0"
                />
            </div>
          )}
        </form>
      </div>
    </BodyLayout>
  )
}
