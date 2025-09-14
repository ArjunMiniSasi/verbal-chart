import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, User, FileText, Calendar } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SearchResult {
  id: string
  patientName: string
  patientId: string
  date: string
  soapPreview: string
  type: 'soap' | 'case'
}

export const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  // Mock search results
  const mockResults: SearchResult[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      patientId: 'MRN001',
      date: '2024-01-15',
      soapPreview: 'Patient reports severe bilateral headaches for 3 days, worse in morning...',
      type: 'soap'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      patientId: 'MRN002',
      date: '2024-01-10',
      soapPreview: 'Chest pain and shortness of breath. Substernal pressure-like pain...',
      type: 'soap'
    },
    {
      id: '3',
      patientName: 'Emma Rodriguez',
      patientId: 'MRN003',
      date: '2024-01-08',
      soapPreview: 'Persistent cough and fever for 5 days. Productive cough with yellow sputum...',
      type: 'case'
    }
  ]

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const filteredResults = mockResults.filter(result =>
      result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.soapPreview.toLowerCase().includes(searchQuery.toLowerCase())
    )
    
    setResults(filteredResults)
    setShowResults(true)
    setIsSearching(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    handleSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    navigate(`/patient/${result.patientId}`)
    setShowResults(false)
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setShowResults(false)
    }
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search patients, SOAP notes, case sheets..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowResults(true)}
          className="pl-10 pr-4 py-3 text-base"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-medical-primary"></div>
          </div>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <CardContent className="p-0">
            {results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {query ? 'No results found' : 'Start typing to search...'}
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-4 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {result.type === 'soap' ? (
                          <FileText className="h-4 w-4 text-medical-primary mt-1" />
                        ) : (
                          <User className="h-4 w-4 text-blue-600 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{result.patientName}</span>
                          <Badge variant="outline" className="text-xs">
                            {result.patientId}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {result.date}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.soapPreview}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                    className="w-full text-xs"
                  >
                    View all results for "{query}"
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
