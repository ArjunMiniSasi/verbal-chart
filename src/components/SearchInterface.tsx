'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SearchInterfaceProps {
  onSearch: (results: any[]) => void
  onSearching: (searching: boolean) => void
}

export const SearchInterface = ({ onSearch, onSearching }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a search query.",
        variant: "destructive"
      })
      return
    }

    setIsSearching(true)
    onSearching(true)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      onSearch(data.results)

      toast({
        title: "Search Complete",
        description: `Found ${data.results.length} relevant cases.`,
      })

    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "Search Failed",
        description: "Failed to search cases. Please try again.",
        variant: "destructive"
      })
      onSearch([])
    } finally {
      setIsSearching(false)
      onSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const exampleQueries = [
    "Does this patient have diabetes history?",
    "Show me cases with chest pain",
    "Find patients with hypertension",
    "Cases involving medication allergies"
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-medical-primary" />
            <h3 className="text-lg font-semibold">Natural Language Search</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="search-query">Ask a question about patient cases</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="search-query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Does this patient have diabetes history?"
                  className="flex-1"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Example queries:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(example)}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
