import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Users, 
  Settings, 
  User,
  LogOut
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { NotificationsPanel } from "@/components/NotificationsPanel"
import { useAuth } from "@/hooks/useFirebase"
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const DoctorHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [doctorName, setDoctorName] = useState('Dr. Smith')
  const [organization, setOrganization] = useState('Medora Animal Health Centre')

  const navItems = [
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings }
  ]

  // Fetch doctor info from Firestore
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'doctors', user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const data = userDoc.data()
            setDoctorName(data.displayName || user.displayName || 'Dr. Smith')
            setOrganization(data.organization || localStorage.getItem('organization') || 'Medora Animal Health Centre')
          } else {
            // Fallback to user display name or email
            setDoctorName(user.displayName || user.email?.split('@')[0] || 'Dr. Smith')
            setOrganization(localStorage.getItem('organization') || 'Medora Animal Health Centre')
          }
        } catch (error) {
          console.error('Error fetching doctor info:', error)
          setDoctorName(user.displayName || user.email?.split('@')[0] || 'Dr. Smith')
          setOrganization(localStorage.getItem('organization') || 'Medora Animal Health Centre')
        }
      }
    }

    fetchDoctorInfo()
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem('organization')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img 
              src="/assets/medora-logo.svg" 
              alt="Medora AI Logo" 
              className="h-8 w-8"
            />
            <h1 className="text-xl font-bold text-foreground">Medora</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for patient, disease, medicines, diagnosis, etc."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </form>
        </div>

        {/* Navigation and User Actions */}
        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`gap-2 ${isActive ? 'bg-medical-primary text-white' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          {/* Notifications */}
          <NotificationsPanel />

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{doctorName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{doctorName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{organization}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border bg-muted/50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Button
                key={item.name}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex-1 gap-1 ${isActive ? 'bg-medical-primary text-white' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
