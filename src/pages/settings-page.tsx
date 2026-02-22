import { Settings as SettingsIcon } from "lucide-react"
import BodyLayout from "@/components/layout/BodyLayout"

const SettingsPage = () => {
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Settings" },
  ]

  return (
    <BodyLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <SettingsIcon size={40} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          User profile and application settings will be available here soon.
          We are currently focusing on the core management modules.
        </p>
      </div>
    </BodyLayout>
  )
}

export default SettingsPage
