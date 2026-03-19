import { useState, useMemo } from "react"
import { Plus, MessageSquare, LayoutTemplate, Smartphone, Mail, Filter, Loader2, Target as TargetIcon, Share2, Type, AlertCircle, Hash, Settings2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { 
  useTemplates as useAnnouncementTemplates, 
  useCreateTemplate as useCreateAnnouncementTemplate, 
  useUpdateTemplate as useAnnouncementUpdateTemplate, 
  useDeleteTemplate as useDeleteAnnouncementTemplate 
} from "@/hooks/api/use-templates"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CustomSelect } from "@/components/ui/custom-select"
import { FormFooter } from "@/components/ui/form-footer"
import { EditButton } from "@/components/ui/edit-button"
import { DeleteButton } from "@/components/ui/delete-button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { handleApiError } from "@/utils/api-error"
import { templateSchema, type TemplateFormValues } from "@/validations/template"
import type { AnnouncementTemplate } from "@/types/announcement"
import { cn } from "@/lib/utils"

const TEMPLATE_CATEGORIES = [
  { label: "Birthday Wish", value: "birthday" },
  { label: "Admission Confirmation", value: "admission" },
  { label: "Fee Receipt", value: "fee_receipt" },
  { label: "Attendance Alert", value: "attendance" },
  { label: "General Notice", value: "general" },
  { label: "Summer Camp", value: "summer_camp" },
]

const CHANNELS = [
  { label: "SMS Gateway", value: "sms", icon: Smartphone },
  { label: "WhatsApp Chat", value: "whatsapp", icon: MessageSquare },
  { label: "Official Email", value: "email", icon: Mail },
]

const PLACEHOLDERS = [
  { label: "Full Name", value: "{name}" },
  { label: "Course Name", value: "{course}" },
  { label: "Batch Name", value: "{batch}" },
  { label: "Total Fees", value: "{total_fees}" },
  { label: "Paid Fees", value: "{paid_fees}" },
  { label: "Balance", value: "{balance}" },
  { label: "Due Date", value: "{due_date}" },
]

const TARGETS = [
  { label: "Student", value: "student" },
  { label: "Parent", value: "parent" },
  { label: "Both Recipients", value: "both" },
]

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const TemplatesTab = () => {
  const { data: templates, isLoading } = useAnnouncementTemplates()
  const createTemplate = useCreateAnnouncementTemplate()
  const updateTemplate = useAnnouncementUpdateTemplate()
  const deleteTemplate = useDeleteAnnouncementTemplate()

  const [isOpen, setIsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AnnouncementTemplate | null>(null)
  
  // Filters state
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterChannel, setFilterChannel] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema) as any,
    defaultValues: {
      template_name: "",
      category: "general",
      channel: "sms",
      body: "",
      target: "student",
      template_id: "",
      entity_id: "",
    },
  })

  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    return templates.filter(tpl => {
      const matchCategory = filterCategory === "all" || tpl.category === filterCategory
      const matchChannel = filterChannel === "all" || tpl.channel === filterChannel
      const matchStatus = filterStatus === "all" || (filterStatus === "active" ? tpl.is_active : !tpl.is_active)
      return matchCategory && matchChannel && matchStatus
    })
  }, [templates, filterCategory, filterChannel, filterStatus])

  const handleOpenEdit = (template: AnnouncementTemplate) => {
    setEditingTemplate(template)
    form.reset({
      template_name: template.template_name,
      category: template.category,
      channel: template.channel,
      body: template.body,
      target: template.target || "student",
      template_id: template.dlt_template_id || "",
      entity_id: template.entity_id || "",
    })
    setIsOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingTemplate(null)
    form.reset({
      template_name: "",
      category: "general",
      channel: "sms",
      body: "",
      target: "student",
      template_id: "",
      entity_id: "",
    })
    setIsOpen(true)
  }

  const onSubmit = async (values: TemplateFormValues) => {
    try {
      const payload = {
        ...values,
        dlt_template_id: values.template_id, 
        is_active: true,
      }

      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, ...payload })
        toast.success("Template updated successfully")
      } else {
        await createTemplate.mutateAsync(payload as any)
        toast.success("Template created successfully")
      }
      setIsOpen(false)
      form.reset()
    } catch (error) {
      handleApiError(error, form.setError)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate.mutateAsync(id)
      toast.success("Template removed from local system")
    } catch (error) {
      handleApiError(error)
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    const currentBody = form.getValues("body")
    form.setValue("body", (currentBody || "") + placeholder)
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & New Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Message Hub
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-black">
              {templates?.length || 0}
            </span>
          </h2>
          <p className="text-sm font-medium text-slate-400 font-mono tracking-tight">Standardized content for automated triggers.</p>
        </div>
        <Button onClick={handleOpenAdd} className="h-12 px-8 rounded-full flex items-center gap-2 font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary">
          <Plus className="h-5 w-5" /> Add New Template
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-primary group">
          <Filter className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Quick Filters</span>
        </div>
        
        <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />

        <div className="flex-1 min-w-[200px]">
          <CustomSelect 
            value={filterCategory}
            onValueChange={setFilterCategory}
            options={[{ label: "All Categories", value: "all" }, ...TEMPLATE_CATEGORIES]}
            triggerClassName="h-11 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <CustomSelect 
            value={filterChannel}
            onValueChange={setFilterChannel}
            options={[{ label: "All Channels", value: "all" }, ...CHANNELS.map(c => ({ label: c.label, value: c.value }))]}
            triggerClassName="h-11 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <CustomSelect 
            value={filterStatus}
            onValueChange={setFilterStatus}
            options={[{ label: "All Status", value: "all" }, ...STATUS_OPTIONS]}
            triggerClassName="h-11 rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-950 text-xs font-bold"
          />
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full h-80 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-6 group hover:bg-slate-100/50 transition-colors">
            <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-700 shadow-sm transition-transform group-hover:scale-110">
              <MessageSquare className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">Zero Matches Found</p>
              <p className="text-sm font-medium text-slate-400">Try adjusting your filters or create a new template.</p>
            </div>
          </div>
        ) : (
          filteredTemplates.map((tpl) => (
            <div 
              key={tpl.id} 
              className={cn(
                "group relative bg-white dark:bg-slate-900 rounded-2xl border-2 p-7 transition-all duration-500 flex flex-col overflow-hidden",
                tpl.channel === 'sms' ? "border-amber-100 dark:border-amber-900/30 hover:shadow-2xl hover:shadow-amber-500/10" :
                tpl.channel === 'whatsapp' ? "border-emerald-100 dark:border-emerald-900/30 hover:shadow-2xl hover:shadow-emerald-500/10" :
                "border-blue-100 dark:border-blue-900/30 hover:shadow-2xl hover:shadow-blue-500/10"
              )}
            >
              <div className={cn(
                "absolute top-0 left-0 bottom-0 w-2",
                tpl.channel === 'sms' ? "bg-amber-500" :
                tpl.channel === 'whatsapp' ? "bg-emerald-500" :
                "bg-blue-500"
              )} />

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg shrink-0",
                    tpl.channel === 'sms' ? "bg-amber-500/10 text-amber-500 shadow-amber-500/5" :
                    tpl.channel === 'whatsapp' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/5" :
                    "bg-blue-500/10 text-blue-500 shadow-blue-500/5"
                  )}>
                    {tpl.channel === 'sms' ? <Smartphone className="h-7 w-7" /> : 
                     tpl.channel === 'whatsapp' ? <MessageSquare className="h-7 w-7" /> : 
                     <Mail className="h-7 w-7" />}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-[13px] text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[150px] uppercase tracking-tight">{tpl.template_name}</h3>
                    <div className="flex items-center gap-2">
                       <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                          tpl.channel === 'sms' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" :
                          tpl.channel === 'whatsapp' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                       )}>
                        {tpl.category.replace('_', ' ')}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl p-5 flex-1 border border-slate-200/50 dark:border-slate-700/50 mb-6 backdrop-blur-sm">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-4 leading-relaxed italic">
                  "{tpl.body}"
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto">
                 <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Target</span>
                       <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{tpl.target || 'Student'}</span>
                    </div>
                    {tpl.is_active && (
                       <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</span>
                          <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Active</span>
                       </div>
                    )}
                 </div>
                 <div className="flex items-center gap-2">
                    <EditButton title="Template" onEdit={() => handleOpenEdit(tpl)} />
                    <DeleteButton title="Template" onDelete={() => handleDelete(tpl.id)} />
                 </div>
              </div>

              {tpl.dlt_template_id && (
                <div className="absolute top-4 right-4 group-hover:top-[-20px] transition-all duration-300 opacity-100 group-hover:opacity-0">
                  <div className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-950 text-[8px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                    ID: {tpl.dlt_template_id}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl rounded-xl p-0 overflow-hidden border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col max-h-[96vh]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
            {/* Standard Header */}
            <div className="p-8 pb-5 border-b border-slate-100 dark:border-slate-900 flex items-center justify-between bg-white dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/20">
                  <LayoutTemplate className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <DialogTitle className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                    {editingTemplate ? "Configure Template" : "New Template"}
                  </DialogTitle>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Configuration Panel</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 overflow-x-hidden">
              {/* 1. MESSAGE BODY AT THE TOP */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                   <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
                      <Type className="h-5 w-5 text-primary" />
                      <h4 className="text-[12px] font-black uppercase tracking-[2px]">1. Template Message</h4>
                   </div>
                   <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {form.watch("body")?.length || 0} Characters
                   </div>
                </div>

                <div className="space-y-6">
                   <Textarea 
                      {...form.register("body")}
                      required 
                      className="min-h-[220px] rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:bg-white transition-all p-8 text-base leading-relaxed resize-none font-medium"
                      placeholder="Paste your portal-approved content here..."
                      error={form.formState.errors.body?.message}
                    />

                    <div className="p-6 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 space-y-4">
                       <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-primary" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">Insert Data Fields</p>
                       </div>
                       <div className="flex flex-wrap gap-2.5">
                         {PLACEHOLDERS.map((ph) => (
                           <button
                             key={ph.value}
                             type="button"
                             onClick={() => insertPlaceholder(ph.value)}
                             className="px-4 py-2 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 text-[10px] font-black text-slate-600 hover:border-primary hover:text-primary transition-all active:scale-95 shadow-sm cursor-pointer"
                           >
                             {ph.label}
                           </button>
                         ))}
                       </div>
                    </div>
                </div>
              </div>

              {/* 2. IDENTITY */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-900 pb-4">
                   <Settings2 className="h-5 w-5 text-primary" />
                   <h4 className="text-[12px] font-black uppercase tracking-[2px]">2. Identification</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Input 
                    {...form.register("template_name")}
                    label="Internal Alias" 
                    required 
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 focus:bg-white" 
                    placeholder="e.g. Admission Confirmation"
                    error={form.formState.errors.template_name?.message}
                  />

                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-900 dark:text-slate-100 ml-1 uppercase tracking-widest">Category</label>
                     <CustomSelect 
                        options={TEMPLATE_CATEGORIES} 
                        value={form.watch("category")} 
                        onValueChange={(val) => form.setValue("category", val)}
                        triggerClassName="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* 3. AUDIENCE */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-900 pb-4">
                    <TargetIcon className="h-5 w-5 text-primary" />
                    <h4 className="text-[12px] font-black uppercase tracking-[2px]">3. Target Audience</h4>
                 </div>
                 
                 <RadioGroup 
                   value={form.watch("target")} 
                   onValueChange={(val: any) => form.setValue("target", val)}
                   className="flex flex-col gap-3 ml-2"
                 >
                   {TARGETS.map(t => (
                     <div key={t.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={t.value} id={`target-${t.value}`} />
                        <label htmlFor={`target-${t.value}`} className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer">{t.label}</label>
                     </div>
                   ))}
                 </RadioGroup>
              </div>

              {/* 4. CHANNEL */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-900 pb-4">
                    <Share2 className="h-5 w-5 text-primary" />
                    <h4 className="text-[12px] font-black uppercase tracking-[2px]">4. Delivery Channel</h4>
                 </div>
                 
                 <RadioGroup 
                   value={form.watch("channel")} 
                   onValueChange={(val: any) => form.setValue("channel", val)}
                   className="flex flex-col gap-3 ml-2"
                 >
                   {CHANNELS.map(ch => (
                     <div key={ch.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={ch.value} id={`channel-${ch.value}`} />
                        <label htmlFor={`channel-${ch.value}`} className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-2">
                           <ch.icon className="h-4 w-4 text-primary" /> {ch.label}
                        </label>
                     </div>
                   ))}
                 </RadioGroup>
              </div>

              {/* 5. SMS METADATA */}
              {form.watch("channel") === 'sms' && (
                <div className="space-y-8 animate-in slide-in-from-top-4 fade-in duration-500 pt-4">
                  <div className="flex items-center gap-3 text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-900 pb-4">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    <h4 className="text-[12px] font-black uppercase tracking-[2px]">5. SMS Gateway Details</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                      {...form.register("template_id")}
                      label="DLT Template ID" 
                      required
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 focus:bg-white" 
                      placeholder="e.g. 1707161829..."
                      error={form.formState.errors.template_id?.message}
                    />

                    <Input 
                      {...form.register("entity_id")}
                      label="Principal Entity ID" 
                      required
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 focus:bg-white" 
                      placeholder="e.g. 1201159..."
                      error={form.formState.errors.entity_id?.message}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 pt-5 border-t border-slate-100 dark:border-slate-900 bg-slate-50/20 shrink-0">
              <FormFooter 
                isLoading={createTemplate.isPending || updateTemplate.isPending}
                onCancel={() => setIsOpen(false)}
                submitLabel={editingTemplate ? "Publish Changes" : "Save Template"}
                className="border-none shadow-none p-0 bg-transparent mt-0"
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TemplatesTab
