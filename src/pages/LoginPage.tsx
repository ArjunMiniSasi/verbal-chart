import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/useFirebase"
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const LoginPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { signIn, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organization, setOrganization] = useState('Medora Animal Health Centre')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard')
    }
  }, [user, loading, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !organization) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Sign in with Firebase Auth
      const userCredential = await signIn(email, password)
      const user = userCredential

      // Store organization in user's Firestore document
      const userDocRef = doc(db, 'doctors', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          email: user.email,
          organization: organization,
          displayName: user.displayName || 'Dr. Smith',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      } else {
        // Update organization if document exists
        await setDoc(userDocRef, {
          organization: organization,
          updatedAt: new Date().toISOString()
        }, { merge: true })
      }

      // Store organization in localStorage for quick access
      localStorage.setItem('organization', organization)

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.displayName || 'Doctor'}!`,
      })
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = "Failed to sign in. Please check your credentials."
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address."
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again."
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address."
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later."
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/assets/medora-logo.svg" 
              alt="Medora Logo" 
              className="h-12 w-12"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Medora</CardTitle>
          <CardDescription>
            Sign in to your doctor account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="drsmith@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Use your Firebase Auth credentials to sign in</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
