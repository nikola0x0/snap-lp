'use client'

import { useState } from 'react'
import { STRATEGY_TEMPLATES } from '@/data/strategy-templates'
import { TemplatesGallery } from '../templates-gallery'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { useAppStore } from '@/store/app-store'
import { BarChart3, Filter, Search, TrendingUp, Trophy, ArrowLeft, CheckCircle } from 'lucide-react'

type FilterType = 'all' | 'Conservative' | 'Balanced' | 'Aggressive'

export function TemplatesSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const { selectedPool, setStep, getTokenPairSymbol } = useAppStore()

  const filteredTemplates = STRATEGY_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = activeFilter === 'all' || template.riskLevel === activeFilter
    
    return matchesSearch && matchesFilter
  })

  const getFilterStats = (filter: FilterType) => {
    if (filter === 'all') return STRATEGY_TEMPLATES.length
    return STRATEGY_TEMPLATES.filter(t => t.riskLevel === filter).length
  }

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case 'Conservative':
        return <BarChart3 className="w-4 h-4" />
      case 'Balanced':
        return <TrendingUp className="w-4 h-4" />
      case 'Aggressive':
        return <Trophy className="w-4 h-4" />
      default:
        return <Filter className="w-4 h-4" />
    }
  }

  // Redirect if no pool is selected
  if (!selectedPool) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-semibold mb-2">No Pool Selected</h2>
          <p className="max-w-md">
            Please select a pool first to see strategies optimized for that specific pool.
          </p>
        </div>
        <Button onClick={() => setStep('pools')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back to Pool Selection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pool Context Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Selected Pool</div>
                <div className="font-semibold text-lg">{getTokenPairSymbol()}</div>
              </div>
            </div>
            <Button onClick={() => setStep('pools')} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Pool
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Step 2: Choose Strategy</h1>
        <p className="text-muted-foreground">
          Select a strategy template optimized for {getTokenPairSymbol()}. These templates are created by expert traders and the community.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates by name, description, or tags..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="h-8"
          >
            <Filter className="w-4 h-4 mr-1" />
            All Templates ({getFilterStats('all')})
          </Button>
          <Button
            variant={activeFilter === 'Conservative' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('Conservative')}
            className="h-8"
          >
            {getFilterIcon('Conservative')}
            <span className="ml-1">Conservative ({getFilterStats('Conservative')})</span>
          </Button>
          <Button
            variant={activeFilter === 'Balanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('Balanced')}
            className="h-8"
          >
            {getFilterIcon('Balanced')}
            <span className="ml-1">Balanced ({getFilterStats('Balanced')})</span>
          </Button>
          <Button
            variant={activeFilter === 'Aggressive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('Aggressive')}
            className="h-8"
          >
            {getFilterIcon('Aggressive')}
            <span className="ml-1">Aggressive ({getFilterStats('Aggressive')})</span>
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredTemplates.length} of {STRATEGY_TEMPLATES.length} templates
        </div>
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSearchTerm('')}
            className="h-auto p-1 text-xs"
          >
            Clear search
          </Button>
        )}
      </div>

      <TemplatesGallery templates={filteredTemplates} />
    </div>
  )
}