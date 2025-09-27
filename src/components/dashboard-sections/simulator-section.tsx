'use client'

import { useState } from 'react'
import { StrategySimulator } from '../strategy-simulator'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { useAppStore } from '@/store/app-store'
import { Play, ArrowLeft, CheckCircle } from 'lucide-react'

export function SimulatorSection() {
  const [showFullSimulator, setShowFullSimulator] = useState(false)
  const { 
    selectedPool, 
    selectedTemplate, 
    setStep, 
    getTokenPairSymbol 
  } = useAppStore()

  // Redirect if no pool or template is selected
  if (!selectedPool || !selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-muted-foreground">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-semibold mb-2">Ready to Simulate?</h2>
          <p className="max-w-md">
            {!selectedPool ? "Please select a pool first." : "Please select a strategy template first."}
          </p>
        </div>
        <Button 
          onClick={() => setStep(!selectedPool ? 'pools' : 'templates')} 
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {!selectedPool ? "Go to Pool Selection" : "Go to Template Selection"}
        </Button>
      </div>
    )
  }

  const handleStartSimulation = () => {
    setShowFullSimulator(true)
  }

  const handleDeploy = () => {
    setStep('deploy')
  }

  return (
    <div className="space-y-6">
      {/* Context Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Step 3: Simulate Strategy</h1>
          <p className="text-muted-foreground">
            Test your selected strategy with interactive price simulation before deploying.
          </p>
        </div>

        {/* Selection Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Selected Pool</div>
                  <div className="font-semibold">{getTokenPairSymbol()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Selected Strategy</div>
                  <div className="font-semibold">{selectedTemplate.name}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strategy Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Strategy Overview</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setStep('templates')} variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Strategy
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-lg">{selectedTemplate.name}</h4>
            <Badge variant="secondary">{selectedTemplate.riskLevel}</Badge>
            <Badge variant="outline" className="text-xs">
              by {selectedTemplate.creator}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {selectedTemplate.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Est. APR</div>
              <div className="font-semibold text-green-600">{selectedTemplate.estimatedAPR}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">IL Risk</div>
              <div className="font-semibold">{selectedTemplate.impermanentLossRisk}/5</div>
            </div>
            <div>
              <div className="text-muted-foreground">Range</div>
              <div className="font-semibold">±{selectedTemplate.binConfiguration.rangeWidth/2}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Bins</div>
              <div className="font-semibold">{selectedTemplate.binConfiguration.binCount}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleStartSimulation} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              📊 Start Interactive Simulation
            </Button>
            <Button onClick={handleDeploy} variant="outline" className="flex-1">
              🚀 Skip Simulation - Deploy Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium mb-1 flex items-center gap-2">
                📊 <span>Price Movements</span>
              </div>
              <p className="text-muted-foreground">
                See how your strategy performs as {getTokenPairSymbol()} prices change.
              </p>
            </div>
            <div>
              <div className="font-medium mb-1 flex items-center gap-2">
                💰 <span>Investment Size</span>
              </div>
              <p className="text-muted-foreground">
                Test different liquidity amounts to estimate realistic returns.
              </p>
            </div>
            <div>
              <div className="font-medium mb-1 flex items-center gap-2">
                📈 <span>Live Metrics</span>
              </div>
              <p className="text-muted-foreground">
                Watch APR, impermanent loss, and fees update in real-time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Simulator Modal */}
      {showFullSimulator && (
        <StrategySimulator
          template={selectedTemplate}
          onClose={() => setShowFullSimulator(false)}
        />
      )}
    </div>
  )
}