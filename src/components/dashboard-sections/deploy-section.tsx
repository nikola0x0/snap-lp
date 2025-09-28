'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useAppStore } from '@/store/app-store'
import { DLMMService } from '@/services/dlmm'
import { priceService, type TokenPrice } from '@/services/price-service'
import { TokenSwapModal } from '../token-swap-modal'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Slider } from '../ui/slider'
import { Input } from '../ui/input'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ClientOnly } from '../client-only'
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Settings, 
  AlertTriangle,
  Rocket,
  Play
} from 'lucide-react'

type DeployStep = 'configure' | 'review' | 'deploy'

interface DeployConfig {
  liquidityAmount: number
  tokenXPercentage: number
  tokenYPercentage: number
  slippage: number
  autoRebalance: boolean
}

const steps = [
  { id: 'configure', label: 'Configure Position', icon: Settings },
  { id: 'review', label: 'Review & Confirm', icon: CheckCircle },
  { id: 'deploy', label: 'Deploy', icon: Rocket }
]

export function DeploySection() {
  const { connected, wallet, publicKey, sendTransaction, signTransaction } = useWallet()
  const { connection } = useConnection()
  const { 
    selectedPool, 
    selectedTemplate, 
    setStep, 
    getTokenPairSymbol 
  } = useAppStore()
  
  const [currentStep, setCurrentStep] = useState<DeployStep>('configure')
  const [deployConfig, setDeployConfig] = useState<DeployConfig>({
    liquidityAmount: selectedTemplate?.parameters.minTokenAmount || 1000,
    tokenXPercentage: selectedTemplate?.parameters.defaultTokenXPercentage || 50,
    tokenYPercentage: 50,
    slippage: selectedTemplate?.parameters.slippage ? selectedTemplate.parameters.slippage * 100 : 1.0,
    autoRebalance: selectedTemplate?.parameters.autoRebalance || false
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [showTokenSwapModal, setShowTokenSwapModal] = useState(false)
  const [hasRequiredTokens, setHasRequiredTokens] = useState(false)
  const [tokenPrices, setTokenPrices] = useState<Record<string, TokenPrice>>({})
  const [loadingPrices, setLoadingPrices] = useState(true)

  // Fetch token prices when component mounts
  useEffect(() => {
    const fetchPrices = async () => {
      if (!selectedPool?.metadata) return

      try {
        setLoadingPrices(true)
        const mints = [selectedPool.metadata.baseMint, selectedPool.metadata.quoteMint]
        const prices = await priceService.getTokenPrices(mints)
        setTokenPrices(prices)
      } catch (error) {
        console.error('Error fetching token prices:', error)
      } finally {
        setLoadingPrices(false)
      }
    }

    fetchPrices()
  }, [selectedPool?.metadata])

  // Redirect if no pool or template is selected
  if (!selectedPool || !selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-muted-foreground">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-semibold mb-2">Ready to Deploy?</h2>
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

  // Wallet connection requirement
  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Step 4: Deploy Strategy</h1>
            <p className="text-muted-foreground">
              Deploy your {selectedTemplate.name} strategy to {getTokenPairSymbol()} pool.
            </p>
          </div>

          {/* Selection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
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
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Selected Strategy</div>
                    <div className="font-semibold">{selectedTemplate.name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your Solana wallet to deploy your DLMM strategy.
                </p>
              </div>
              <ClientOnly fallback={<div className="h-9 w-32 bg-muted animate-pulse rounded-md mx-auto" />}>
                <WalletMultiButton className="mx-auto" />
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Helper function to get token symbol from mint address
  const getTokenSymbol = (mintAddress: string) => {
    const tokenMap: Record<string, string> = {
      'So11111111111111111111111111111111111111112': 'SOL',
      'mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z': 'C98', // Dex V3 C98
      'mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9': 'USDT', // Dex V3 Tether USD
    }
    return tokenMap[mintAddress] || `${mintAddress.slice(0, 4)}...`
  }

  // Calculate required token amounts based on selected pool and config
  const getRequiredTokens = () => {
    if (!selectedPool?.metadata) {
      return { 
        tokenXAmount: 0, 
        tokenYAmount: 0, 
        tokenXSymbol: 'Unknown', 
        tokenYSymbol: 'Unknown',
        tokenXUsdValue: 0,
        tokenYUsdValue: 0,
        totalUsdValue: 0,
        tokenXPrice: null,
        tokenYPrice: null
      }
    }

    const tokenXAmount = (deployConfig.liquidityAmount * deployConfig.tokenXPercentage) / 100
    const tokenYAmount = (deployConfig.liquidityAmount * (100 - deployConfig.tokenXPercentage)) / 100
    
    const tokenXSymbol = getTokenSymbol(selectedPool.metadata.baseMint)
    const tokenYSymbol = getTokenSymbol(selectedPool.metadata.quoteMint)
    
    // Get prices and calculate USD values
    const tokenXPrice = tokenPrices[selectedPool.metadata.baseMint] || null
    const tokenYPrice = tokenPrices[selectedPool.metadata.quoteMint] || null
    
    const tokenXUsdValue = tokenXPrice ? tokenXAmount * tokenXPrice.price : 0
    const tokenYUsdValue = tokenYPrice ? tokenYAmount * tokenYPrice.price : 0
    const totalUsdValue = tokenXUsdValue + tokenYUsdValue
    
    return {
      tokenXAmount,
      tokenYAmount,
      tokenXSymbol,
      tokenYSymbol,
      tokenXUsdValue,
      tokenYUsdValue,
      totalUsdValue,
      tokenXPrice,
      tokenYPrice,
      // Legacy properties for backward compatibility
      c98Amount: tokenXSymbol === 'C98' ? tokenXAmount : (tokenYSymbol === 'C98' ? tokenYAmount : 0),
      usdtAmount: tokenXSymbol === 'USDT' ? tokenXAmount : (tokenYSymbol === 'USDT' ? tokenYAmount : 0)
    }
  }

  const handleGetTokens = () => {
    setShowTokenSwapModal(true)
  }

  const handleSwapComplete = () => {
    setHasRequiredTokens(true)
    setShowTokenSwapModal(false)
  }

  const handleDeploy = async () => {
    if (!wallet || !publicKey) {
      console.error('Wallet not connected')
      alert('Please connect your wallet first')
      return
    }

    // Check if user has required tokens first
    if (!hasRequiredTokens) {
      alert('Please get the required tokens first by clicking "Get Tokens"')
      return
    }

    setIsDeploying(true)
    setCurrentStep('deploy')
    
    try {
      console.log('Starting real DLMM deployment with config:', {
        pool: selectedPool,
        template: selectedTemplate,
        config: deployConfig
      })

      // Import and use the real DLMM service
      const { DLMMService } = await import('@/services/dlmm')
      const dlmmService = new DLMMService()
      
      // Convert template configuration to the format expected by DLMM service
      // Convert the distribution type to actual bin distribution array
      const getBinDistribution = (_distributionType: string, binCount: number) => {
        // This is a simplified conversion - in a real implementation, you'd have more sophisticated logic
        const distribution = []
        for (let i = 0; i < binCount; i++) {
          distribution.push({
            binId: i - Math.floor(binCount / 2), // Center bins around 0
            weight: 1 // Equal weight for now - could be more sophisticated based on distributionType
          })
        }
        return distribution
      }

      const templateConfig = {
        binDistribution: getBinDistribution(
          selectedTemplate.binConfiguration.distribution,
          selectedTemplate.binConfiguration.binCount
        ),
        totalAmount: deployConfig.liquidityAmount,
        tokenXPercentage: deployConfig.tokenXPercentage
      }

      // Call the real DLMM SDK to create position
      const result = await dlmmService.createPosition({
        poolAddress: selectedPool.address,
        templateConfig,
        userPublicKey: publicKey,
        slippage: deployConfig.slippage / 100
      })

      console.log('DLMM deployment result:', result)
      
      if (result.success) {
        console.log('Position created successfully!', result)
        
        // If we have a real transaction to sign, send it through the wallet
        if (result.transaction && sendTransaction && result.positionMintKeypair) {
          console.log('Sending transaction through wallet...')
          
          try {
            // The transaction is already prepared, just need to sign with position mint first
            const transaction = result.transaction
            
            console.log('Transaction before signing:', {
              recentBlockhash: transaction.recentBlockhash,
              feePayer: transaction.feePayer?.toString(),
              signatures: transaction.signatures.map(s => ({
                publicKey: s.publicKey.toString(),
                signature: s.signature ? 'present' : 'null'
              })),
              instructions: transaction.instructions.length
            })
            
            // Sign with the position mint keypair first
            transaction.partialSign(result.positionMintKeypair)
            console.log('Position mint signed the transaction')
            
            // Verify transaction is valid before sending
            console.log('Transaction after position mint signing:', {
              recentBlockhash: transaction.recentBlockhash,
              feePayer: transaction.feePayer?.toString(),
              signatures: transaction.signatures.map(s => ({
                publicKey: s.publicKey.toString(),
                signature: s.signature ? 'present' : 'null'
              })),
              instructions: transaction.instructions.length
            })
            
            // Try using signTransaction instead of sendTransaction for better compatibility
            console.log('Signing transaction with wallet...')
            if (!signTransaction) {
              throw new Error('Wallet does not support transaction signing')
            }
            const signedTransaction = await signTransaction(transaction)
            
            if (!signedTransaction) {
              throw new Error('Failed to sign transaction')
            }
            
            console.log('Transaction signed by wallet, now sending to network...')
            const signature = await connection.sendRawTransaction(signedTransaction.serialize())
            console.log('Transaction sent:', signature)
            
            // Wait for confirmation
            const latestBlockhash = await connection.getLatestBlockhash()
            await connection.confirmTransaction({
              signature,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            })
            console.log('Transaction confirmed!')
            
            alert(`Real DLMM position created successfully! Transaction: ${signature}`)
          } catch (txError) {
            console.error('Transaction failed:', txError)
            alert(`Transaction failed: ${txError instanceof Error ? txError.message : 'Unknown error'}`)
            return
          }
        } else {
          // For simulation responses
          alert(`Position created successfully! ${result.message}`)
        }
        
        setStep('portfolio') // Navigate to portfolio to see the new position
      } else {
        throw new Error(result.error || result.message)
      }
      
    } catch (error) {
      console.error('Deployment failed:', error)
      alert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsDeploying(false)
    }
  }

  const StepIndicator = ({ stepId }: { stepId: DeployStep }) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    const isCompleted = stepIndex < currentIndex || (currentStep === 'deploy' && !isDeploying)
    const isCurrent = stepId === currentStep
    const StepIcon = steps[stepIndex].icon

    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCompleted ? 'bg-green-500 text-white' :
          isCurrent ? 'bg-primary text-primary-foreground' :
          'bg-muted text-muted-foreground'
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <StepIcon className="w-4 h-4" />
          )}
        </div>
        <span className={`text-sm font-medium ${
          isCurrent ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {steps[stepIndex].label}
        </span>
      </div>
    )
  }

  // Calculate token amounts
  const tokenXAmount = (deployConfig.liquidityAmount * deployConfig.tokenXPercentage) / 100
  const tokenYAmount = (deployConfig.liquidityAmount * deployConfig.tokenYPercentage) / 100
  const estimatedMonthlyFees = (deployConfig.liquidityAmount * selectedTemplate.estimatedAPR) / (100 * 12)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Step 4: Deploy Strategy</h1>
          <p className="text-muted-foreground">
            Configure and deploy your {selectedTemplate.name} strategy to the {getTokenPairSymbol()} pool.
          </p>
        </div>

        {/* Selection Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Pool</div>
                    <div className="font-semibold">{getTokenPairSymbol()}</div>
                  </div>
                </div>
                <Button onClick={() => setStep('pools')} variant="ghost" size="sm">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Strategy</div>
                    <div className="font-semibold">{selectedTemplate.name}</div>
                  </div>
                </div>
                <Button onClick={() => setStep('templates')} variant="ghost" size="sm">
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <StepIndicator stepId={step.id as DeployStep} />
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configure Step */}
      {currentStep === 'configure' && (
        <div className="space-y-6">
          {/* Strategy Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Strategy Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-medium text-lg">{selectedTemplate.name}</h4>
                <Badge variant="secondary">{selectedTemplate.riskLevel}</Badge>
                <Badge variant="outline" className="text-xs">
                  by {selectedTemplate.creator}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
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
            </CardContent>
          </Card>

          {/* Position Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Position Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Total Liquidity Amount: ${deployConfig.liquidityAmount.toLocaleString()}
                </label>
                <Slider
                  value={[deployConfig.liquidityAmount]}
                  onValueChange={(value) => setDeployConfig(prev => ({ ...prev, liquidityAmount: value[0] }))}
                  max={selectedTemplate.parameters.maxTokenAmount || 10000}
                  min={selectedTemplate.parameters.minTokenAmount || 100}
                  step={100}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: ${(selectedTemplate.parameters.minTokenAmount || 100).toLocaleString()}</span>
                  <span>Max: ${(selectedTemplate.parameters.maxTokenAmount || 10000).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Token Distribution
                  </label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Token X: {deployConfig.tokenXPercentage}%</span>
                      <span>${tokenXAmount.toLocaleString()}</span>
                    </div>
                    <Slider
                      value={[deployConfig.tokenXPercentage]}
                      onValueChange={(value) => setDeployConfig(prev => ({ 
                        ...prev, 
                        tokenXPercentage: value[0],
                        tokenYPercentage: 100 - value[0]
                      }))}
                      max={100}
                      min={0}
                      step={5}
                    />
                    <div className="flex justify-between text-sm">
                      <span>Token Y: {deployConfig.tokenYPercentage}%</span>
                      <span>${tokenYAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Slippage Tolerance: {deployConfig.slippage.toFixed(1)}%
                  </label>
                  <Slider
                    value={[deployConfig.slippage]}
                    onValueChange={(value) => setDeployConfig(prev => ({ ...prev, slippage: value[0] }))}
                    max={5}
                    min={0.1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.1%</span>
                    <span>5.0%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button onClick={() => setStep('simulator')} variant="outline" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Test in Simulator First
            </Button>
            <Button onClick={() => setCurrentStep('review')} className="flex-1">
              Continue to Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Review Step */}
      {currentStep === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Your Deployment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Strategy Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <span className="font-medium">{selectedTemplate.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <Badge variant="secondary" className="text-xs">{selectedTemplate.riskLevel}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creator:</span>
                      <span className="font-medium">{selectedTemplate.creator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected APR:</span>
                      <span className="font-medium text-green-600">{selectedTemplate.estimatedAPR}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Pool Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pair:</span>
                      <span className="font-medium">{getTokenPairSymbol()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pool Address:</span>
                      <span className="font-mono text-xs">
                        {selectedPool.address.slice(0, 8)}...{selectedPool.address.slice(-6)}
                      </span>
                    </div>
                    {selectedPool.metadata && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trade Fee:</span>
                        <span className="font-medium">{(selectedPool.metadata.tradeFee * 100).toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Position Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Liquidity:</span>
                      <span className="font-medium">${deployConfig.liquidityAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token X Amount:</span>
                      <span className="font-medium">${tokenXAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token Y Amount:</span>
                      <span className="font-medium">${tokenYAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Slippage:</span>
                      <span className="font-medium">{deployConfig.slippage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Estimates</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Fees:</span>
                      <span className="font-medium text-green-600">~${estimatedMonthlyFees.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bin Count:</span>
                      <span className="font-medium">{selectedTemplate.binConfiguration.binCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price Range:</span>
                      <span className="font-medium">±{selectedTemplate.binConfiguration.rangeWidth/2}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                {/* Token Requirements Alert */}
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium mb-1">
                        Required Tokens for DLMM Position
                      </p>
                      <p className="text-xs text-amber-700 mb-2">
                        DLMM requires both tokens to provide liquidity. Use the token swap to get the required tokens.
                      </p>
                      <div className="space-y-2 text-xs">
                        {(() => {
                          const tokens = getRequiredTokens()
                          return (
                            <>
                              <div className="flex items-center space-x-4">
                                <span>Need: {tokens.tokenXAmount.toFixed(4)} {tokens.tokenXSymbol}</span>
                                <span>+ {tokens.tokenYAmount.toFixed(4)} {tokens.tokenYSymbol}</span>
                              </div>
                              {!loadingPrices && tokens.totalUsdValue > 0 && (
                                <div className="text-amber-600 space-y-1">
                                  <div className="flex items-center space-x-4">
                                    <span>{tokens.tokenXSymbol}: ~${tokens.tokenXUsdValue.toFixed(2)}</span>
                                    <span>{tokens.tokenYSymbol}: ~${tokens.tokenYUsdValue.toFixed(2)}</span>
                                  </div>
                                  <div className="font-medium">
                                    Total: ~${tokens.totalUsdValue.toFixed(2)} USD
                                  </div>
                                </div>
                              )}
                              {loadingPrices && (
                                <div className="text-amber-600">
                                  Loading prices...
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setCurrentStep('configure')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Configure
                  </Button>
                  {!hasRequiredTokens ? (
                    <Button onClick={handleGetTokens} className="flex-1" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Get Required Tokens
                    </Button>
                  ) : (
                    <Button onClick={handleDeploy} className="flex-1">
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy Strategy (Confirm Transaction)
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deploy Step */}
      {currentStep === 'deploy' && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Rocket className={`w-8 h-8 text-primary ${isDeploying ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {isDeploying ? 'Deploying Your Strategy...' : 'Strategy Deployed Successfully!'}
                </h3>
                <p className="text-muted-foreground">
                  {isDeploying 
                    ? 'Please confirm the transaction in your wallet and wait for blockchain confirmation.' 
                    : 'Your DLMM position has been created and is now earning fees.'
                  }
                </p>
              </div>
              {!isDeploying && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setStep('portfolio')}>
                    View Portfolio
                  </Button>
                  <Button onClick={() => {
                    setCurrentStep('configure')
                    // Reset for another deployment
                  }} variant="outline">
                    Deploy Another Strategy
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Swap Modal */}
      <TokenSwapModal
        isOpen={showTokenSwapModal}
        onClose={() => setShowTokenSwapModal(false)}
        requiredTokens={getRequiredTokens()}
        onSwapComplete={handleSwapComplete}
      />
    </div>
  )
}