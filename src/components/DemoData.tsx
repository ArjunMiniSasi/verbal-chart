'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export const DemoData = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { toast } = useToast()

  const loadDemoData = async () => {
    setIsLoading(true)
    
    try {
      // Check if demo data is already loaded
      const response = await fetch('/api/cases')
      const data = await response.json()
      
      if (data.cases && data.cases.length > 0) {
        toast({
          title: "Demo data already loaded",
          description: "The database already contains case data.",
        })
        setIsLoaded(true)
        return
      }

      // Load demo data
      const seedResponse = await fetch('/api/seed-demo', {
        method: 'POST'
      })

      if (!seedResponse.ok) {
        throw new Error('Failed to load demo data')
      }

      toast({
        title: "Demo data loaded",
        description: "Sample cases have been added to the database.",
      })
      setIsLoaded(true)

    } catch (error) {
      console.error('Demo data loading error:', error)
      toast({
        title: "Loading failed",
        description: "Failed to load demo data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-medical-primary" />
          Demo Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Load sample patient cases to test the search functionality.
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={loadDemoData}
            disabled={isLoading || isLoaded}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : isLoaded ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Demo Data Loaded
              </>
            ) : (
              'Load Demo Data'
            )}
          </Button>
        </div>

        {isLoaded && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">3 Sample Cases</Badge>
            <Badge variant="outline">Ready for Search</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
