import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Phone, Hash, ReceiptText, Image as ImageIcon, Loader2, ShieldCheck } from "lucide-react"

import { FormFooter } from "@/components/ui/form-footer"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "@/components/ui/upload"
import { Label } from "@/components/ui/label"
import { useConfigure, useUpdateConfigure } from "@/hooks/api/use-configure"
import { handleApiError } from "@/utils/api-error"

const configureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  service_tax_reg_no: z.string().optional(),
  cin_no: z.string().optional(),
  logo: z.any().optional(),
})

type ConfigureFormValues = z.infer<typeof configureSchema>

const AcademyInfoTab = () => {
  const { data: configData, isLoading: isFetching } = useConfigure()
  const updateConfigure = useUpdateConfigure()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const form = useForm<ConfigureFormValues>({
    resolver: zodResolver(configureSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      service_tax_reg_no: "",
      cin_no: "",
      logo: null,
    },
  })

  // Set initial form values when data is loaded
  useEffect(() => {
    if (configData) {
      form.reset({
        name: configData.name || "",
        address: configData.address || "",
        phone: configData.phone || "",
        service_tax_reg_no: configData.service_tax_reg_no || "",
        cin_no: configData.cin_no || "",
        logo: null,
      })
      if (configData.logo_url) {
        setLogoPreview(configData.logo_url)
      }
    }
  }, [configData, form])

  const onSubmit = async (values: ConfigureFormValues) => {
    try {
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("address", values.address)
      formData.append("phone", values.phone)
      
      if (values.service_tax_reg_no) {
        formData.append("service_tax_reg_no", values.service_tax_reg_no)
      }
      
      if (values.cin_no) {
        formData.append("cin_no", values.cin_no)
      }
      
      if (values.logo instanceof File) {
        formData.append("logo", values.logo)
      }

      await updateConfigure.mutateAsync(formData)
      toast.success("Academy configuration updated successfully")
    } catch (error) {
      handleApiError(error, form.setError)
      toast.error("Failed to update academy configuration")
    }
  }

  const handleClear = () => {
    if (configData) {
      form.reset({
        name: configData.name || "",
        address: configData.address || "",
        phone: configData.phone || "",
        service_tax_reg_no: configData.service_tax_reg_no || "",
        cin_no: configData.cin_no || "",
        logo: null,
      })
      setLogoPreview(configData.logo_url || null)
    } else {
      form.reset()
      setLogoPreview(null)
    }
  }

  if (isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden shadow-primary/5">
          <div className="p-8 bg-gradient-to-r from-primary/5 via-transparent to-transparent border-b border-slate-100/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Core Configuration</h3>
                <p className="text-xs text-slate-500 font-medium">Ensure accurate details for tax compliance and identification.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Live Synchronization
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="md:col-span-2 group">
                <Input 
                  {...form.register("name")}
                  label="Institute Full Name"
                  required
                  placeholder="e.g. Excellence Academy Group" 
                  className="h-12 rounded-xl text-sm border-slate-200/80 focus:ring-primary/20 transition-all font-medium" 
                  error={form.formState.errors.name?.message as string}
                  disabled={updateConfigure.isPending}
                />
              </div>

              <div className="md:col-span-2">
                <Textarea 
                  {...form.register("address")}
                  label="Registered Address"
                  required
                  placeholder="Street, City, Zip Code..." 
                  className="min-h-[100px] rounded-xl resize-none text-sm border-slate-200/80 focus:ring-primary/20 transition-all font-medium leading-relaxed" 
                  error={form.formState.errors.address?.message as string}
                  disabled={updateConfigure.isPending}
                />
              </div>

              <Input 
                {...form.register("phone")}
                label="Public Phone Number"
                required
                leftIcon={<Phone className="h-4 w-4 text-primary" />}
                placeholder="+91 XXXXX XXXXX" 
                className="h-12 rounded-xl text-sm border-slate-200/80" 
                error={form.formState.errors.phone?.message as string}
                disabled={updateConfigure.isPending}
              />

              <Input 
                {...form.register("service_tax_reg_no")}
                label="GSTIN / Tax ID"
                leftIcon={<ReceiptText className="h-4 w-4 text-primary" />}
                placeholder="Enter GST number" 
                className="h-12 rounded-xl text-sm border-slate-200/80 uppercase" 
                error={form.formState.errors.service_tax_reg_no?.message as string}
                disabled={updateConfigure.isPending}
              />

              <Input 
                {...form.register("cin_no")}
                label="Corporate Identity (CIN)"
                leftIcon={<Hash className="h-4 w-4 text-primary" />}
                placeholder="Enter CIN number" 
                className="h-12 rounded-xl text-sm border-slate-200/80 uppercase" 
                error={form.formState.errors.cin_no?.message as string}
                disabled={updateConfigure.isPending}
              />

              <div className="md:col-span-2 space-y-3">
                <Label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-tight">
                  <ImageIcon className="h-4 w-4 text-primary" /> Official Institution Logo
                </Label>
                <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 group hover:border-primary/50 transition-colors">
                  <Upload
                    accept="image/*"
                    maxFiles={1}
                    imagePreview={logoPreview}
                    onFilesSelected={(files) => {
                      if (files.length > 0) {
                        form.setValue("logo", files[0])
                        setLogoPreview(URL.createObjectURL(files[0]))
                      }
                    }}
                    onRemove={() => {
                      form.setValue("logo", null)
                      setLogoPreview(null)
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 px-1">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <p className="text-[11px] text-slate-500 font-medium tracking-tight">Transparent PNG or High-Res JPG recommended (1:1 ratio).</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-8 py-5 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden md:flex">
                <ShieldCheck className="h-3.5 w-3.5" /> Secure Authentication Required
             </div>
             <FormFooter 
                submitLabel="Apply Global Changes" 
                cancelLabel="Reset Form"
                onCancel={handleClear}
                isLoading={updateConfigure.isPending}
                className="border-none shadow-none p-0 bg-transparent"
              />
          </div>
        </div>
      </form>
    </div>
  )
}

export default AcademyInfoTab
