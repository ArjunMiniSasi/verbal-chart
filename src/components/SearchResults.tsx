'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, User, Calendar, TrendingUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SearchResultsProps {
  results: any[]
  isSearching: boolean
}

export const SearchResults = ({ results, isSearching }: SearchResultsProps) => {
  if (isSearching) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching case database...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No cases found. Try a different search query.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-medical-primary" />
          Search Results ({results.length} cases found)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 p-6">
            <AnimatePresence>
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-medical-primary">
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
                            <p className="text-sm">{result.summary}</p>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
