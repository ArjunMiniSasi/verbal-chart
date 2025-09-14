'use client'

import { useState } from 'react'
import { Header } from "@/components/Header"
import { SearchInterface } from "@/components/SearchInterface"
import { SearchResults } from "@/components/SearchResults"
import { DemoData } from "@/components/DemoData"

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
              <SearchInterface 
                onSearch={setSearchResults}
                onSearching={setIsSearching}
              />
              
              <SearchResults 
                results={searchResults}
                isSearching={isSearching}
              />
            </div>
            
            <div>
              <DemoData />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
