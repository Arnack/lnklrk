"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, Loader2, Shield, UserPlus, Users, Target, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import LS from "@/app/service/LS"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formMode, setFormMode] = useState<'login' | 'changePassword' | 'changeEmail'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    newEmail: "",
    currentPassword: "",
  })
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let endpoint = '/api/auth/login'
      let body: any = { email: formData.email, password: formData.password }

      if (formMode === 'changePassword') {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match')
        }
        endpoint = '/api/auth/change-password'
        body = {
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      } else if (formMode === 'changeEmail') {
        endpoint = '/api/auth/change-email'
        body = {
          currentEmail: formData.email,
          newEmail: formData.newEmail,
          password: formData.currentPassword
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Operation failed')
      }
      
      if (formMode === 'login') {
        LS.setUserId(data?.user?.id);
        router.push('/dashboard')
      } else {
        // Show success message for password/email changes
        setError(null)
        alert('Changes saved successfully!')
        setFormMode('login')
        setFormData({
          email: formMode === 'changeEmail' ? formData.newEmail : formData.email,
          password: "",
          newPassword: "",
          confirmPassword: "",
          newEmail: "",
          currentPassword: "",
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setError(null)
    setFormData({
      email: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
      newEmail: "",
      currentPassword: "",
    })
  }

  const getFormTitle = () => {
    switch (formMode) {
      case 'login': return 'WELCOME_BACK'
      case 'changePassword': return 'CHANGE_PASSWORD'
      case 'changeEmail': return 'CHANGE_EMAIL'
      default: return 'WELCOME_BACK'
    }
  }

  const getFormSubtitle = () => {
    switch (formMode) {
      case 'login': return 'Enter credentials to access dashboard'
      case 'changePassword': return 'Update your account password'
      case 'changeEmail': return 'Update your account email address'
      default: return 'Enter credentials to access dashboard'
    }
  }

  if (!mounted) return null

  return (
    <>
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slower {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slowest {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-ultra-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-medium {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-very-fast {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-spin-slower { animation: spin-slower 12s linear infinite; }
        .animate-spin-slowest { animation: spin-slowest 16s linear infinite; }
        .animate-spin-very-slow { animation: spin-very-slow 24s linear infinite; }
        .animate-spin-ultra-slow { animation: spin-ultra-slow 32s linear infinite; }
        .animate-spin-fast { animation: spin-fast 2s linear infinite; }
        .animate-spin-medium { animation: spin-medium 4s linear infinite; }
        .animate-spin-very-fast { animation: spin-very-fast 1.5s linear infinite; }
      `}</style>
      
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-30">
          <ThemeToggle />
        </div>

        {/* Blueprint Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-slate-50 dark:bg-slate-900" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                   linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
                 `,
                 backgroundSize: '50px 50px, 50px 50px, 10px 10px, 10px 10px'
               }}>
          </div>
        </div>

        {/* Left Column - Welcome Section with Solar System */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-100 dark:bg-slate-800 py-8 px-4 lg:py-0">
          {/* Welcome Text */}
          <div className="text-center mb-4 lg:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-4 font-mono">
              Chinny CRM
            </h1>
            <p className="text-blue-600 dark:text-blue-400 text-sm sm:text-base lg:text-lg font-light max-w-sm px-4">
              Orchestrating influencer relationships with precision and clarity
            </p>
          </div>

          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px]">
            {/* Central Sun */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-pulse">
                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Mercury Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% - 1px)", left: "calc(50% - 2px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Venus Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% + -2px)", left: "calc(50% + 1px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-24 h-24 sm:w-36 sm:h-36 lg:w-48 lg:h-48 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-slower">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-orange-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Earth Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% + -1px)", left: "calc(50% - 3px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-slowest">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-blue-400 rounded-full relative">
                    {/* Moon - only show on larger screens */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden sm:block">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 animate-spin-fast">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 sm:w-0.5 sm:h-0.5 lg:w-1 lg:h-1 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mars Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% + 2px)", left: "calc(50% + 2px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-very-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2.5 lg:h-2.5 bg-red-400 rounded-full relative">
                    {/* Mars moons - only show on larger screens */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                      <div className="w-4 h-4 animate-spin-very-fast">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                      <div className="w-6 h-6 animate-spin-medium">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jupiter Orbit - only show on larger screens */}
            <div
              className="absolute hidden lg:block"
              style={{ top: "calc(50% + -3px)", left: "calc(50% - 1px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-96 h-96 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-ultra-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-orange-600 rounded-full relative">
                    {/* Jupiter moons */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 animate-spin-fast">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 animate-spin-medium">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-blue-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-7 h-7 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 animate-spin-slower">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-gray-600 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="mt-4 lg:mt-6 flex items-center justify-center gap-4 lg:gap-6 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
            <div className="flex items-center gap-1 lg:gap-2">
              <Users className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600 dark:text-blue-400" />
              <span>Influencers</span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <Target className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600 dark:text-purple-400" />
              <span>Campaigns</span>
            </div>
            <div className="flex items-center gap-1 lg:gap-2">
              <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-green-600 dark:text-green-400" />
              <span>Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Column - Form Section */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md">
            {/* Form Header */}
            <div className="text-center mb-6 lg:mb-8">
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
                {getFormTitle()}
              </h2>
              <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm font-light">
                {getFormSubtitle()}
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 dark:border-blue-400/20 rounded-lg p-4 sm:p-6 relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-600/50 dark:border-blue-400/50"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-600/50 dark:border-blue-400/50"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-600/50 dark:border-blue-400/50"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-600/50 dark:border-blue-400/50"></div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {formMode === 'login' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {formMode === 'changePassword' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                {formMode === 'changeEmail' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currentEmail" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Current Email
                      </Label>
                      <Input
                        id="currentEmail"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newEmail" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        New Email
                      </Label>
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder="newuser@example.com"
                        value={formData.newEmail}
                        onChange={(e) => handleInputChange('newEmail', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPasswordEmail" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Password
                      </Label>
                      <Input
                        id="currentPasswordEmail"
                        type="password"
                        placeholder="••••••••"
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                        className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                        required
                      />
                    </div>
                  </>
                )}

                {error && (
                  <Alert variant="destructive" className="border-red-300 dark:border-red-500/50 bg-red-50 dark:bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-700 dark:text-red-400 font-mono text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-mono text-sm uppercase tracking-wider rounded border border-blue-500 transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {formMode === 'login' ? 'ACCESSING...' : formMode === 'changePassword' ? 'UPDATING...' : 'CHANGING...'}
                    </>
                  ) : (
                    <>
                      {formMode === 'login' ? 'ACCESS_SYSTEM' : formMode === 'changePassword' ? 'UPDATE_PASSWORD' : 'CHANGE_EMAIL'}
                    </>
                  )}
                </Button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/50 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setFormMode(formMode === 'login' ? 'changePassword' : formMode === 'changePassword' ? 'changeEmail' : 'login')
                    resetForm()
                  }}
                  className="text-sm font-mono text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 uppercase tracking-wider"
                >
                  {formMode === 'login' ? 'CHANGE_PASSWORD' : formMode === 'changePassword' ? 'CHANGE_EMAIL' : 'LOGIN'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-xs text-gray-500 dark:text-slate-500 font-mono tracking-wider px-4">
                Created with ⌨️ & ❤️ by <a href="https://linklurk.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Greg</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginForm
