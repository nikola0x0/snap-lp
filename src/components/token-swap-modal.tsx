'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { ammService } from '@/services/amm-real'

interface TokenSwapModalProps {
  isOpen: boolean
  onClose: () => void
  requiredTokens: {
    c98Amount: number
    usdtAmount: number
  }
  onSwapComplete: () => void
}

export function TokenSwapModal({ isOpen, onClose, requiredTokens, onSwapComplete }: TokenSwapModalProps) {
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'prepare' | 'confirm' | 'executing'>('prepare')
  const [swapPlan, setSwapPlan] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [solBalance, setSolBalance] = useState<number>(0)
  const [slippage, setSlippage] = useState(1) // 1% default slippage

  // Check SOL balance when modal opens
  useEffect(() => {
    if (isOpen && connected && publicKey) {
      checkSolBalance()
    }
  }, [isOpen, connected, publicKey])

  const checkSolBalance = async () => {
    if (!publicKey) return
    
    try {
      const balance = await connection.getBalance(publicKey)
      setSolBalance(balance / 1e9) // Convert lamports to SOL
    } catch (error) {
      console.error('Error checking SOL balance:', error)
    }
  }

  const prepareSwaps = async () => {
    if (!publicKey) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await ammService.prepareTokenSwaps({
        userPublicKey: publicKey,
        requiredTokens,
        slippage: slippage / 100 // Convert percentage to decimal
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to prepare swaps')
      }

      setSwapPlan(result)
      setCurrentStep('confirm')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const executeSwaps = async () => {
    if (!swapPlan || !publicKey || !signTransaction) return

    setIsLoading(true)
    setCurrentStep('executing')
    setError(null)

    try {
      // Execute each swap transaction
      for (const swap of swapPlan.swaps) {
        console.log(`Executing ${swap.type} swap...`)
        
        const swapResult = await ammService.executeSwap({
          fromTokenAccount: swap.fromTokenAccount,
          toTokenAccount: swap.toTokenAccount,
          fromAmount: swap.fromAmount,
          minimumAmountOut: swap.minimumOutput,
          poolParams: swap.poolParams,
          userPublicKey: publicKey,
          fromMint: swap.fromMint,
          toMint: swap.toMint
        })

        if (!swapResult.success) {
          throw new Error(`${swap.type} swap failed: ${swapResult.error}`)
        }

        if (swapResult.transaction && signTransaction) {
          // Sign and send transaction
          const signedTx = await signTransaction(swapResult.transaction)
          const signature = await connection.sendRawTransaction(signedTx.serialize())
          
          // Wait for confirmation
          const latestBlockhash = await connection.getLatestBlockhash()
          await connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
          })
          
          console.log(`${swap.type} swap completed:`, signature)
        }
      }

      onSwapComplete()
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Swap execution failed')
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setCurrentStep('prepare')
    setSwapPlan(null)
    setError(null)
    setIsLoading(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!connected) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-muted-foreground mb-4">
              Please connect your wallet to swap tokens
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Get Required Tokens</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Banner */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 mb-2">
                    DLMM requires both tokens to provide liquidity. You need to swap SOL for the required tokens first.
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-blue-700">
                    <span>Need SOL? Get devnet tokens:</span>
                    <code className="bg-blue-100 px-2 py-1 rounded">solana airdrop 2</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Current SOL Balance:</span>
                <Badge variant={solBalance >= 1 ? "default" : "destructive"}>
                  {solBalance.toFixed(4)} SOL
                </Badge>
              </div>
              {solBalance < 1 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Low SOL balance. You may need to get more SOL for swapping and transaction fees.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Required Tokens */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Tokens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">DEXV3-C98</p>
                  <p className="text-sm text-muted-foreground">Dex V3 C98 Token</p>
                </div>
                <Badge variant="outline">{requiredTokens.c98Amount.toFixed(4)}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">DEXV3-USDT</p>
                  <p className="text-sm text-muted-foreground">Dex V3 Tether USD</p>
                </div>
                <Badge variant="outline">{requiredTokens.usdtAmount.toFixed(4)}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Slippage Setting */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Slippage Tolerance</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 1)}
                    className="w-20"
                    min="0.1"
                    max="10"
                    step="0.1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Swap Plan */}
          {swapPlan && currentStep === 'confirm' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Swap Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {swapPlan.swaps.map((swap: any, index: number) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                    <Badge variant="outline">{swap.fromAmount} SOL</Badge>
                    <ArrowRight className="h-4 w-4" />
                    <Badge variant="outline">
                      {parseFloat(swap.estimatedOutput).toFixed(4)} {swap.type.includes('C98') ? 'C98' : 'USDT'}
                    </Badge>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Total SOL Required:</span>
                    <span className="font-medium">{swapPlan.totalSolRequired.toFixed(4)} SOL</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {currentStep === 'prepare' && (
              <Button onClick={prepareSwaps} disabled={isLoading || solBalance < 0.1}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  'Prepare Swaps'
                )}
              </Button>
            )}
            
            {currentStep === 'confirm' && (
              <Button onClick={executeSwaps} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  'Execute Swaps'
                )}
              </Button>
            )}
          </div>

          {/* Help Links */}
          <div className="text-center pt-4 border-t">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>Need help?</span>
              <a
                href="https://discord.gg/saros"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:underline"
              >
                Discord <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <a
                href="https://t.me/saros_finance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:underline"
              >
                Telegram <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}