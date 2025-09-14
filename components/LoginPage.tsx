"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bus, Eye, EyeOff, Mail, User, Lock, Shield, UserPlus, LogIn, AlertCircle } from "lucide-react"
import { auth } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LoginPageProps {
  onLogin: (userRole: "admin" | "user") => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState("signin")
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    otp: "",
    role: "user" as "admin" | "user" | "driver",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const accounts = {
    admin: { email: "admin@smartbus.com", username: "admin", password: "admin123", role: "admin" },
    user: { email: "user@smartbus.com", username: "user", password: "user123", role: "user" },
    dharmik: { email: "dharmik@smartbus.com", username: "Dharmik", password: "1111", role: "admin" },
  }

  const handleNext = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (activeTab === "signin") {
        if (step < 2) {
          setStep(step + 1)
        } else {
          console.log('🔐 Starting login process...')
          
          // Check demo accounts first for instant login
          const account = Object.values(accounts).find(
            (acc) => acc.email === formData.email && acc.password === formData.password,
          )
          
          if (account) {
            console.log('✅ Demo account login successful')
            onLogin(account.role as "admin" | "user")
            return
          }
          
          // Try Supabase authentication
          console.log('🔄 Attempting Supabase authentication...')
          
          try {
            const authResult = await auth.signIn({
              email: formData.email,
              password: formData.password
            })
            
            const { user } = authResult
            
            if (user) {
              console.log('✅ Supabase login successful')
              // Skip profile fetch for faster login, default to user
              onLogin('user')
            } else {
              throw new Error('No user returned from authentication')
            }
          } catch (authError: any) {
            console.warn('Supabase auth failed:', authError)
            
            // Provide specific error messages
            let errorMessage = 'Login failed. Please check your credentials.'
            if (authError.message?.includes('Invalid login credentials')) {
              errorMessage = 'Invalid email or password. Please check your credentials.'
            } else if (authError.message?.includes('Email not confirmed')) {
              errorMessage = 'Please check your email and confirm your account before signing in.'
            } else if (authError.message?.includes('fetch') || authError.message?.includes('network')) {
              errorMessage = 'Connection error. Please check your internet connection.'
            } else if (authError.message?.includes('timeout')) {
              errorMessage = 'Connection timeout. Please try again.'
            }
            
            throw new Error(errorMessage)
          }
        }
      } else {
        if (step < 3) {
          setStep(step + 1)
        } else {
          console.log('🔄 Creating new account...')
          // Attempt Supabase sign up
          const { user } = await auth.signUp({
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name || formData.username,
            role: formData.role,
            phone: formData.phone
          })
          
          if (user) {
            setSuccess('Account created successfully!')
            // Quick login after successful signup
            onLogin(formData.role === 'admin' ? 'admin' : 'user')
          }
        }
      }
    } catch (err: any) {
      console.error('❌ Authentication error:', err)
      setError(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setStep(1)
    setFormData({
      email: "",
      username: "",
      full_name: "",
      phone: "",
      password: "",
      confirmPassword: "",
      otp: "",
      role: "user",
    })
  }

  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <Mail className="h-4 w-4" />
      case 2:
        return activeTab === "signin" ? <Lock className="h-4 w-4" /> : <User className="h-4 w-4" />
      case 3:
        return activeTab === "signin" ? <Shield className="h-4 w-4" /> : <Lock className="h-4 w-4" />
      case 4:
        return <Shield className="h-4 w-4" />
      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.email.includes("@") && formData.email.length > 5
      case 2:
        if (activeTab === "signin") return formData.password.length >= 6
        return formData.full_name.length > 0
      case 3:
        if (activeTab === "signin") return true
        return formData.password.length >= 6 && formData.password === formData.confirmPassword
      default:
        return false
    }
  }

  const maxSteps = activeTab === "signin" ? 2 : 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Smart Bus System</h1>
              <p className="text-gray-600 text-sm">AI-Powered Transit Management</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: maxSteps }, (_, i) => i + 1).map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    stepNumber <= step ? "bg-emerald-600 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepNumber < step ? "✓" : stepNumber === step ? getStepIcon(stepNumber) : stepNumber}
                </div>
                {stepNumber < maxSteps && (
                  <div
                    className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                      stepNumber < step ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Auth Form */}
        <Card className="backdrop-blur-sm bg-white/95 border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <CardTitle className="flex items-center justify-center gap-2">
              {getStepIcon(step)}
              {activeTab === "signin" ? (
                <>
                  {step === 1 && "Email Address"}
                  {step === 2 && "Password"}
                </>
              ) : (
                <>
                  {step === 1 && "Email Address"}
                  {step === 2 && "Personal Info"}
                  {step === 3 && "Password"}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {activeTab === "signin" ? (
                <>
                  {step === 1 && "Enter your email address to sign in"}
                  {step === 2 && "Enter your password"}
                </>
              ) : (
                <>
                  {step === 1 && "Enter your email address to create account"}
                  {step === 2 && "Tell us about yourself"}
                  {step === 3 && "Create a secure password"}
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            {/* Step 1: Email */}
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Full Name and Phone (Sign Up) or Password (Sign In) */}
            {step === 2 && activeTab === "signup" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-3"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.role === "user" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("role", "user")}
                      className="flex-1"
                    >
                      User
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === "driver" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("role", "driver")}
                      className="flex-1"
                    >
                      Driver
                    </Button>
                    <Button
                      type="button"
                      variant={formData.role === "admin" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("role", "admin")}
                      className="flex-1"
                    >
                      Admin
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && activeTab === "signin" && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Password (Sign Up) */}
            {step === 3 && activeTab === "signup" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password (min 6 characters)"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}



            {/* Action Buttons */}
            <div className="flex gap-3">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1" disabled={isLoading}>
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    {step === maxSteps ? "Processing..." : "Processing..."}
                  </>
                ) : (
                  <>{step === maxSteps ? (activeTab === "signin" ? "Sign In" : "Create Account") : "Continue"}</>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>&copy; 2024 Smart Bus Optimization System</p>
          <p>Secure AI-Powered Transit Management</p>
        </div>
      </div>
    </div>
  )
}
