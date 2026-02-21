import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-slate-50 group-[.toaster]:border-slate-200 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400 font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-bold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: 
            "group-[.toaster]:bg-emerald-50 dark:group-[.toaster]:bg-emerald-900/20 group-[.toaster]:text-emerald-700 dark:group-[.toaster]:text-emerald-400 group-[.toaster]:border-emerald-200 dark:group-[.toaster]:border-emerald-800/50",
          error: 
            "group-[.toaster]:bg-rose-50 dark:group-[.toaster]:bg-rose-900/20 group-[.toaster]:text-rose-700 dark:group-[.toaster]:text-rose-400 group-[.toaster]:border-rose-200 dark:group-[.toaster]:border-rose-800/50",
          info: 
            "group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-900/20 group-[.toaster]:text-blue-700 dark:group-[.toaster]:text-blue-400 group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
