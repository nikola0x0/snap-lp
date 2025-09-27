'use client'

import type { FC } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

import { ClientOnly } from './client-only'

export const WalletConnection: FC = () => {
  const { publicKey, connected } = useWallet()

  return (
    <div className="flex items-center gap-4">
      <ClientOnly fallback={<div className="h-9 w-24 bg-muted animate-pulse rounded-md" />}>
        <WalletMultiButton />
      </ClientOnly>
      {connected && publicKey && (
        <div className="text-sm text-muted-foreground">
          Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </div>
      )}
    </div>
  )
}