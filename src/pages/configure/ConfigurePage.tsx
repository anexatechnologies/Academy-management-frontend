import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Building, Phone, Hash, ReceiptText, Image as ImageIcon, Loader2 } from "lucide-react"

import BodyLayout from "@/components/layout/BodyLayout"
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

const ConfigurePage = () => {
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
        logo: null, // Don't try to set a File object from URL
      })
      if (configData.logo_url) {
        setLogoPreview(configData.logo_url)
      }
    }
  }, [configData, form])

  const onSubmit = async (values: ConfigureFormValues) => {
    try {
      // Create FormData properly
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

  const breadcrumbs = [
    { label: "Configure", href: "/configure" },
    { label: "Institute Details" },
  ]

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
      <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configure Academy</h1>
          <p className="text-sm text-muted-foreground">Manage your institute or company information.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="relative flex flex-col">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative">
            <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Institute / Company Information</h3>
                  <p className="text-sm text-slate-500 font-medium">This information will be displayed on reports and receipts.</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 pb-24 md:pb-28">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="md:col-span-2">
                  <Input 
                    {...form.register("name")}
                    label="Name"
                    required
                    placeholder="Enter academy name" 
                    className="h-10 rounded-lg text-sm" 
                    error={form.formState.errors.name?.message as string}
                    disabled={updateConfigure.isPending}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea 
                    {...form.register("address")}
                    label="Address"
                    required
                    placeholder="Enter full address" 
                    className="min-h-[80px] rounded-lg resize-none text-sm" 
                    error={form.formState.errors.address?.message as string}
                    disabled={updateConfigure.isPending}
                  />
                </div>

                <Input 
                  {...form.register("phone")}
                  label="Phone"
                  required
                  leftIcon={<Phone className="h-4 w-4" />}
                  placeholder="Enter contact number" 
                  className="h-10 rounded-lg text-sm" 
                  error={form.formState.errors.phone?.message as string}
                  disabled={updateConfigure.isPending}
                />

                <Input 
                  {...form.register("service_tax_reg_no")}
                  label="Service Tax Reg. No."
                  leftIcon={<ReceiptText className="h-4 w-4" />}
                  placeholder="Enter registration number" 
                  className="h-10 rounded-lg text-sm" 
                  error={form.formState.errors.service_tax_reg_no?.message as string}
                  disabled={updateConfigure.isPending}
                />

                <Input 
                  {...form.register("cin_no")}
                  label="CIN No."
                  leftIcon={<Hash className="h-4 w-4" />}
                  placeholder="Enter CIN number" 
                  className="h-10 rounded-lg text-sm" 
                  error={form.formState.errors.cin_no?.message as string}
                  disabled={updateConfigure.isPending}
                />

                <div className="md:col-span-2 space-y-2 pt-2">
                  <Label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-slate-400" /> Select Logo
                  </Label>
                  <Upload
                    accept="image/*"
                    maxFiles={1}
                    imagePreview={logoPreview}
                    onFilesSelected={(files) => {
                      if (files.length > 0) {
                        form.setValue("logo", files[0])
                        setLogoPreview(URL.createObjectURL(files[0]))
                      } else {
                        form.setValue("logo", null)
                        setLogoPreview(null)
                      }
                    }}
                    onRemove={() => {
                      form.setValue("logo", null)
                      setLogoPreview(null)
                    }}
                    className="mt-2"
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">Upload 1" x 1" size image for best results.</p>
                  {form.formState.errors.logo && (
                    <p className="text-xs text-rose-500 font-medium">{form.formState.errors.logo.message as string}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="sticky -bottom-6 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 md:px-8 pt-4 pb-10 flex items-center justify-end z-[40] rounded-b-xl">
              <FormFooter 
                submitLabel="Save" 
                cancelLabel="Clear"
                onCancel={handleClear}
                isLoading={updateConfigure.isPending}
                className="border-none shadow-none p-0 bg-transparent mt-0"
              />
            </div>
          </div>
        </form>
      </div>
    </BodyLayout>
  )
}

export default ConfigurePage
