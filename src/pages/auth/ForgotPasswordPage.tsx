import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { axiosPublic } from "@/api/axios"
import { ArrowLeft, Loader2, Phone } from "lucide-react"

const forgotPasswordSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await axiosPublic.post("/auth/forgot-password", data)
      // Pass the phone number to the reset page
      navigate("/reset-password", { state: { phone: data.phone } })
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 md:rounded-3xl md:shadow-2xl md:border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative z-10 min-h-screen md:min-h-0 flex flex-col justify-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Sign In
            </Link>
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Forgot password?
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                No worries, we'll send you an OTP to your phone.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <Input
                  {...register("phone")}
                  placeholder="Phone Number"
                  leftIcon={<Phone className="h-5 w-5" />}
                  disabled={isLoading}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl"
                  error={errors.phone?.message}
                />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
