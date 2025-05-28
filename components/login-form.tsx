"use client"

import { useState } from "react"
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
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      console.log('>>>', data);
      LS.setUserId(data?.user?.id);
      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-30">
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

      {/* Left Column - Welcome Section */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Solar System Container */}
        <div className="relative w-96 h-96">
          {/* Central Sun */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full shadow-lg shadow-blue-400/30 border-2 border-blue-400/50 dark:border-blue-300/50">
            <div className="absolute inset-1 bg-blue-400 dark:bg-blue-300 rounded-full animate-pulse"></div>
          </div>

          {/* Asymmetric Orbital Paths that rotate */}
          {/* Orbit 1 - Small elliptical */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '15s' }}>
            <div className="w-24 h-16 border border-blue-500/40 dark:border-blue-400/40 rounded-full border-dashed"></div>
          </div>

          {/* Orbit 2 - Medium tilted ellipse */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
            <div className="w-40 h-28 border border-blue-500/30 dark:border-blue-400/30 rounded-full rotate-12 border-dotted"></div>
          </div>

          {/* Orbit 3 - Large horizontal ellipse */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '35s' }}>
            <div className="w-64 h-32 border border-blue-500/25 dark:border-blue-400/25 rounded-full border-dashed"></div>
          </div>

          {/* Orbit 4 - Extra large tilted */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }}>
            <div className="w-80 h-48 border border-blue-500/20 dark:border-blue-400/20 rounded-full -rotate-12 border-dotted"></div>
          </div>

          {/* Orbit 5 - Outer asymmetric */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '60s' }}>
            <div className="w-96 h-56 border border-blue-500/15 dark:border-blue-400/15 rounded-full rotate-6 border-dashed"></div>
          </div>

          {/* Blueprint-style orbital markers */}
          {/* Orbit 1 markers */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '8s' }}>
            <div className="absolute -top-1 left-12 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
          </div>

          {/* Orbit 2 markers */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }}>
            <div className="absolute -top-1 left-20 w-1.5 h-1.5 bg-blue-400 dark:bg-blue-300 rounded-full"></div>
          </div>

          {/* Orbit 3 markers */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '28s' }}>
            <div className="absolute -top-0.5 left-32 w-1 h-1 bg-blue-300 dark:bg-blue-200 rounded-full"></div>
          </div>

          {/* Orbit 4 markers */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{ animationDuration: '38s', animationDirection: 'reverse' }}>
            <div className="absolute -top-0.5 left-40 w-1 h-1 bg-blue-200 dark:bg-blue-100 rounded-full"></div>
          </div>

          {/* Blueprint coordinate lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-blue-500/20 dark:bg-blue-400/20"></div>
          <div className="absolute left-1/2 top-0 w-px h-full bg-blue-500/20 dark:bg-blue-400/20"></div>

          {/* Corner reference marks */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500/30 dark:border-blue-400/30"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-500/30 dark:border-blue-400/30"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-500/30 dark:border-blue-400/30"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500/30 dark:border-blue-400/30"></div>
        </div>

        {/* Welcome Text */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
            LinkLurk CRM
          </h1>
          <p className="text-blue-600 dark:text-blue-400 text-lg font-light max-w-sm">
            Orchestrating influencer relationships with precision and clarity
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Influencers</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Campaigns</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Form Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 border border-blue-500/30 dark:border-blue-400/30 rounded-lg mb-6">
              {isLogin ? (
                <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              ) : (
                <UserPlus className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
              {isLogin ? 'ACCESS_TERMINAL' : 'CREATE_PROFILE'}
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm font-light">
              {isLogin 
                ? 'Enter credentials to access dashboard' 
                : 'Initialize new user profile'
              }
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 dark:border-blue-400/20 rounded-lg p-6 relative">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-600/50 dark:border-blue-400/50"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-600/50 dark:border-blue-400/50"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-600/50 dark:border-blue-400/50"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-600/50 dark:border-blue-400/50"></div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="h-11 bg-white/50 dark:bg-slate-900/50 border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono"
                    required={!isLogin}
                  />
                </div>
              )}
              
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
                    {isLogin ? 'ACCESSING...' : 'INITIALIZING...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'ACCESS_SYSTEM' : 'CREATE_PROFILE'}
                  </>
                )}
              </Button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/50 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError(null)
                  setFormData({ email: "", password: "", name: "" })
                }}
                className="text-sm font-mono text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 uppercase tracking-wider"
              >
                {isLogin 
                  ? "Need account? Create_Profile" 
                  : "Have account? Access_System"
                }
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500 dark:text-slate-500 font-mono uppercase tracking-wider">
              Secure • Authenticated • Protected
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
