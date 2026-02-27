import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Loader2, IndianRupee, Percent, CalendarClock } from "lucide-react"
import BodyLayout from "@/components/layout/BodyLayout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormFooter } from "@/components/ui/form-footer"
import { useFeeSettings, useUpdateFeeSettings } from "@/hooks/api/use-fee-settings"
import { feeSettingsSchema, type FeeSettingsFormValues } from "@/validations/fee-settings"
import { handleApiError } from "@/utils/api-error"
import type { FeeMode } from "@/types/fee-settings"
import type { UseFormSetError } from "react-hook-form"

const FeeSettingsPage = () => {
  const { data: settings, isLoading: isFetching } = useFeeSettings()
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

  // Populate form when data loads
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

  const breadcrumbs = useMemo(() => [
    { label: "Settings", href: "/settings" },
    { label: "Fee Settings" },
  ], [])

  if (isFetching) {
    return (
      <BodyLayout breadcrumbs={breadcrumbs}>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </BodyLayout>
    )
  }

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Fee Settings</h1>
          <p className="text-sm text-muted-foreground">Configure fee mode and tax percentages for student billing.</p>
        </div>

        <div className="space-y-6 pb-20">
          {/* Edit Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="p-6 md:p-8 space-y-8">

                {/* Fee Mode */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</span>
                    <Label 
                      className="text-[13px] font-bold text-slate-500 uppercase tracking-widest"
                      required={true}
                    >
                      Fee Mode
                    </Label>
                  </div>
                  <RadioGroup
                    value={feeMode}
                    onValueChange={(value) => setValue("fee_mode", value as FeeMode, { shouldDirty: true })}
                    className="flex flex-row gap-8 pt-1"
                    disabled={updateSettings.isPending}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="one-time"
                        id="fee-one-time"
                        className="h-4 w-4 border-slate-300 dark:border-slate-700 text-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Label htmlFor="fee-one-time" className="text-sm font-medium cursor-pointer text-slate-600 dark:text-slate-400">
                        One-time
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="monthly"
                        id="fee-monthly"
                        className="h-4 w-4 border-slate-300 dark:border-slate-700 text-primary focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <Label htmlFor="fee-monthly" className="text-sm font-medium cursor-pointer text-slate-600 dark:text-slate-400">
                        Monthly
                      </Label>
                    </div>
                  </RadioGroup>
                  {errors.fee_mode && <p className="text-[11px] text-rose-500 font-medium">{errors.fee_mode.message}</p>}
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                {/* Tax Settings */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</span>
                    <h2 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Tax Configuration</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <Input
                      {...register("tax_percentage")}
                      label="Tax Percentage (%)"
                      required={true}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="e.g. 18"
                      className="rounded-lg text-sm"
                      error={errors.tax_percentage?.message}
                      disabled={updateSettings.isPending}
                    />
                    <Input
                      {...register("monthly_tax_percentage")}
                      label="Monthly Tax Percentage (%)"
                      required={true}
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="e.g. 18"
                      className="rounded-lg text-sm"
                      error={errors.monthly_tax_percentage?.message}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 py-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-b-xl">
                <FormFooter
                  isLoading={updateSettings.isPending}
                  submitLabel="Save Settings"
                  loadingLabel="Saving..."
                  cancelHref="/settings"
                  className="border-none shadow-none p-0 bg-transparent mt-0"
                />
              </div>
            </div>
          </form>

          {/* Live Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Current Configuration</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Live preview of your settings</p>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fee Mode */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Mode</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize truncate">
                    {feeMode === "one-time" ? "One-time" : "Monthly"}
                  </p>
                </div>
              </div>

              {/* Tax Percentage */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                  <Percent className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Tax</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {taxPercentage || "0"}%
                  </p>
                </div>
              </div>

              {/* Monthly Tax Percentage */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <IndianRupee className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Monthly Tax</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {monthlyTaxPercentage || "0"}%
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10">
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                  These settings are applied globally when calculating fees for student batch enrollments.
                  {feeMode === "monthly" && " Monthly fees are divided across the batch duration."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BodyLayout>
  )
}

export default FeeSettingsPage
