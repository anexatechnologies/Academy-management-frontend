import { useMemo } from "react"
import { toast } from "sonner"
import { ShieldCheck, Loader2, Info, MessageSquare, BellRing } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useMessagingSettings, useUpdateMessagingSettings } from "@/hooks/api/use-settings"
import { useTemplates } from "@/hooks/api/use-templates"
import { handleApiError } from "@/utils/api-error"
import { usePermissions } from "@/hooks/use-permissions"
import { cn } from "@/lib/utils"

const MessagingTab = () => {
  const { hasPermission } = usePermissions()
  const canUpdate = hasPermission("settings", "update")
  const { data: settings, isLoading: settingsLoading } = useMessagingSettings()
  const { data: templates, isLoading: templatesLoading } = useTemplates()
  const updateSettings = useUpdateMessagingSettings()

  const uniqueCategories = useMemo(() => {
    if (!templates) return []
    const categories = templates.map(t => t.category)
    return Array.from(new Set(categories)).sort()
  }, [templates])

  const handleToggle = async (key: string, value: boolean) => {
    try {
      const settingsPayload: Record<string, string> = { [key]: value.toString() }
      await updateSettings.mutateAsync(settingsPayload)
      toast.success("Messaging preference updated")
    } catch (error) {
      handleApiError(error)
    }
  }

  const isEnabled = (key: string, group: "master" | "alerts" | "triggers") => {
    if (!settings) return true
    
    let val: string | undefined
    if (group === "master") val = settings.grouped.messaging_master.messaging_master_enabled
    if (group === "alerts") val = (settings.grouped.alerts as any)[key]
    if (group === "triggers") val = settings.grouped.messaging_triggers[key]
    
    return val === undefined ? true : val === "true"
  }

  if (settingsLoading || templatesLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const masterEnabled = isEnabled("messaging_master_enabled", "master")

  return (
    <div className="max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Master Switch Card */}
          <div className={cn(
            "relative group p-10 rounded-[3rem] border-2 transition-all duration-500 overflow-hidden shadow-2xl shadow-slate-200/20 dark:shadow-none",
            masterEnabled 
              ? "border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-500/5 shadow-emerald-500/10" 
              : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950"
          )}>
            {masterEnabled && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
            )}

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <div className={cn(
                  "h-20 w-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 shadow-xl",
                  masterEnabled 
                    ? "bg-emerald-500 text-white rotate-12 scale-110 shadow-emerald-500/40" 
                    : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                )}>
                  <ShieldCheck className="h-10 w-10" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Messaging Master Switch</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                    Absolute control override. When disabled, all outgoing communication across SMS and WhatsApp is suspended immediately.
                  </p>
                </div>
              </div>
              <Checkbox 
                checked={masterEnabled} 
                onCheckedChange={(checked) => handleToggle("messaging_master_enabled", !!checked)}
                className="h-10 w-10 rounded-2xl shrink-0"
                disabled={updateSettings.isPending || !canUpdate}
              />
            </div>
          </div>

          <div className={cn(
            "space-y-10 transition-all duration-500",
            !masterEnabled && "opacity-40 grayscale pointer-events-none scale-[0.98]"
          )}>
            {/* Gateways Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="h-1.5 w-8 rounded-full bg-primary" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Communication Gateways</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-10 space-y-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/10 hover:border-primary transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-900/50">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5 text-primary">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <span className="font-black text-xs uppercase tracking-[3px]">SMS Gateway</span>
                    </div>
                    <Checkbox 
                      checked={isEnabled("sms_enabled", "alerts")}
                      onCheckedChange={(checked) => handleToggle("sms_enabled", !!checked)}
                      disabled={updateSettings.isPending || !canUpdate}
                      className="rounded-xl h-6 w-6"
                    />
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium relative z-10">
                    High-priority transactional alerts over DLT-approved routes.
                  </p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                </Card>

                <Card className="p-10 space-y-8 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/10 hover:border-emerald-500 transition-all duration-300 relative overflow-hidden bg-white dark:bg-slate-900/50">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-5 text-emerald-600">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <span className="font-black text-xs uppercase tracking-[3px]">WhatsApp Cloud</span>
                    </div>
                    <Checkbox 
                      checked={isEnabled("whatsapp_enabled", "alerts")}
                      onCheckedChange={(checked) => handleToggle("whatsapp_enabled", !!checked)}
                      disabled={updateSettings.isPending || !canUpdate}
                      className="rounded-xl h-6 w-6"
                    />
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium relative z-10">
                    Interactive media and real-time support via Meta Business Suite.
                  </p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                </Card>
              </div>
            </div>

            {/* Dynamic Triggers Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="h-1.5 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[4px]">Automated Trigger Points</h4>
              </div>
              
              <Card className="rounded-[3rem] border border-slate-200 dark:border-slate-800/60 overflow-hidden bg-white dark:bg-slate-950/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50">
                        <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Trigger Context</th>
                        <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">SMS Route</th>
                        <th className="p-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">WhatsApp Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {uniqueCategories.map((category) => (
                        <tr key={category} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                <BellRing className="h-5 w-5" />
                              </div>
                              <span className="font-bold text-slate-700 dark:text-slate-300 capitalize text-sm">{category.replace(/_/g, ' ')}</span>
                            </div>
                          </td>
                          <td className="p-8 text-center">
                            <Checkbox 
                              checked={isEnabled(`${category}_sms_enabled`, "triggers")}
                              onCheckedChange={(checked) => handleToggle(`${category}_sms_enabled`, !!checked)}
                              disabled={updateSettings.isPending || !canUpdate}
                              className="mx-auto rounded-lg h-5 w-5"
                            />
                          </td>
                          <td className="p-8 text-center">
                            <Checkbox 
                              checked={isEnabled(`${category}_whatsapp_enabled`, "triggers")}
                              onCheckedChange={(checked) => handleToggle(`${category}_whatsapp_enabled`, !!checked)}
                              disabled={updateSettings.isPending || !canUpdate}
                              className="mx-auto rounded-lg h-5 w-5"
                            />
                          </td>
                        </tr>
                      ))}
                      {uniqueCategories.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-20 text-center text-slate-400 font-medium italic">
                            No trigger categories detected from templates registry.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4">
          <div className="space-y-8 sticky top-10">
            <div className="p-10 rounded-[3rem] bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-800/30 space-y-8">
              <div className="flex items-center gap-4 text-indigo-700 dark:text-indigo-400">
                <div className="h-10 w-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Info className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest">Control Protocol</h4>
              </div>
              <ul className="space-y-6">
                <li className="text-[13px] text-indigo-900/60 dark:text-indigo-400/60 font-medium leading-relaxed flex gap-4">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0 animate-pulse" />
                  <span className="flex-1"><strong className="text-indigo-900/90 dark:text-indigo-400/90 block mb-1 uppercase text-[10px] tracking-widest">Master Precedence</strong> The Global Kill-switch acts on the dispatch layer; no channel checks occur if this is OFF.</span>
                </li>
                <li className="text-[13px] text-indigo-900/60 dark:text-indigo-400/60 font-medium leading-relaxed flex gap-4">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0 animate-pulse" />
                  <span className="flex-1"><strong className="text-indigo-900/90 dark:text-indigo-400/90 block mb-1 uppercase text-[10px] tracking-widest">Dynamic Discovery</strong> New templates automatically manifest as toggle-able triggers based on their category alias.</span>
                </li>
                <li className="text-[13px] text-indigo-900/60 dark:text-indigo-400/60 font-medium leading-relaxed flex gap-4">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0 animate-pulse" />
                  <span className="flex-1"><strong className="text-indigo-900/90 dark:text-indigo-400/90 block mb-1 uppercase text-[10px] tracking-widest">Auto-Provisioning</strong> Saving a new trigger key to preferences implicitly registers it in the backend registry.</span>
                </li>
              </ul>
            </div>
            
            <Card className="p-10 rounded-[3rem] border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative shadow-2xl">
               <div className="relative z-10 space-y-4">
                 <p className="text-[11px] font-black uppercase tracking-[4px] text-slate-500">Service Status</p>
                 <div className="flex items-baseline gap-2">
                   <h5 className="text-4xl font-black tabular-nums">{uniqueCategories.length}</h5>
                   <span className="text-sm font-bold opacity-40 uppercase tracking-widest">Active Contexts</span>
                 </div>
               </div>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagingTab
