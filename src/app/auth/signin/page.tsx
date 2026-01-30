'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MicrosoftIcon } from '@/components/icons/microsoft'
import { Loader2, Shield, Users, BarChart3, AlertCircle, User, Lock, Eye, EyeOff } from 'lucide-react'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authMode, setAuthMode] = useState<'demo' | 'microsoft'>('demo')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  // Get message and callback URL from search params
  const message = searchParams.get('message')
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Redirect based on user role
      const userRole = session.user?.role?.toLowerCase().replace('_', '-') || 'student'
      router.push(`/dashboard/${userRole}`)
    }
  }, [session, status, router])

  const handleDemoSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please check your credentials.')
      } else if (result?.ok) {
        // Success - redirect will be handled by useEffect
      }
    } catch (error) {
      console.error('Demo sign in error:', error)
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('microsoft-entra-id', { callbackUrl })
    } catch (error) {
      console.error('Microsoft sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              IoT Parts Management
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Enterprise-grade inventory management system designed for educational institutions. 
              Streamline your lab operations with professional-grade tools.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Secure & Compliant</h3>
                <p className="text-gray-300">Role-based access control with comprehensive audit trails</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Multi-Role Support</h3>
                <p className="text-gray-300">Students, Lab Assistants, and HODs with tailored workflows</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-time Analytics</h3>
                <p className="text-gray-300">Comprehensive dashboards and audit trails for complete visibility</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign In Card */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md shadow-xl border-gray-700 bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
                <CardDescription className="text-base text-gray-300">
                  Sign in to access the IoT Lab Management System
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Show message if present */}
              {message && (
                <div className="flex items-center space-x-2 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-200">{message}</p>
                </div>
              )}

              {/* Auth Mode Toggle */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode('demo')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'demo'
                      ? 'bg-gray-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Demo Login
                </button>
                <button
                  onClick={() => setAuthMode('microsoft')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'microsoft'
                      ? 'bg-gray-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Microsoft
                </button>
              </div>

              {authMode === 'demo' ? (
                <>
                  {/* Demo Credentials Form */}
                  <form onSubmit={handleDemoSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter demo email"
                          className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-200">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  {/* Quick Login Options */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-300 text-center">
                      Demo Credentials
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => handleQuickLogin('demo.hod@sies.edu', 'hod123')}
                        className="w-full p-3 text-left border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">HOD</p>
                            <p className="text-sm text-gray-300">Dr. John Smith</p>
                          </div>
                          <div className="text-xs text-gray-400">
                            demo.hod@sies.edu
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Full administrative access, approve requests, manage users
                        </p>
                      </button>
                      
                      <button
                        onClick={() => handleQuickLogin('demo.lab@sies.edu', 'lab123')}
                        className="w-full p-3 text-left border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">Lab Assistant</p>
                            <p className="text-sm text-gray-300">Sarah Johnson</p>
                          </div>
                          <div className="text-xs text-gray-400">
                            demo.lab@sies.edu
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Manage inventory, issue components, QR scanning
                        </p>
                      </button>
                      
                      <button
                        onClick={() => handleQuickLogin('demo.student@sies.edu', 'student123')}
                        className="w-full p-3 text-left border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">Student</p>
                            <p className="text-sm text-gray-300">Alex Kumar</p>
                          </div>
                          <div className="text-xs text-gray-400">
                            demo.student@sies.edu
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Browse inventory, create requests, track issued parts
                        </p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Microsoft Sign In */}
                  <Button
                    onClick={handleMicrosoftSignIn}
                    disabled={isLoading}
                    className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <MicrosoftIcon className="mr-2 h-5 w-5" />
                        Sign in with Microsoft
                      </>
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-400">
                      Restricted to college domain accounts only
                    </p>
                  </div>
                </>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our terms of service and privacy policy
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
