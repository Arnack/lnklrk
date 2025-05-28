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
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
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

        {/* Left Column - Welcome Section with Solar System */}
        <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-100 dark:bg-slate-800">
          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 font-mono">
              Chinny CRM
            </h1>
            <p className="text-blue-600 dark:text-blue-400 text-lg font-light max-w-sm">
              Orchestrating influencer relationships with precision and clarity
            </p>
          </div>

          <div className="relative w-[600px] h-[600px]">
            {/* Central Sun */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-pulse">
                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Mercury Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% - 1px)", left: "calc(50% - 2px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-32 h-32 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Venus Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% + -2px)", left: "calc(50% + 1px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-48 h-48 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-slower">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Earth Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% + -1px)", left: "calc(50% - 3px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-64 h-64 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-slowest">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full relative">
                    {/* Moon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 animate-spin-fast">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
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
              <div className="w-80 h-80 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-very-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-2.5 h-2.5 bg-red-400 rounded-full relative">
                    {/* Phobos - closer, faster moon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 animate-spin-very-fast">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    {/* Deimos - farther, slower moon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
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

            {/* Jupiter Orbit */}
            <div
              className="absolute"
              style={{ top: "calc(50% + -3px)", left: "calc(50% - 1px)", transform: "translate(-50%, -50%)" }}
            >
              <div className="w-96 h-96 border border-dashed border-cyan-500/40 dark:border-cyan-400/40 rounded-full animate-spin-ultra-slow">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-orange-600 rounded-full relative">
                    {/* Io - innermost Galilean moon */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 animate-spin-fast">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-yellow-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    {/* Europa */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 animate-spin-medium">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-blue-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    {/* Ganymede */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-7 h-7 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    {/* Callisto - outermost */}
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

        {/* Right Column - Form Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Form Header */}
            <div className="text-center mb-8">
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-mono">
                {isLogin ? 'WELCOME_BACK' : 'CREATE_ACCOUNT'}
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
              <p className="text-xs text-gray-500 dark:text-slate-500 font-mono tracking-wider">
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
