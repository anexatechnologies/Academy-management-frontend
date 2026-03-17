import { useState, useMemo, useEffect } from "react"
import { 
  Send, 
  Users, 
  MessageSquare, 
  Layers, 
  Monitor, 
  Layout, 
  AlertCircle, 
  CheckCircle2,
  Info,
  User,
  GraduationCap,
  Briefcase,
  IndianRupee,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import BodyLayout from "@/components/layout/BodyLayout"
import { useAnnouncementTargets, useTemplates, useSendAnnouncement } from "@/hooks/api/use-announcements"
import { useEnquiries } from "@/hooks/api/use-enquiries"
import { useStudentComboBox } from "@/hooks/use-combobox-data"
import { handleApiError } from "@/utils/api-error"
import { ComboBox } from "@/components/ui/combobox"
import { cn } from "@/lib/utils"
import type { AnnouncementTargetType } from "@/types/announcement"

import { useRef } from "react"

const TARGET_TYPES: { value: AnnouncementTargetType; label: string; icon: any }[] = [
  { value: "batch", label: "Batches", icon: Layers },
  { value: "course", label: "Courses", icon: Monitor },
  { value: "enquiry", label: "Enquiries", icon: MessageSquare },
  { value: "single_student", label: "Individual", icon: User },
  { value: "outstanding_fees", label: "Outstanding Fees", icon: IndianRupee },
  { value: "all_students", label: "All Students", icon: GraduationCap },
  { value: "staff", label: "Staff", icon: Briefcase },
]

const CHANNELS = [
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare }, // In future link to WhatsApp icon
]

const AnnouncementPage = () => {
  // --- State ---
  const [targetType, setTargetType] = useState<AnnouncementTargetType>("batch")
  const [selectedTargetIds, setSelectedTargetIds] = useState<number[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["sms"])
  const [placeholderData, setPlaceholderData] = useState<Record<string, string>>({})
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)

  // --- Refs ---
  const templateDataRef = useRef<HTMLDivElement>(null)

  // --- API Hooks ---
  const { data: targetData, isLoading: isLoadingTargets } = useAnnouncementTargets()
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates({ category: "announcement" })
  const { data: enquiriesData, isLoading: isLoadingEnquiries } = useEnquiries({ status: "active", limit: 100 })
  const sendAnnouncement = useSendAnnouncement()
  const studentComboBox = useStudentComboBox()

  // --- Derived State ---
  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    return templates.filter(t => {
      if (t.channel === "both") return true
      return selectedChannels.includes(t.channel)
    })
  }, [templates, selectedChannels])
  const selectedTemplate = useMemo(() => 
    filteredTemplates.find(t => String(t.id) === selectedTemplateId),
  [filteredTemplates, selectedTemplateId])

  // Parse placeholders from template body
  const requiredPlaceholders = useMemo(() => {
    if (!selectedTemplate) return []
    const matches = selectedTemplate.body.match(/\[(.*?)\]/g) || []
    // Filter out auto-injected ones
    const autoInjected = ["[StudentName]", "[InstituteName]", "[Amount]"]
    return [...new Set(matches)]
      .filter(p => !autoInjected.includes(p))
      .map(p => p.slice(1, -1))
  }, [selectedTemplate])

  // Recipient count calculation
  const recipientCount = useMemo(() => {
    if (!targetData) return 0
    if (targetType === "batch") {
      return targetData.batches
        .filter(b => selectedTargetIds.includes(b.id))
        .reduce((acc, b) => acc + b.student_count, 0)
    }
    if (targetType === "course") {
      return targetData.courses
        .filter(c => selectedTargetIds.includes(c.id))
        .reduce((acc, c) => acc + c.student_count, 0)
    }
    if (targetType === "enquiry") {
      return targetData.enquiries_count
    }
    if (targetType === "all_students") {
      return targetData.all_students_count
    }
    if (targetType === "staff") {
      return targetData.staff_count
    }
    if (targetType === "outstanding_fees") {
      return targetData.outstanding_fees_count
    }
    if (targetType === "single_student") {
      return selectedTargetIds.length > 0 ? 1 : 0
    }
    return 0
  }, [targetData, targetType, selectedTargetIds])

  // --- Effects ---
  useEffect(() => {
    // Reset selected IDs when target type changes
    setSelectedTargetIds([])
  }, [targetType])

  // Init placeholder data when required placeholders change
  useEffect(() => {
    const newData: Record<string, string> = {}
    requiredPlaceholders.forEach(p => {
      newData[p] = placeholderData[p] || ""
    })
    setPlaceholderData(newData)
  }, [requiredPlaceholders])

  // --- Handlers ---
  const handleToggleTarget = (id: number) => {
    setSelectedTargetIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAllTargets = () => {
    if (!targetData) return
    const allIds = targetType === "batch" 
      ? targetData.batches.map(b => b.id)
      : targetType === "course"
        ? targetData.courses.map(c => c.id)
        : enquiriesData?.data?.map(e => e.id) || []
    
    setSelectedTargetIds(selectedTargetIds.length === allIds.length ? [] : allIds)
  }

  const handleStudentSelect = (val: string) => {
    if (!val) {
      setSelectedTargetIds([])
      return
    }
    setSelectedTargetIds([Number(val)])
  }

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev => {
      const next = prev.includes(channel) 
        ? prev.filter(c => c !== channel) 
        : [...prev, channel]
      if (next.length === 0) return prev // Keep at least one channel
      return next
    })
    // Reset template if it's no longer valid for new channels
    setSelectedTemplateId("")
  }

  const handleSend = async () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template")
      return
    }

    const isGlobalScope = ["enquiry", "all_students", "staff", "outstanding_fees"].includes(targetType)
    
    if (!isGlobalScope && selectedTargetIds.length === 0) {
      toast.error(`Please select at least one ${targetType.replace("_", " ")}`)
      return
    }
    if (selectedChannels.length === 0) {
      toast.error("Please select at least one channel")
      return
    }

    // Special check for individual student
    if (targetType === "single_student" && selectedTargetIds.length === 0) {
      toast.error("Please select a student")
      return
    }

    // Validate placeholders
    const missing = requiredPlaceholders.filter(p => !placeholderData[p])
    if (missing.length > 0) {
      toast.error(`Please fill placeholders: ${missing.join(", ")}`)
      templateDataRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    setIsSending(true)
    setSendResult(null)
    try {
      const response = await sendAnnouncement.mutateAsync({
        target_type: targetType,
        target_ids: selectedTargetIds,
        template_id: Number(selectedTemplateId),
        channels: selectedChannels,
        data: placeholderData,
      })
      
      setSendResult(response)
      
      if (response.errors && response.errors.length > 0) {
        toast.warning(`Sent with ${response.errors.length} errors`)
      } else {
        toast.success("Announcement processed successfully")
      }
      
      // Don't reset everything immediately if there are errors, so user can see what happened
      if (!response.errors || response.errors.length === 0) {
        setSelectedTargetIds([])
        setPlaceholderData({})
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSending(false)
    }
  }

  const breadcrumbs = [{ label: "Announcement Center" }]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12">
        
        {/* Left Column: Targeting */}
        <div className="xl:col-span-8 space-y-6">
          <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Target Selection
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">Select the recipients for this announcement</p>
            </div>

            <div className="p-6 space-y-8">
              {/* Target Type Selector */}
              <div className="flex flex-wrap gap-3">
                {TARGET_TYPES.map((type) => {
                  const Icon = type.icon
                  const isActive = targetType === type.value
                  return (
                    <button
                      key={type.value}
                      disabled={isSending}
                      onClick={() => setTargetType(type.value)}
                      className={cn(
                        "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer",
                        isActive 
                          ? "bg-primary/5 border-primary text-primary shadow-sm"
                          : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900",
                        isSending && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                      <span className="text-sm font-semibold">{type.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Target Listing (Batches/Courses/Enquiries) */}
              {(targetType === "batch" || targetType === "course" || targetType === "enquiry") && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                      Select {targetType === "batch" ? "Batches" : targetType === "course" ? "Courses" : "Enquiries"}
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={isSending}
                      onClick={handleSelectAllTargets}
                      className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/5 cursor-pointer"
                    >
                      {selectedTargetIds.length === 0 ? "Select All" : "Deselect All"}
                    </Button>
                  </div>

                  {(isLoadingTargets || isLoadingEnquiries) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse bg-slate-50 dark:bg-slate-900/50" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                      {(targetType === "batch" 
                        ? targetData?.batches 
                        : targetType === "course" 
                          ? targetData?.courses 
                          : enquiriesData?.data?.map(e => ({ id: e.id, name: `${e.first_name} ${e.last_name}`, student_count: 0 }))
                      )?.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => !isSending && handleToggleTarget(item.id)}
                          className={cn(
                            "group flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer",
                            selectedTargetIds.includes(item.id)
                              ? "bg-primary/5 border-primary/30 shadow-sm ring-1 ring-primary/10"
                              : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-900",
                            isSending && "opacity-50 cursor-not-allowed pointer-events-none"
                          )}
                        >
                          <Checkbox
                            checked={selectedTargetIds.includes(item.id)}
                            disabled={isSending}
                            onCheckedChange={() => handleToggleTarget(item.id)}
                            className="h-4.5 w-4.5 rounded shadow-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              {targetType === "enquiry" ? (
                                <MessageSquare className="h-3 w-3" />
                              ) : (
                                <Users className="h-3 w-3" />
                              )}
                              {targetType === "enquiry" ? "Enquiry" : `${item.student_count} Students`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Single Student Search */}
              {targetType === "single_student" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="max-w-md">
                    <ComboBox
                      label="Search Student"
                      required
                      disabled={isSending}
                      value={selectedTargetIds.length > 0 ? String(selectedTargetIds[0]) : ""}
                      onValueChange={handleStudentSelect}
                      options={studentComboBox.options}
                      onSearch={studentComboBox.onSearch}
                      onLoadMore={studentComboBox.onLoadMore}
                      onReset={studentComboBox.onReset}
                      hasMore={studentComboBox.hasMore}
                      isLoading={studentComboBox.isLoading}
                      isLoadingMore={studentComboBox.isLoadingMore}
                      placeholder="Search by name or student ID..."
                      searchPlaceholder="Type name..."
                      emptyText="No students found."
                      triggerClassName="rounded-xl h-11"
                    />
                  </div>
                  {selectedTargetIds.length > 0 && (
                     <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                           <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                              {studentComboBox.options.find(o => o.value === String(selectedTargetIds[0]))?.label || "Student Selected"}
                           </p>
                           <p className="text-[11px] text-primary font-bold">Recipient Ready</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={isSending}
                          className="h-8 w-8 hover:bg-primary/10 text-slate-400 hover:text-primary cursor-pointer"
                          onClick={() => setSelectedTargetIds([])}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                     </div>
                  )}
                </div>
              )}

              {/* Global Scopes (Enquiry, All Students, Staff, Outstanding Fees) */}
              {(targetType === "enquiry" && !targetData?.enquiries || ["all_students", "staff", "outstanding_fees"].includes(targetType)) && (
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 rounded-3xl bg-primary/5 flex items-center justify-center">
                    {(() => {
                        const Icon = TARGET_TYPES.find(t => t.value === targetType)?.icon || MessageSquare
                        return <Icon className="h-8 w-8 text-primary" />
                    })()}
                  </div>
                  <div className="max-w-xs space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Send to all {targetType.replace("_", " ")}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {targetType === "enquiry" && `Announcements will be sent to all active enquiries.`}
                      {targetType === "all_students" && `Broadcast to the entire active student body.`}
                      {targetType === "staff" && `Send a memo to all active staff members.`}
                      {targetType === "outstanding_fees" && `Target students with unpaid fee installments.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    Targeting {recipientCount} Recipients
                  </div>
                  {targetType === "outstanding_fees" && (
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      [Amount] placeholder will be auto-filled
                    </p>
                  )}
                </div>
              )}

              {/* Error Reporting Section */}
              {sendResult?.errors && sendResult.errors.length > 0 && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <AlertCircle className="h-4 w-4 text-red-500" />
                       <h3 className="text-sm font-bold text-red-600 uppercase tracking-tight">Delivery Failures ({sendResult.errors.length})</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSendResult(null)} className="h-7 text-[11px]">Dismiss</Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {sendResult.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center justify-between">
                        <div>
                           <p className="text-[11px] font-bold text-red-700 dark:text-red-400">{err.recipient}</p>
                           <p className="text-[10px] text-red-500 font-medium">{err.error}</p>
                        </div>
                        <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                           <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recipient Counter Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Recipients</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tabular-nums leading-none">
                      {recipientCount}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">Distinct Contacts</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="hidden sm:block space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Selection Status</p>
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {["enquiry", "all_students", "staff", "outstanding_fees"].includes(targetType) 
                      ? "Global Scope" 
                      : targetType === "single_student" 
                        ? "Individual Selection"
                        : `${selectedTargetIds.length} ${targetType}s Selected`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">Auto-deduplication enabled</p>
              </div>
            </div>
          </Card>

          {/* Dynamic Placeholders */}
          {requiredPlaceholders.length > 0 && (
            <Card ref={templateDataRef} className="p-6 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Template Data
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requiredPlaceholders.map((key) => (
                  <Input
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                    required
                    placeholder={`Enter ${key}...`}
                    value={placeholderData[key] || ""}
                    onChange={(e) => setPlaceholderData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="rounded-xl shadow-none"
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Content & Config */}
        <div className="xl:col-span-4 space-y-6">
          {/* Template Selection */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Compose Message
              </h2>
            </div>

            <div className="space-y-4">
              <ComboBox
                label="Message Template"
                required
                disabled={isSending}
                options={filteredTemplates.map(t => ({ value: String(t.id), label: t.template_name }))}
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
                isLoading={isLoadingTemplates}
                placeholder="Select a template..."
                triggerClassName="rounded-xl h-11"
              />

              {selectedTemplate && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px] font-bold text-slate-500">MESSAGE PREVIEW</Label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                      {selectedTemplate.category}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {selectedTemplate.body}
                    </pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] p-1.5 bg-primary/5 text-primary rounded-md font-mono">[StudentName]</span>
                    <span className="text-[10px] p-1.5 bg-primary/5 text-primary rounded-md font-mono">[InstituteName]</span>
                    {targetType === "outstanding_fees" && (
                      <span className="text-[10px] p-1.5 bg-amber-500/10 text-amber-600 rounded-md font-mono">[Amount]</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Static placeholders above will be replaced automatically per recipient.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Channel Selection */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Communication Channels
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => !isSending && handleChannelToggle(ch.id)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                    selectedChannels.includes(ch.id)
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900",
                    isSending && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <Checkbox
                    checked={selectedChannels.includes(ch.id)}
                    disabled={isSending}
                    onCheckedChange={() => handleChannelToggle(ch.id)}
                    className="h-5 w-5 rounded-md shadow-none data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {ch.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Execution Button */}
          <Button 
            disabled={isSending || isLoadingTargets}
            onClick={handleSend}
            className="w-full h-16 rounded-2xl shadow-xl shadow-primary/20 text-lg font-bold gap-3 transition-all active:scale-[0.98]"
          >
            {isSending ? (
              <>
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                Sending Announcements...
              </>
            ) : (
              <>
                <Send className="h-6 w-6" />
                Broadcast Announcement
              </>
            )}
          </Button>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
              This action will send messages to all recipients. A 500ms delay is applied between messages automatically.
            </p>
          </div>
        </div>
      </div>
    </BodyLayout>
  )
}

export default AnnouncementPage
