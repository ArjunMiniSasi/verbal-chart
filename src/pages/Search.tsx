import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DoctorHeader } from "@/components/DoctorHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, User, Calendar, TrendingUp, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EnhancedSearchResults } from "@/components/EnhancedSearchResults"

const Search = () => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery) {
      setQuery(urlQuery)
      handleSearch(urlQuery)
    }
  }, [searchParams])

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query
    if (!queryToSearch.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a search query.",
        variant: "destructive"
      })
      return
    }

    setIsSearching(true)

    try {
      // Simulate search with mock data
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockResults = [
        {
          id: '1',
          patient: { name: 'Sarah Johnson', mrn: 'MRN001' },
          summary: '• Severe bilateral headaches for 3 days\n• Throbbing pain worse in morning\n• Associated fatigue and concentration issues\n• History of migraine\n• Started on sumatriptan PRN',
          soapNotes: {
            subjective: 'Patient reports severe bilateral throbbing headaches for 3 days, worse in morning. Associated with fatigue and difficulty concentrating.',
            objective: 'Vital signs stable. No focal neurological deficits. Head and neck examination normal.',
            assessment: 'Migraine headache, likely tension-type component. Rule out secondary causes.',
            plan: 'Start sumatriptan 50mg PRN for acute episodes. Consider prophylactic treatment if frequency increases.'
          },
          transcript: 'Patient reports having severe headaches for the past three days. The pain is bilateral and throbbing in nature, worse in the morning.',
          similarity: 0.85,
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          patient: { name: 'Michael Chen', mrn: 'MRN002' },
          summary: '• Chest pain and SOB with exertion\n• Substernal pressure-like pain\n• Known CAD and hypertension\n• Pain relieved with rest\n• Increased metoprolol dose',
          soapNotes: {
            subjective: 'Chest pain and shortness of breath. Substernal pressure-like pain with exertion. Known CAD and HTN.',
            objective: 'BP 150/90, HR 88, RR 18, O2 sat 96% RA. Heart regular rate and rhythm. No murmurs.',
            assessment: 'Stable angina. Hypertension. Known CAD.',
            plan: 'Increase metoprolol to 50mg BID. Continue aspirin 81mg daily. Cardiology follow up in 1 month.'
          },
          transcript: 'Patient presents with chest pain and shortness of breath. Pain is substernal, pressure-like, occurring with exertion.',
          similarity: 0.72,
          createdAt: '2024-01-10'
        }
      ]

      setResults(mockResults)

      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} relevant cases.`,
      })

    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: "Search Failed",
        description: "Failed to search cases. Please try again.",
        variant: "destructive"
      })
      setResults([])
    } finally {
      setIsSearching(false)
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
    <div className="min-h-screen bg-background">
      <DoctorHeader />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Search Case Sheets
            </h1>
            <p className="text-xl text-muted-foreground">
              Ask natural language questions to find relevant patient cases
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Search Interface */}
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

              {/* Enhanced Search Results for Medicines/Lab Tests */}
              {!isSearching && query && (
                <EnhancedSearchResults query={query} />
              )}

              {/* Search Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-medical-primary" />
                    Search Results ({results.length} cases found)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto">
                    <div className="space-y-4 p-6">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Searching case database...</p>
                          </div>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            No cases found. Try a different search query.
                          </p>
                        </div>
                      ) : (
                        results.map((result, index) => (
                          <Card key={result.id} className="border-l-4 border-l-medical-primary">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{result.patient.name}</span>
                                    <Badge variant="outline">MRN: {result.patient.mrn}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(result.createdAt).toLocaleDateString()}
                                    </span>
                                    <Badge 
                                      variant="secondary" 
                                      className="flex items-center gap-1"
                                    >
                                      <TrendingUp className="h-3 w-3" />
                                      {Math.round(result.similarity * 100)}% match
                                    </Badge>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                      Summary
                                    </h4>
                                    <p className="text-sm whitespace-pre-line">{result.summary}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                      SOAP Notes
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <Badge variant="outline" className="mb-1">Subjective</Badge>
                                        <p className="text-muted-foreground line-clamp-2">
                                          {result.soapNotes.subjective}
                                        </p>
                                      </div>
                                      <div>
                                        <Badge variant="outline" className="mb-1">Objective</Badge>
                                        <p className="text-muted-foreground line-clamp-2">
                                          {result.soapNotes.objective}
                                        </p>
                                      </div>
                                      <div>
                                        <Badge variant="outline" className="mb-1">Assessment</Badge>
                                        <p className="text-muted-foreground line-clamp-2">
                                          {result.soapNotes.assessment}
                                        </p>
                                      </div>
                                      <div>
                                        <Badge variant="outline" className="mb-1">Plan</Badge>
                                        <p className="text-muted-foreground line-clamp-2">
                                          {result.soapNotes.plan}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                      Transcript Excerpt
                                    </h4>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                      {result.transcript.substring(0, 200)}...
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-medical-primary" />
                    Demo Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This is a demo version with sample patient cases for testing the search functionality.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">3 Sample Cases</Badge>
                    <Badge variant="outline">Ready for Search</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
