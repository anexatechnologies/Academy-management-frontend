import { useState } from "react"
import { Plus, MessageSquare, LayoutTemplate, Smartphone, Mail, Trash2, Edit2, Loader2, Sparkles } from "lucide-react"
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
import { handleApiError } from "@/utils/api-error"
import { templateSchema, type TemplateFormValues } from "@/validations/template"
import type { AnnouncementTemplate } from "@/types/announcement"
import { cn } from "@/lib/utils"

const TEMPLATE_CATEGORIES = [
  { label: "Fees & Finance", value: "fees" },
  { label: "Attendance & Leaves", value: "attendance" },
  { label: "Exams & Results", value: "exams" },
  { label: "Enquiry & Admission", value: "enquiry" },
  { label: "General Notice", value: "general" },
]

const CHANNELS = [
  { label: "SMS Gateway", value: "sms", icon: Smartphone },
  { label: "Email Service", value: "email", icon: Mail },
  { label: "App Notification", value: "app", icon: MessageSquare },
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

const TemplatesTab = () => {
  const { data: templates, isLoading } = useAnnouncementTemplates()
  const createTemplate = useCreateAnnouncementTemplate()
  const updateTemplate = useAnnouncementUpdateTemplate()
  const deleteTemplate = useDeleteAnnouncementTemplate()

  const [isOpen, setIsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AnnouncementTemplate | null>(null)
  
  const [selectedCategory, setSelectedCategory] = useState("general")
  const [selectedChannel, setSelectedChannel] = useState("sms")
  const [templateName, setTemplateName] = useState("")

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema) as any,
    defaultValues: {
      body: "",
      template_id: "",
    },
  })

  const resetLocalState = () => {
    setTemplateName("")
    setSelectedCategory("general")
    setSelectedChannel("sms")
    setEditingTemplate(null)
    form.reset({
      body: "",
      template_id: "",
    })
  }

  const handleOpenEdit = (template: AnnouncementTemplate) => {
    setEditingTemplate(template)
    setTemplateName(template.template_name)
    setSelectedCategory(template.category)
    setSelectedChannel(template.channel)
    form.reset({
      body: template.body,
      template_id: template.dlt_template_id || "",
    })
    setIsOpen(true)
  }

  const handleOpenAdd = () => {
    resetLocalState()
    setIsOpen(true)
  }

  const onSubmit = async (values: TemplateFormValues) => {
    if (!templateName.trim()) {
      toast.error("Template name is required")
      return
    }

    try {
      const payload = {
        template_name: templateName,
        category: selectedCategory,
        channel: selectedChannel,
        body: values.body,
        dlt_template_id: values.template_id,
        is_active: true,
      }

      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, ...payload })
        toast.success("Template updated successfully")
      } else {
        await createTemplate.mutateAsync(payload)
        toast.success("Template created successfully")
      }
      setIsOpen(false)
      resetLocalState()
    } catch (error) {
      handleApiError(error, form.setError)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return
    try {
      await deleteTemplate.mutateAsync(id)
      toast.success("Template deleted successfully")
    } catch (error) {
      handleApiError(error)
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    const currentBody = form.getValues("body")
    form.setValue("body", currentBody + placeholder)
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-3">
            Message Templates
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-black">
              {templates?.length || 0}
            </span>
          </h2>
          <p className="text-sm font-medium text-slate-400">Design reusable messages for automated notifications.</p>
        </div>
        <Button onClick={handleOpenAdd} className="h-12 px-6 rounded-2xl flex items-center gap-2 font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Plus className="h-5 w-5" /> New Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {templates?.length === 0 ? (
          <div className="col-span-full h-80 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-6 group hover:bg-slate-50 transition-colors">
            <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-700 shadow-sm transition-transform group-hover:scale-110">
              <MessageSquare className="h-10 w-10" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">No Templates Found</p>
              <p className="text-sm font-medium text-slate-400">Click the button above to create your first notification template.</p>
            </div>
          </div>
        ) : (
          templates?.map((tpl) => (
            <div key={tpl.id} className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-7 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {(() => {
                        const channel = CHANNELS.find(c => c.value === tpl.channel)
                        const Icon = channel ? channel.icon : MessageSquare
                        return <Icon className="h-5 w-5" />
                      })()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[140px] uppercase">{tpl.template_name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{tpl.category}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(tpl)} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tpl.id)} className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex-1 border border-slate-200/50 dark:border-slate-700/50">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-4 leading-relaxed italic">
                  "{tpl.body}"
                </p>
              </div>

              {tpl.dlt_template_id && (
                <div className="mt-4 flex items-center gap-2">
                   <div className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                     DLT: {tpl.dlt_template_id}
                   </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl rounded-xl p-0 overflow-hidden outline-none border-none shadow-3xl bg-white dark:bg-slate-950 flex flex-col max-h-[85vh]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 h-full">
            <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-white dark:bg-slate-950 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <LayoutTemplate className="h-7 w-7" />
                </div>
                <div className="space-y-0.5">
                  <DialogTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {editingTemplate ? "Modify Template" : "New Template"}
                  </DialogTitle>
                  <p className="text-sm font-medium text-slate-400">Draft your message with dynamic placeholders.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8 min-h-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    Message Body
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {form.watch("body")?.length || 0} Chars
                    </span>
                  </div>
                </div>
                <div className="relative group">
                  <Textarea 
                    {...form.register("body")}
                    required 
                    className="min-h-[220px] rounded-3xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary/30 focus:ring-0 transition-all p-6 text-base leading-relaxed resize-none shadow-inner"
                    placeholder="Enter message text here... use placeholders for dynamic data."
                    error={form.formState.errors.body?.message}
                  />
                  <div className="absolute right-4 bottom-4">
                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                       <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/50">
                  <div className="flex flex-wrap gap-2">
                    {PLACEHOLDERS.map((ph) => (
                      <button
                        key={ph.value}
                        type="button"
                        onClick={() => insertPlaceholder(ph.value)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Plus className="h-3 w-3" />
                        {ph.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-1">Identity & Classification</h4>
                   <div className="space-y-4">
                      <Input 
                        label="Template Name" 
                        required 
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900" 
                        placeholder="e.g. Fee Reminder - June"
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                      />
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-0.5">Template Category</label>
                        <CustomSelect 
                          options={TEMPLATE_CATEGORIES} 
                          value={selectedCategory} 
                          onValueChange={setSelectedCategory}
                          triggerClassName="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-100"
                        />
                      </div>
                   </div>
                </div>
                
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-1">Delivery Channel</h4>
                   <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        {CHANNELS.map((ch) => {
                          const Icon = ch.icon
                          const isActive = selectedChannel === ch.value
                          return (
                            <button
                              key={ch.value}
                              type="button"
                              onClick={() => setSelectedChannel(ch.value)}
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all",
                                isActive 
                                  ? "bg-primary/5 border-primary shadow-lg shadow-primary/10 text-primary" 
                                  : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-400"
                              )}
                            >
                              <Icon className={cn("h-5 w-5", isActive && "animate-bounce")} />
                              <span className="text-[9px] font-black uppercase tracking-tight">{ch.label}</span>
                            </button>
                          )
                        })}
                      </div>
                      
                      {selectedChannel === 'sms' && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                          <Input 
                            {...form.register("template_id")}
                            label="DLT Template ID" 
                            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-900 font-mono" 
                            placeholder="Enter DLT ID if required"
                            error={form.formState.errors.template_id?.message}
                          />
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/30 dark:bg-slate-900/30">
              <FormFooter 
                isLoading={createTemplate.isPending || updateTemplate.isPending}
                onCancel={() => setIsOpen(false)}
                submitLabel={editingTemplate ? "Publish Changes" : "Create Template"}
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
