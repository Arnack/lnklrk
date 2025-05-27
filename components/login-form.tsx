"use client"

import { useState, useContext } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LanguageContext } from "@/context/language-provider"
import { useAuth } from "@/context/auth-provider"
import { toast } from "sonner"


const formSchema = z.object({
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  password: z.string().min(1, { message: "Пожалуйста, введите пароль" }),
})

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { t } = useContext(LanguageContext)
  const { login, isLoading } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await login(values)
    } catch (error) {
      console.error(error)
      toast.error(t("invalidCredentials"))
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <>
      {/* Fixed position language and theme switchers */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2 bg-transparent p-2 rounded-lg backdrop-blur-md">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen w-full">
        {/* Branding Column with Abstract Geometric Elements */}
        <div className="hidden bg-primary lg:block lg:w-1/2 dark:bg-primary/20 relative overflow-hidden">
          {/* Abstract Geometric Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating circles */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-white/10 animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full bg-white/5 animate-pulse"
              style={{ animationDuration: "7s" }}
            ></div>
            <div
              className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white/8 animate-pulse"
              style={{ animationDuration: "5s" }}
            ></div>

            {/* Floating lines */}
            <div
              className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
              style={{ animationDuration: "10s" }}
            ></div>
            <div
              className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse"
              style={{ animationDuration: "13s" }}
            ></div>
            <div
              className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"
              style={{ animationDuration: "15s" }}
            ></div>

            {/* Abstract shapes */}
            <div
              className="absolute top-1/4 right-1/4 w-40 h-40 rotate-45 border border-white/10 animate-spin"
              style={{ animationDuration: "30s" }}
            ></div>
            <div
              className="absolute bottom-1/3 left-1/4 w-32 h-32 rotate-12 border border-white/5 animate-spin"
              style={{ animationDuration: "25s", animationDirection: "reverse" }}
            ></div>

            {/* Dots pattern */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-8 opacity-10">
              {Array.from({ length: 144 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white"></div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center px-8 text-white z-10">
            <div className="max-w-md text-center">
              <h2 className="mb-2 text-3xl font-bold">{t("projectMate")}</h2>
              <p className="mb-6">{t("byAvicom")}</p>

              {/* Abstract geometric composition */}
              <div className="mx-auto h-64 w-64 relative flex items-center justify-center">
                {/* Central abstract element */}
                <div className="relative w-40 h-40">
                  {/* Diagonal lines */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="w-full h-0.5 bg-white/20 absolute top-1/2 left-0 transform -rotate-45 animate-spin" style={{ animationDuration: "200s"}}></div>
                    <div className="w-full h-0.5 bg-white/20 absolute top-1/2 left-0 transform rotate-45 animate-spin" style={{ animationDuration: "150s"}}></div>
                  </div>

                <div className="absolute top-0 left-0 w-full h-full animate-spin" style={{ animationDuration: "200s" }}>
                  {/* Intersecting circles */}
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-2 border-white/30"></div>
                  <div className="absolute bottom-0 right-0
                  transform translate-x-1/4 translate-y-1/4
                  w-44 h-44 rounded-full border-2 border-white/30"></div>


                  {/* Central dot */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_20px_5px_rgba(251,191,36,0.7)] animate-pulse" style={{ animationDuration: "100s"}}></div>

                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-amber-100/80 rounded-full"></div>

                  {/* Orbiting element */}
                  <div className="absolute w-32 h-32 animate-spin" style={{ animationDuration: "50s" }}>
                    <div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full w-3 h-3 bg-emerald-800" />

                    <div className="absolute top-0 left-1/2  transform -translate-x-1/2 -translate-y-1/2 w-11 h-11 animate-spin border-1 rounded-full border-white/30"
                      style={{ animationPlayState:"running",
                        animationDuration: ".1s", 
                        borderWidth: "1px",
                        transform: "translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y)) !important"
                      }}>
                      <div className="absolute rounded-full top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-500/80" />
                    </div>
                    
                  </div>
                  
                  <div className="absolute bottom-0 right-0 w-44 h-44 transform translate-x-1/4 translate-y-1/4 animate-spin"
                  style={{ animationPlayState:"running", animationDuration: "30s" }}>

<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-sky-500 animate-spin"
                    style={{ animationDuration: ".1s", animationDirection: "reverse"}} />
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500/80 animate-spin"
                    style={{ animationDuration: ".1s", animationDirection: "reverse"}} />
                  </div>
                </div>
                </div>

                {/* Orbital rings */}
                <div
                  className="absolute inset-0 border border-white/20 rounded-full animate-spin"
                  style={{ animationDuration: "20s" }}
                ></div>
                <div
                  className="absolute inset-8 border border-white/15 rounded-full animate-spin"
                  style={{ animationDuration: "15s", animationDirection: "reverse" }}
                ></div>
                <div
                  className="absolute inset-16 border border-white/10 rounded-full animate-spin"
                  style={{ animationDuration: "10s" }}
                ></div>
              </div>

              <p className="mt-8 text-white/80 text-sm">{t("streamline")}</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8 relative overflow-hidden">
          {/* Light Pattern Background */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Subtle floating circles */}
            <div className="absolute top-1/4 right-1/4 w-24 h-24 rounded-full bg-primary/5 animate-pulse"></div>
            <div
              className="absolute bottom-1/3 left-1/4 w-16 h-16 rounded-full bg-primary/3 animate-pulse"
              style={{ animationDuration: "6s" }}
            ></div>
            <div
              className="absolute top-1/2 right-1/6 w-12 h-12 rounded-full bg-primary/4 animate-pulse"
              style={{ animationDuration: "8s" }}
            ></div>

            {/* Subtle lines */}
            <div
              className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse"
              style={{ animationDuration: "12s" }}
            ></div>
            <div
              className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/8 to-transparent animate-pulse"
              style={{ animationDuration: "15s" }}
            ></div>

            {/* Subtle geometric shapes */}
            <div
              className="absolute top-1/5 left-1/5 w-20 h-20 rotate-45 border border-primary/8 animate-spin"
              style={{ animationDuration: "40s" }}
            ></div>
            <div
              className="absolute bottom-1/4 right-1/3 w-14 h-14 rotate-12 border border-primary/6 animate-spin"
              style={{ animationDuration: "35s", animationDirection: "reverse" }}
            ></div>

            {/* Light dots pattern */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-12 opacity-5">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="w-0.5 h-0.5 rounded-full bg-primary"></div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm space-y-8 relative z-10">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">{t("welcome")}</h1>
              {/* <p className="text-muted-foreground">{t("enterCredentials")}</p> */}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="you@example.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type={showPassword ? "text" : "password"} className="pl-10 pr-10" {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={togglePasswordVisibility}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">{t("signingIn")}</span>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-white"></span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      {t("signIn")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            {/* <div className="text-center text-sm">
              <p>
                {t("dontHaveAccount")}{" "}
                <a href="#" className="font-medium text-primary hover:underline">
                  {t("signUp")}
                </a>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  )
}
