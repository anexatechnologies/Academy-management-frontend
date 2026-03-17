import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { toast } from "sonner"
import { 
  IndianRupee, 
  Percent, 
  CalendarClock, 
  Landmark, 
  Info 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormFooter } from "@/components/ui/form-footer"
import { useFeeSettings, useUpdateFeeSettings } from "@/hooks/api/use-fee-settings"
import { feeSettingsSchema, type FeeSettingsFormValues } from "@/validations/fee-settings"
import { handleApiError } from "@/utils/api-error"
import type { FeeMode } from "@/types/fee-settings"
import type { UseFormSetError } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const FeeSettingsTab = () => {
  const { data: settings } = useFeeSettings()
  const updateSettings = useUpdateFeeSettings()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<FeeSettingsFormValues>({
    resolver: zodResolver(feeSettingsSchema) as any,
    defaultValues: {
      fee_mode: "one-time",
      tax_percentage: "18",
      monthly_tax_percentage: "18",
    },
  })

  useEffect(() => {
    if (settings) {
      reset({
        fee_mode: settings.fee_mode,
        tax_percentage: settings.tax_percentage,
        monthly_tax_percentage: settings.monthly_tax_percentage,
      })
    }
  }, [settings, reset])

  const feeMode = watch("fee_mode")
  const taxPercentage = watch("tax_percentage")
  const monthlyTaxPercentage = watch("monthly_tax_percentage")

  const onSubmit = async (values: FeeSettingsFormValues) => {
    try {
      await updateSettings.mutateAsync({
        settings: {
          fee_mode: values.fee_mode,
          tax_percentage: values.tax_percentage,
          monthly_tax_percentage: values.monthly_tax_percentage,
        },
      })
      toast.success("Fee settings updated successfully")
    } catch (error) {
      handleApiError(error, setError as UseFormSetError<FeeSettingsFormValues>)
    }
  }

  return (
    <div className="max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden shadow-primary/5">
              <div className="p-8 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-b border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Revenue Configuration</h3>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">System-Wide</div>
                </div>
              </div>

              <div className="p-8 space-y-10">
                <div className="space-y-5">
                  <Label 
                    className="text-[13px] font-bold text-slate-400 uppercase tracking-[2px]"
                    required={true}
                  >
                    Fee Collection Mode
                  </Label>
                  <RadioGroup
                    value={feeMode}
                    onValueChange={(value) => setValue("fee_mode", value as FeeMode, { shouldDirty: true })}
                    className="grid grid-cols-2 gap-6 pt-1"
                    disabled={updateSettings.isPending}
                  >
                    <label 
                      htmlFor="fee-one-time" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all gap-3",
                        feeMode === 'one-time' 
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                          : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-200"
                      )}
                    >
                      <RadioGroupItem value="one-time" id="fee-one-time" className="sr-only" />
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        feeMode === 'one-time' ? "bg-primary text-white shadow-lg" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      )}>
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <span className={cn("text-sm font-bold", feeMode === 'one-time' ? "text-primary" : "text-slate-500")}>One-time Payment</span>
                    </label>

                    <label 
                      htmlFor="fee-monthly" 
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all gap-3",
                        feeMode === 'monthly' 
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5" 
                          : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-200"
                      )}
                    >
                      <RadioGroupItem value="monthly" id="fee-monthly" className="sr-only" />
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                        feeMode === 'monthly' ? "bg-primary text-white shadow-lg" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      )}>
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <span className={cn("text-sm font-bold", feeMode === 'monthly' ? "text-primary" : "text-slate-500")}>Monthly Installments</span>
                    </label>
                  </RadioGroup>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                <div className="space-y-8">
                  <h2 className="text-[13px] font-bold text-slate-400 font-bold uppercase tracking-[2px]">Tax Policy (GST)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      {...register("tax_percentage")}
                      label="Standard Tax (%)"
                      required
                      type="number"
                      step="0.01"
                      className="h-12 rounded-xl"
                      error={errors.tax_percentage?.message}
                      disabled={updateSettings.isPending}
                    />
                    <Input
                      {...register("monthly_tax_percentage")}
                      label="Installment Tax (%)"
                      required
                      type="number"
                      step="0.01"
                      className="h-12 rounded-xl"
                      error={errors.monthly_tax_percentage?.message}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-end">
                <FormFooter isLoading={updateSettings.isPending} submitLabel="Update Billing Logic" className="border-none shadow-none p-0 bg-transparent" />
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="space-y-6 sticky top-6">
            <Card className="p-8 border-none bg-gradient-to-br from-primary to-indigo-700 shadow-2xl shadow-primary/20 rounded-[2rem] text-white">
              <div className="flex items-center justify-between mb-8">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Landmark className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Revenue Mode</p>
                  <p className="text-lg font-black uppercase tracking-tight">{feeMode}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 opacity-70" />
                    <span className="text-xs font-bold uppercase tracking-tight">Standard Tax</span>
                  </div>
                  <span className="text-2xl font-black">{taxPercentage || 0}%</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-3">
                    <IndianRupee className="h-5 w-5 opacity-70" />
                    <span className="text-xs font-bold uppercase tracking-tight">Monthly Tax</span>
                  </div>
                  <span className="text-2xl font-black">{monthlyTaxPercentage || 0}%</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[11px] text-white/60 leading-relaxed italic text-center px-4">
                  "These rates are automatically applied when generating student invoices for all batch enrollments."
                </p>
              </div>
            </Card>

            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex gap-4">
               <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
               <div className="space-y-1">
                 <p className="text-[11px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-tight">Compliance Note</p>
                 <p className="text-[11px] text-amber-800/80 dark:text-amber-500/80 leading-relaxed font-medium">
                   Changes to tax rates will not affect existing enrollment records. They only apply to new enrollments from the moment changes are saved.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeeSettingsTab
