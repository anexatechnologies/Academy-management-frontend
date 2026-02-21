import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { axiosPublic } from "@/api/axios"
import { ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react"

const resetPasswordSchema = z.object({
  phone: z.string(),
  otp: z.string().min(6, "OTP must be 6 digits"),
  new_password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const phoneFromState = location.state?.phone || ""

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phone: phoneFromState,
    },
  })

  useEffect(() => {
    if (!phoneFromState) {
      navigate("/forgot-password", { replace: true })
    }
  }, [phoneFromState, navigate])

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (data: ResetPasswordValues) => {
      await axiosPublic.post("/auth/reset-password", data)
    },
    onSuccess: () => {
      toast.success("Password successfully updated!")
      setTimeout(() => {
        navigate("/login", { replace: true })
      }, 1500)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Invalid OTP or request expired."
      toast.error(message)
    }
  })

  const onSubmit = (data: ResetPasswordValues) => {
    resetPassword(data)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 md:rounded-3xl md:shadow-2xl md:border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative z-10 min-h-screen md:min-h-0 flex flex-col justify-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <Link
              to="/forgot-password"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Change number
            </Link>
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Reset Password
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Enter the 6-digit code sent to your phone and choose a new password.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <Input
                  {...register("otp")}
                  placeholder="6-digit OTP"
                  leftIcon={<ShieldCheck className="h-5 w-5" />}
                  disabled={isPending}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl"
                  error={errors.otp?.message}
                />

                <Input
                  {...register("new_password")}
                  type="password"
                  placeholder="New Password"
                  leftIcon={<KeyRound className="h-5 w-5" />}
                  disabled={isPending}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl"
                  error={errors.new_password?.message}
                />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
