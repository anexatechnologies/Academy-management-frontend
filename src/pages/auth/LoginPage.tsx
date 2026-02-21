import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { axiosPublic } from "@/api/axios"
import { Loader2, Lock, User } from "lucide-react"

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axiosPublic.post("/auth/login", data)
      const { token, user } = response.data.data
      setAuth({ token, user })
      navigate("/", { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid username or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Decorative background elements for desktop */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="hidden md:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 md:rounded-3xl md:shadow-2xl md:border border-slate-200 dark:border-slate-800 p-8 md:p-12 relative z-10 min-h-screen md:min-h-0 flex flex-col justify-center">
        <div className="space-y-8">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Academy Admin
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
                <Input
                  {...register("username")}
                  placeholder="Username"
                  leftIcon={<User className="h-5 w-5" />}
                  disabled={isLoading}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl"
                  error={errors.username?.message}
                />

                <Input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  leftIcon={<Lock className="h-5 w-5" />}
                  disabled={isLoading}
                  className="h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl"
                  error={errors.password?.message}
                />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Academy Management System • v1.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
