import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  UserCheck,
  Trash2,
  MessageSquarePlus,
  Clock,
  Loader2,
  User,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import BodyLayout from "@/components/layout/BodyLayout"
import { DateCell } from "@/components/ui/date-cell"
import { DatePickerInput } from "@/components/ui/date-picker"
import {
  useEnquiry,
  useUpdateEnquiry,
  useAddEnquiryLog,
  useDeleteEnquiryLog,
} from "@/hooks/api/use-enquiries"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Controller } from "react-hook-form"
import type { EnquiryStatus } from "@/types/enquiry"
import { CustomSelect } from "@/components/ui/custom-select"
import { RequirePermission } from "@/components/auth/RequirePermission"

const STATUS_CONFIG: Record<EnquiryStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  converted: {
    label: "Converted",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
}

const logSchema = z.object({
  remark: z.string().min(1, "Remark is required"),
  next_reminder_date: z.string().optional(),
})

type LogFormValues = z.infer<typeof logSchema>

const EnquiryViewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const enquiryId = Number(id)

  const { data: enquiry, isLoading } = useEnquiry(enquiryId)
  const updateEnquiry = useUpdateEnquiry(enquiryId)
  const addLog = useAddEnquiryLog(enquiryId)
  const deleteLog = useDeleteEnquiryLog(enquiryId)
  const { canUpdateEnquiry, canDeleteEnquiry } = usePermissions()

  const [deletingLogId, setDeletingLogId] = useState<number | null>(null)

  const {
    register: registerLog,
    handleSubmit: handleLogSubmit,
    control: logControl,
    reset: resetLog,
    formState: { errors: logErrors },
  } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: { remark: "", next_reminder_date: "" },
  })

  const handleAddLog = async (values: LogFormValues) => {
    try {
      await addLog.mutateAsync({
        remark: values.remark,
        next_reminder_date: values.next_reminder_date || undefined,
      })
      toast.success("Follow-up log added")
      resetLog()
    } catch {
      toast.error("Failed to add log")
    }
  }

  const handleDeleteLog = async (logId: number) => {
    setDeletingLogId(logId)
    try {
      await deleteLog.mutateAsync(logId)
      toast.success("Log deleted")
    } catch {
      toast.error("Failed to delete log")
    } finally {
      setDeletingLogId(null)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    toast.promise(
      new Promise((resolve, reject) => {
        updateEnquiry.mutate(
          { status: newStatus as EnquiryStatus },
          { onSuccess: resolve, onError: reject }
        )
      }),
      {
        loading: "Updating status...",
        success: "Status updated successfully",
        error: "Failed to update status",
      }
    )
  }

  const breadcrumbs = [
    { label: "Enquiry Management", href: "/enquiries" },
    { label: enquiry ? `${enquiry.first_name} ${enquiry.last_name}` : "View Enquiry" },
  ]

  if (isLoading) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="max-w-5xl space-y-6">
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </BodyLayout>
    )
  }

  if (!enquiry) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Enquiry not found</h2>
          <Button variant="link" onClick={() => navigate("/enquiries")}>
            Back to list
          </Button>
        </div>
      </BodyLayout>
    )
  }

  const fullName = [enquiry.first_name, enquiry.middle_name, enquiry.last_name]
    .filter(Boolean)
    .join(" ")

  const statusCfg = STATUS_CONFIG[enquiry.status] ?? STATUS_CONFIG.active
  const logs = enquiry.logs ?? []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/enquiries")}
              className="rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                    statusCfg.className
                  )}
                >
                  {statusCfg.label}
                </span>
                <span className="text-xs text-muted-foreground">Enquiry #{enquiry.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canUpdateEnquiry && (
              <>
                <Button variant="outline" onClick={() => navigate(`/enquiries/edit/${enquiry.id}`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                {enquiry.status === "active" && (
                  <Button
                    onClick={() => navigate(`/students/new?enquiry_id=${enquiry.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <UserCheck className="mr-2 h-4 w-4" /> Convert to Student
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs Content */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-800 p-0 h-auto rounded-none w-full justify-start gap-8 shadow-none mb-6">
            <TabsTrigger
              value="personal"
              className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
            >
              <User className="h-4 w-4" /> Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="followup"
              className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
            >
              <History className="h-4 w-4" /> Follow-up & Logs
              {logs.length > 0 && (
                <span className="ml-2 h-5 min-w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center px-1">
                  {logs.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Personal Info */}
          <TabsContent value="personal" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Card */}
              <Card className="lg:col-span-1 shadow-sm border-none bg-white dark:bg-slate-950">
                <CardContent className="pt-8 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary mb-4">
                    {enquiry.first_name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold">{fullName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Enquiry #{enquiry.id}</p>

                  <Separator className="my-5" />

                  <div className="w-full space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground uppercase font-semibold">Contact</span>
                        <span className="text-sm font-medium">{enquiry.personal_contact}</span>
                      </div>
                    </div>
                    {enquiry.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase font-semibold">Email</span>
                          <span className="text-sm font-medium break-all">{enquiry.email}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-5" />

                  {/* Status Changer */}
                  {canUpdateEnquiry && (
                    <div className="w-full space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase text-left">Change Status</p>
                      <CustomSelect
                        value={enquiry.status}
                        onValueChange={handleStatusChange}
                        disabled={updateEnquiry.isPending}
                        triggerClassName="w-full h-9 text-sm"
                        options={[
                          { value: "active", label: "Active" },
                          { value: "converted", label: "Converted" },
                          { value: "cancelled", label: "Cancelled" },
                        ]}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Card: Details */}
              <Card className="lg:col-span-2 shadow-sm border-none bg-white dark:bg-slate-950">
                <CardHeader>
                  <CardTitle className="text-lg">Enquiry Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
                    <DetailItem label="First Name" value={enquiry.first_name} />
                    <DetailItem label="Middle Name" value={enquiry.middle_name || "—"} />
                    <DetailItem label="Last Name" value={enquiry.last_name} />
                    <DetailItem label="Contact Number" value={enquiry.personal_contact} />
                    <DetailItem label="Email" value={enquiry.email || "—"} />
                    <DetailItem label="Education" value={enquiry.education || "—"} />
                    <DetailItem label="Height" value={enquiry.height || "—"} />
                    <DetailItem label="Weight" value={enquiry.weight || "—"} />
                    <DetailItem label="Enquiry Date" value={<DateCell date={enquiry.created_at} />} />
                    <DetailItem
                      label="Status"
                      value={
                        <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider", statusCfg.className)}>
                          {statusCfg.label}
                        </span>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Follow-up Logs */}
          <TabsContent value="followup" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Log Form */}
              <RequirePermission module="enquiries" action="update">
                <Card className="shadow-sm border-none bg-white dark:bg-slate-950">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquarePlus className="h-4 w-4 text-primary" />
                      Log Interaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogSubmit(handleAddLog)} className="space-y-4">
                      <Textarea
                        {...registerLog("remark")}
                        label="Remark"
                        required
                        placeholder="Enter follow-up notes or interaction details..."
                        className="min-h-[100px] rounded-lg resize-none text-sm"
                        error={logErrors.remark?.message}
                        disabled={addLog.isPending}
                      />
                      <Controller
                        control={logControl}
                        name="next_reminder_date"
                        render={({ field }) => (
                          <DatePickerInput
                            label="Next Reminder Date"
                            placeholder="Select date (optional)"
                            value={field.value ? new Date(field.value) : null}
                            onChange={(date) =>
                              field.onChange(date ? date.toISOString().split("T")[0] : "")
                            }
                            disabled={addLog.isPending}
                          />
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={addLog.isPending}
                        className="w-full"
                      >
                        {addLog.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Log...</>
                        ) : (
                          "Add Log"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </RequirePermission>

              {/* Interaction Timeline */}
              <Card className="shadow-sm border-none bg-white dark:bg-slate-950">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Interaction Timeline
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {logs.length} {logs.length === 1 ? "log" : "logs"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                      <MessageSquarePlus className="h-10 w-10 mb-3 opacity-30" />
                      <p className="text-sm">No follow-up logs yet.</p>
                      <p className="text-xs">Add the first interaction log using the form.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Vertical line */}
                      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
                      <ul className="space-y-5 pl-6">
                        {[...logs].reverse().map((log) => {
                          const logDate = new Date(log.created_at)
                          const reminderDate = log.next_reminder_date ? new Date(log.next_reminder_date) : null
                          const reminderOverdue = reminderDate
                            ? (() => { const d = new Date(reminderDate); d.setHours(0,0,0,0); return d <= today })()
                            : false

                          return (
                            <li key={log.id} className="relative">
                              {/* Dot */}
                              <span className="absolute -left-[17px] top-1.5 h-3 w-3 rounded-full bg-primary/20 border-2 border-primary shrink-0" />
                              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-3 space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
                                    {log.remark}
                                  </p>
                                  {canDeleteEnquiry && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 shrink-0"
                                      onClick={() => handleDeleteLog(log.id)}
                                      disabled={deletingLogId === log.id}
                                    >
                                      {deletingLogId === log.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </Button>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                  <span>
                                    Logged: {logDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                  {reminderDate && (
                                    <span className={cn(
                                      "flex items-center gap-1 font-semibold",
                                      reminderOverdue ? "text-amber-600" : "text-slate-500"
                                    )}>
                                      {reminderOverdue && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                                      Next: {reminderDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Actions */}
            {canUpdateEnquiry && enquiry.status === "active" && (
              <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  onClick={() => navigate(`/students/new?enquiry_id=${enquiry.id}`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserCheck className="mr-2 h-4 w-4" /> Convert to Student
                </Button>
                <Button
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={updateEnquiry.isPending}
                >
                  Cancel Enquiry
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </BodyLayout>
  )
}

const DetailItem = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <div className="space-y-1">
    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{label}</span>
    <div className="text-[15px] font-semibold text-slate-800 dark:text-slate-200">{value}</div>
  </div>
)

export default EnquiryViewPage
