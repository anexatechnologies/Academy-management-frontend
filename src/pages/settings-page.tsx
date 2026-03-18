import { 
  Building, 
  CreditCard, 
  MessageSquare, 
  Landmark, 
  Cpu, 
  Mail 
} from "lucide-react"
import BodyLayout from "@/components/layout/BodyLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AcademyInfoTab from "./settings/tabs/AcademyInfoTab"
import FeeSettingsTab from "./settings/tabs/FeeSettingsTab"
import MessagingTab from "./settings/tabs/MessagingTab"
import BankAccountsTab from "./settings/tabs/BankAccountsTab"
import BiometricDevicesTab from "./settings/tabs/BiometricDevicesTab"
import TemplatesTab from "./settings/tabs/TemplatesTab"

const SettingsPage = () => {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Settings" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="max-w-7xl animate-in fade-in duration-500">
        <Tabs defaultValue="academy" className="w-full">
          {/* Sticky Header & Navigation */}
          <div className="sticky -top-6 z-30 bg-white dark:bg-slate-950 pt-2 transition-all duration-300 shadow-none border-b border-slate-200 dark:border-slate-800">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 px-1">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Application Settings</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Configure your institution's global preferences and modules.</p>
              </div>
            </div>

            <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-800 p-0 h-auto rounded-none w-full justify-start gap-8 shadow-none">
              <TabsTrigger 
                value="academy" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <Building className="h-4 w-4" /> Academy Info
              </TabsTrigger>
              <TabsTrigger 
                value="fees" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <CreditCard className="h-4 w-4" /> Fee Settings
              </TabsTrigger>
              <TabsTrigger 
                value="messaging" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <MessageSquare className="h-4 w-4" /> Messaging
              </TabsTrigger>
              <TabsTrigger 
                value="banks" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <Landmark className="h-4 w-4" /> Bank Accounts
              </TabsTrigger>
              <TabsTrigger 
                value="biometrics" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <Cpu className="h-4 w-4" /> Biometric Devices
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="rounded-none px-4 py-3 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:border-x-transparent data-[state=active]:border-t-transparent data-[state=active]:bg-primary/5 data-[state=active]:text-primary transition-all text-sm font-bold flex items-center gap-2 hover:text-primary cursor-pointer shadow-none data-[state=active]:shadow-none -mb-[1px]"
              >
                <Mail className="h-4 w-4" /> Templates
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-6">
            <TabsContent value="academy" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <AcademyInfoTab />
            </TabsContent>
            <TabsContent value="fees" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <FeeSettingsTab />
            </TabsContent>
            <TabsContent value="messaging" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <MessagingTab />
            </TabsContent>
            <TabsContent value="banks" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <BankAccountsTab />
            </TabsContent>
            <TabsContent value="biometrics" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <BiometricDevicesTab />
            </TabsContent>
            <TabsContent value="templates" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <TemplatesTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </BodyLayout>
  )
}

export default SettingsPage
