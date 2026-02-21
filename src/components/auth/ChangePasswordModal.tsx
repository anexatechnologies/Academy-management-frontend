import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"
import { Loader2, KeyRound, ShieldCheck } from "lucide-react"

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const axiosPrivate = useAxiosPrivate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await axiosPrivate.put("/auth/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
      })
      setSuccess(true)
      reset()
      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password. Check your current password.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] overflow-hidden">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Change Password</DialogTitle>
          <DialogDescription className="text-center">
            Enter your current password and a new one to update your credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <Input
            {...register("current_password")}
            type="password"
            label="Current Password"
            placeholder="••••••••"
            leftIcon={<KeyRound className="h-5 w-5" />}
            disabled={isLoading}
            error={errors.current_password?.message}
          />
          <Input
            {...register("new_password")}
            type="password"
            label="New Password"
            placeholder="••••••••"
            leftIcon={<ShieldCheck className="h-5 w-5" />}
            disabled={isLoading}
            error={errors.new_password?.message}
          />
          <Input
            {...register("confirm_password")}
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            leftIcon={<ShieldCheck className="h-5 w-5" />}
            disabled={isLoading}
            error={errors.confirm_password?.message}
          />

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
              Password successfully updated!
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-lg text-base font-semibold transition-all shadow-md shadow-primary/20"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : success ? (
                "Success!"
              ) : (
                "Update Password"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
