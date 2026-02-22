import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import type { UseFormSetError } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"
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
import { handleApiError } from "@/utils/api-error"

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
  const axiosPrivate = useAxiosPrivate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset: resetForm,
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const { 
    mutate: changePassword, 
    isPending, 
    isSuccess,
    reset: resetMutation 
  } = useMutation({
    mutationFn: async ({ data }: { data: ChangePasswordValues; setError: UseFormSetError<ChangePasswordValues> }) => {
      await axiosPrivate.put("/auth/change-password", {
        current_password: data.current_password,
        new_password: data.new_password,
      })
    },
    onSuccess: () => {
      toast.success("Password successfully updated!")
      resetForm()
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    },
    onError: (error: any, variables) => {
      handleApiError(error, variables.setError)
    }
  })

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      resetForm()
      resetMutation()
    }
  }, [open, resetForm, resetMutation])

  const onSubmit = (data: ChangePasswordValues) => {
    changePassword({ data, setError })
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
            disabled={isPending}
            error={errors.current_password?.message}
          />
          <Input
            {...register("new_password")}
            type="password"
            label="New Password"
            placeholder="••••••••"
            leftIcon={<ShieldCheck className="h-5 w-5" />}
            disabled={isPending}
            error={errors.new_password?.message}
          />
          <Input
            {...register("confirm_password")}
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            leftIcon={<ShieldCheck className="h-5 w-5" />}
            disabled={isPending}
            error={errors.confirm_password?.message}
          />

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full h-11 rounded-lg text-base font-semibold transition-all shadow-md shadow-primary/20"
              disabled={isPending || isSuccess}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : isSuccess ? (
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
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
