"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Query the Firestore admin collection
      const adminDoc = await getDoc(doc(db, "admin", "admin"))
      
      if (adminDoc.exists()) {
        const data = adminDoc.data()
        // Compare with the document's email and password
        if (data.email === email && data.password === password) {
          login(email)
          return
        }
      } else {
        // Fallback exactly to the defaults requested just in case the document is deleted
        if (email === "admin@gmail.com" && password === "Admin@123") {
          login(email)
          return
        }
      }
      
      setError("Failed to sign in. Please check your credentials.")
    } catch (err: any) {
      console.error(err)
      setError("Failed to verify credentials. Check database connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#0a0a0a] px-4">
      <Card className="w-full max-w-[440px] border-white/5 bg-[#171717] shadow-2xl rounded-2xl overflow-hidden py-0 flex flex-col gap-0 relative">
        <CardHeader className="px-8 pt-8 pb-4 gap-2 border-b-0">
          <CardTitle className="text-[26px] font-bold flex items-center gap-3 text-white tracking-wide">
            <div className="w-[22px] h-[22px] rounded-md bg-[#F6BB05]"></div>
            AI Admin Panel
          </CardTitle>
          <CardDescription className="text-gray-400 text-[15px] pt-1 leading-relaxed">
            Enter your email and password to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin} className="flex flex-col w-full">
          <CardContent className="space-y-5 px-8 pb-6">
            {error && (
              <Alert variant="destructive" className="mb-2 h-auto py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-sm">Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-semibold text-sm">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1f1f1f] border-white/5 text-white rounded-[10px] h-12 px-4 placeholder:text-gray-500 transition-all focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary shadow-inner"
              />
            </div>
            <div className="space-y-2 pb-2">
              <Label htmlFor="password" className="text-white font-semibold text-sm">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1f1f1f] border-white/5 text-white rounded-[10px] h-12 px-4 pr-12 transition-all focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary shadow-inner"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-500 hover:text-white hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-8 py-6 bg-transparent border-t border-white/5">
            <Button 
              type="submit" 
              className="w-full h-12 text-black bg-[#F6BB05] hover:bg-[#F6BB05]/90 font-bold text-base rounded-[10px] shadow-sm tracking-wide"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
