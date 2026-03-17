import { useState, useMemo } from "react"
import { Filter, Pencil, Loader2, MessageSquare, Info, Variable, Hash, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { useTemplates, useUpdateTemplate } from "@/hooks/api/use-templates"
import { handleApiError } from "@/utils/api-error"
import type { AnnouncementTemplate } from "@/types/announcement"
import { cn } from "@/lib/utils"

import { SearchBar } from "@/components/ui/search-bar"
import { CustomSelect } from "@/components/ui/custom-select"

const PLACEHOLDERS = [
  { tag: "[StudentName]", description: "Full name of the student" },
  { tag: "[Amount]", description: "Total fee amount" },
  { tag: "[Date]", description: "Transaction date or Due date" },
  { tag: "[CourseName]", description: "Name of the enrolled course" },
  { tag: "[AcademyName]", description: "Your institute name" },
]

const TemplatesTab = () => {
  const [params, setParams] = useState({ category: "all", channel: "all", search: "" })
  const { data: templates, isLoading } = useTemplates({
    category: params.category === "all" ? undefined : params.category,
    channel: params.channel === "all" ? undefined : params.channel,
    search: params.search || undefined,
  })
  const updateTemplate = useUpdateTemplate()

  const [isOpen, setIsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AnnouncementTemplate | null>(null)
  const [formData, setFormData] = useState({
    body: "",
    template_id: "", // DLT Template ID
  })

  const handleOpenEdit = (template: AnnouncementTemplate) => {
    setEditingTemplate(template)
    setFormData({
      body: template.body,
      template_id: "", // Assuming this might be added to type later or handled separately
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTemplate) return
    try {
      await updateTemplate.mutateAsync({ 
        id: editingTemplate.id, 
        body: formData.body,
        // template_id: formData.template_id 
      })
      toast.success("Template updated successfully")
      setIsOpen(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    return templates.filter(t => 
      t.template_name.toLowerCase().includes(params.search.toLowerCase()) ||
      t.category.toLowerCase().includes(params.search.toLowerCase())
    )
  }, [templates, params.search])

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Sticky Filter Bar */}
      <div className="sticky top-[80px] z-20 bg-white dark:bg-slate-950 py-3 border-b border-slate-200 dark:border-slate-800 transition-all">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto py-2 px-2 scrollbar-none">
            <SearchBar
              placeholder="Search templates..." 
              className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              value={params.search}
              onChange={(e) => setParams(p => ({ ...p, search: e.target.value }))}
            />
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 shrink-0" />

            <CustomSelect
              value={params.category}
              onValueChange={(v) => setParams(p => ({ ...p, category: v }))}
              triggerClassName="w-[150px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shrink-0"
              options={[
                { value: "all", label: "All Categories" },
                { value: "announcement", label: "Announcement" },
                { value: "fee_reminder", label: "Fee Reminder" },
                { value: "birthday", label: "Birthday" },
                { value: "payment_receipt", label: "Payment Receipt" },
              ]}
            />

            <CustomSelect
              value={params.channel}
              onValueChange={(v) => setParams(p => ({ ...p, channel: v }))}
              triggerClassName="w-[130px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shrink-0"
              options={[
                { value: "all", label: "All Channels" },
                { value: "sms", label: "SMS" },
                { value: "whatsapp", label: "WhatsApp" },
              ]}
            />

            {(params.search || params.category !== "all" || params.channel !== "all") && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0" 
                onClick={() => setParams({ search: "", category: "all", channel: "all" })}
                title="Clear Filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            <div className="flex md:hidden lg:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums font-mono whitespace-nowrap">
                {filteredTemplates.length} Found
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
               <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{template.template_name}</h3>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">{template.category}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                        template.channel === 'whatsapp' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>{template.channel}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleOpenEdit(template)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
               </div>
            </div>
            <div className="p-4 flex-1 relative">
               <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-3">
                 "{template.body}"
               </p>
               <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-slate-950 to-transparent opacity-50 group-hover:opacity-0 transition-opacity" />
            </div>
            <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Variable className="h-3 w-3" />
                <span className="text-[9px] font-bold uppercase tracking-tight">Standardized</span>
              </div>
              <Button variant="link" size="sm" className="h-6 text-[10px] font-bold uppercase tracking-widest p-0" onClick={() => handleOpenEdit(template)}>
                Edit Content
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden outline-none border-none shadow-3xl bg-white dark:bg-slate-950">
          <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-white dark:bg-slate-950 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Template Designer
                  </DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-[9px] font-bold text-slate-500 border border-slate-100 dark:border-slate-700 uppercase tracking-widest leading-none flex items-center h-4">{editingTemplate?.template_name}</span>
                    <span className="h-1 w-1 rounded-full bg-primary/40" />
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none flex items-center h-4">{editingTemplate?.category}</span>
                  </div>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8">
              {/* Message Content Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Message Body</Label>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50 tabular-nums">
                      {formData.body.length} Characters
                    </span>
                  </div>
                </div>
                <Textarea 
                  required
                  rows={6}
                  className="rounded-[1.5rem] resize-none text-[14px] font-medium leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 focus:ring-primary/20 p-6 min-h-[180px] shadow-sm transition-all focus:bg-white dark:focus:bg-slate-950"
                  value={formData.body}
                  placeholder="Draft your communication here..."
                  onChange={(e) => setFormData(p => ({ ...p, body: e.target.value }))}
                />
              </div>

              {/* Placeholder Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Variable className="h-3 w-3 text-primary" />
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Variable Injection</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PLACEHOLDERS.map((p) => (
                    <button 
                      key={p.tag} 
                      type="button"
                      className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-850 transition-all shadow-sm active:scale-95 text-left"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, body: prev.body + " " + p.tag }))
                        toast.success(`Injected ${p.tag}`)
                      }}
                    >
                      <div className="flex flex-col">
                        <code className="text-[11px] font-black text-primary leading-tight">{p.tag}</code>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100">{p.description}</span>
                      </div>
                      <Plus className="h-3 w-3 text-slate-300 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway Section */}
              <div className="space-y-4">
                <Input 
                  label="DLT Compliance ID"
                  placeholder="19-digit DLT ID"
                  value={formData.template_id}
                  onChange={(e) => setFormData(p => ({ ...p, template_id: e.target.value }))}
                  leftIcon={<Hash className="h-5 w-5" />}
                />
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic px-1">
                  Essential for SMS delivery status and regulatory tracking in compliance with TRAI regulations.
                </p>
              </div>

              {/* Warning box */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 flex items-center gap-4">
                <Info className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700/80 dark:text-amber-500/70 font-semibold leading-relaxed italic">
                   Note: Parameters must remain within square brackets `[...]` to follow regulatory protocols.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
               <Button type="button" variant="ghost" className="rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[10px] text-slate-400" onClick={() => setIsOpen(false)}>
                 Cancel
               </Button>
               <Button type="submit" className="rounded-xl px-10 h-11 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20" disabled={updateTemplate.isPending}>
                 {updateTemplate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authorize & Sync"}
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TemplatesTab
