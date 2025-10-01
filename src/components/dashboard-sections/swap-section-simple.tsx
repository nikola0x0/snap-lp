"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { Input } from "@/components/ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "@/components/client-only";
import { ArrowDownUp, Loader2, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTokenImage } from "@/constants/token-images";

// DLMM Service
const dlmmService = new LiquidityBookServices({
  mode: MODE.DEVNET,
  options: {
    rpcUrl:
      "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7",
  },
});

// Available swap pools (only pools with liquidity)
const SWAP_POOLS = [
  {
    id: "pyusd-wsol",
    address: "H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ",
    name: "PYUSD/WSOL",
    tokenX: {
      mint: "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM",
      symbol: "PYUSD",
      name: "PayPal USD",
      decimals: 6,
    },
    tokenY: {
      mint: "So11111111111111111111111111111111111111112",
      symbol: "WSOL",
      name: "Wrapped SOL",
      decimals: 9,
    },
  },
  {
    id: "wsol-usdt",
    address: "DMb8Xta7STwCkHwdWQSazjoJWG1vnNYkk2Pnenj9kPV",
    name: "WSOL/USDT",
    tokenX: {
      mint: "So11111111111111111111111111111111111111112",
      symbol: "WSOL",
      name: "Wrapped SOL",
      decimals: 9,
    },
    tokenY: {
      mint: "mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
    },
  },
];

export function SwapSectionSimple() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { showToast, hideToast, ToastContainer } = useToast();

  const [selectedPoolId, setSelectedPoolId] = useState("pyusd-wsol");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>(
    {},
  );
  const [swapForY, setSwapForY] = useState(true);

  const selectedPool =
    SWAP_POOLS.find((p) => p.id === selectedPoolId) || SWAP_POOLS[0];

  // Get token balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!connected || !publicKey) return;

      try {
        const balances: Record<string, number> = {};

        // Get WSOL balance
        const solBalance = await connection.getBalance(publicKey);
        balances["WSOL"] = solBalance / 1e9;

        // Get token balances for all unique tokens
        const uniqueTokens = new Set<string>();
        SWAP_POOLS.forEach((pool) => {
          if (pool.tokenX.symbol !== "WSOL") uniqueTokens.add(pool.tokenX.mint);
          if (pool.tokenY.symbol !== "WSOL") uniqueTokens.add(pool.tokenY.mint);
        });

        for (const mint of uniqueTokens) {
          try {
            const tokenMint = new PublicKey(mint);
            const tokenAccounts =
              await connection.getParsedTokenAccountsByOwner(publicKey, {
                mint: tokenMint,
              });

            if (tokenAccounts.value.length > 0) {
              const balance =
                tokenAccounts.value[0].account.data.parsed.info.tokenAmount
                  .uiAmount;
              const symbol =
                SWAP_POOLS.find(
                  (p) => p.tokenX.mint === mint || p.tokenY.mint === mint,
                )?.tokenX.mint === mint
                  ? SWAP_POOLS.find((p) => p.tokenX.mint === mint)?.tokenX
                      .symbol
                  : SWAP_POOLS.find((p) => p.tokenY.mint === mint)?.tokenY
                      .symbol;
              if (symbol) balances[symbol] = balance || 0;
            }
          } catch (error) {
            // Ignore errors for individual tokens
          }
        }

        setTokenBalances(balances);
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    fetchBalances();
  }, [connected, publicKey, connection]);

  // Get quote from DLMM
  useEffect(() => {
    const getQuote = async () => {
      if (!fromAmount || parseFloat(fromAmount) <= 0) {
        setToAmount("");
        return;
      }

      setQuoting(true);
      try {
        const amount = parseFloat(fromAmount);

        // Dynamic minimum amounts based on token type
        const fromToken = swapForY ? selectedPool.tokenX : selectedPool.tokenY;
        const minAmount = fromToken.decimals === 6 ? 0.01 : 0.0001;

        if (amount < minAmount) {
          setToAmount("0");
          setQuoting(false);
          return;
        }

        const decimals = swapForY
          ? selectedPool.tokenX.decimals
          : selectedPool.tokenY.decimals;
        const amountInLamports = BigInt(
          Math.floor(amount * Math.pow(10, decimals)),
        );

        const quote = await dlmmService.getQuote({
          amount: amountInLamports,
          isExactInput: true,
          swapForY: swapForY,
          pair: new PublicKey(selectedPool.address),
          tokenBase: new PublicKey(selectedPool.tokenX.mint),
          tokenBaseDecimal: selectedPool.tokenX.decimals,
          tokenQuote: new PublicKey(selectedPool.tokenY.mint),
          tokenQuoteDecimal: selectedPool.tokenY.decimals,
          slippage: 0.5,
        });

        const outputDecimals = swapForY
          ? selectedPool.tokenY.decimals
          : selectedPool.tokenX.decimals;
        const outputAmount =
          Number(quote.amount) / Math.pow(10, outputDecimals);
        setToAmount(outputAmount.toFixed(outputDecimals === 6 ? 2 : 6));
      } catch (error) {
        console.error("Error getting quote:", error);
        setToAmount("0");
      } finally {
        setQuoting(false);
      }
    };

    const timeoutId = setTimeout(getQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [fromAmount, swapForY, selectedPool]);

  const handleSwap = async () => {
    if (!connected || !publicKey) {
      showToast("Please connect your wallet", "error");
      return;
    }

    const amount = parseFloat(fromAmount);
    if (amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    const fromToken = swapForY ? selectedPool.tokenX : selectedPool.tokenY;
    const toToken = swapForY ? selectedPool.tokenY : selectedPool.tokenX;
    const minAmount = fromToken.decimals === 6 ? 0.01 : 0.0001;

    if (amount < minAmount) {
      showToast(
        `Minimum swap amount is ${minAmount} ${fromToken.symbol}`,
        "error",
      );
      return;
    }

    const balance = tokenBalances[fromToken.symbol] || 0;
    if (amount > balance) {
      showToast(`Insufficient ${fromToken.symbol} balance`, "error");
      return;
    }

    setLoading(true);
    const toastId = showToast("Preparing swap...", "loading");

    try {
      const decimals = swapForY
        ? selectedPool.tokenX.decimals
        : selectedPool.tokenY.decimals;
      const amountInLamports = BigInt(
        Math.floor(amount * Math.pow(10, decimals)),
      );

      hideToast(toastId);
      showToast("Getting quote from DLMM...", "loading");

      const quote = await dlmmService.getQuote({
        amount: amountInLamports,
        isExactInput: true,
        swapForY: swapForY,
        pair: new PublicKey(selectedPool.address),
        tokenBase: new PublicKey(selectedPool.tokenX.mint),
        tokenBaseDecimal: selectedPool.tokenX.decimals,
        tokenQuote: new PublicKey(selectedPool.tokenY.mint),
        tokenQuoteDecimal: selectedPool.tokenY.decimals,
        slippage: 0.5,
      });

      showToast("Creating swap transaction...", "loading");

      const swapTx = await dlmmService.swap({
        amount: quote.amount,
        otherAmountOffset: quote.otherAmountOffset,
        pair: new PublicKey(selectedPool.address),
        tokenMintX: new PublicKey(selectedPool.tokenX.mint),
        tokenMintY: new PublicKey(selectedPool.tokenY.mint),
        swapForY: swapForY,
        isExactInput: true,
        payer: publicKey,
        hook: dlmmService.hooksConfig,
      });

      showToast("Awaiting wallet signature...", "loading");

      const { blockhash } = await connection.getLatestBlockhash("confirmed");
      swapTx.recentBlockhash = blockhash;
      swapTx.feePayer = publicKey;

      const signature = await sendTransaction(swapTx as any, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      showToast("Confirming transaction...", "loading");

      await connection.confirmTransaction(signature, "confirmed");

      showToast(
        `✅ Swap successful! ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`,
        "success",
      );

      setFromAmount("");
      setToAmount("");

      // Refresh balances
      setTimeout(() => {
        const fetchBalances = async () => {
          if (!publicKey) return;
          const solBalance = await connection.getBalance(publicKey);
          setTokenBalances((prev) => ({ ...prev, WSOL: solBalance / 1e9 }));
        };
        fetchBalances();
      }, 2000);
    } catch (error) {
      showToast(
        `❌ Swap failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setSwapForY(!swapForY);
    setFromAmount("");
    setToAmount("");
  };

  if (!connected) {
    return (
      <div className="border-2 border-cyan-500/30 bg-zinc-950">
        <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
          <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
            {"/// TOKEN SWAP"}
          </h2>
        </div>
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 border-2 border-red-500 bg-red-500/10 mx-auto flex items-center justify-center">
            <Wallet className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-mono text-white uppercase">
              WALLET NOT CONNECTED
            </h3>
            <p className="text-xs font-mono text-zinc-400 max-w-sm mx-auto uppercase">
              Connect your wallet to start swapping tokens
            </p>
          </div>
          <ClientOnly
            fallback={
              <div className="h-10 w-32 bg-zinc-800 animate-pulse mx-auto" />
            }
          >
            <WalletMultiButton />
          </ClientOnly>
        </div>
      </div>
    );
  }

  const fromToken = swapForY ? selectedPool.tokenX : selectedPool.tokenY;
  const toToken = swapForY ? selectedPool.tokenY : selectedPool.tokenX;
  const balance = tokenBalances[fromToken.symbol] || 0;

  return (
    <>
      <ToastContainer />
      <div className="border-2 border-cyan-500/30 bg-zinc-950">
        <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 to-transparent p-4">
          <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-wider">
            {"/// TOKEN SWAP"}
          </h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">
            Swap tokens using Saros DLMM pools
          </p>
        </div>

        <div className="p-6 space-y-4 max-w-2xl mx-auto">
          {/* Pool Selector */}
          <div className="space-y-2">
            <label htmlFor="pool-selector" className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              SELECT POOL
            </label>
            <Select value={selectedPoolId} onValueChange={setSelectedPoolId}>
              <SelectTrigger id="pool-selector" className="bg-[#0a0a0a] border-2 border-zinc-800 h-12 font-mono">
                <SelectValue placeholder="Select a pool" />
              </SelectTrigger>
              <SelectContent>
                {SWAP_POOLS.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    {pool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
              <span className="text-cyan-400">YOU PAY</span>
              <span className="text-zinc-500">
                BALANCE: {balance.toFixed(fromToken.decimals === 9 ? 4 : 2)}
              </span>
            </div>
            <div className="relative bg-[#0a0a0a] border-2 border-zinc-800">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={getTokenImage(fromToken.symbol)}
                    alt={fromToken.symbol}
                    className="w-10 h-10 border-2 border-zinc-800"
                  />
                  <div>
                    <div className="font-bold font-mono text-white">{fromToken.symbol}</div>
                    <div className="text-[9px] font-mono text-zinc-500">
                      {fromToken.name}
                    </div>
                  </div>
                </div>
              </div>
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className="h-24 pl-36 pr-20 text-right text-3xl font-bold font-mono bg-transparent border-0 focus-visible:ring-0"
                min="0"
                step={fromToken.decimals === 6 ? "0.01" : "0.0001"}
              />
              <button
                type="button"
                onClick={() => setFromAmount(balance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] h-7 px-2 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 font-mono uppercase tracking-wider"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={handleFlip}
              disabled={loading}
              className="h-12 w-12 border-2 border-cyan-500 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <ArrowDownUp className="w-5 h-5" />
            </button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
              <span className="text-cyan-400">YOU RECEIVE</span>
              {toAmount && (
                <span className="text-zinc-500">≈ ${toAmount}</span>
              )}
            </div>
            <div className="relative bg-[#0a0a0a] border-2 border-zinc-800">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                <div className="flex items-center gap-3">
                  <img
                    src={getTokenImage(toToken.symbol)}
                    alt={toToken.symbol}
                    className="w-10 h-10 border-2 border-zinc-800"
                  />
                  <div>
                    <div className="font-bold font-mono text-white">{toToken.symbol}</div>
                    <div className="text-[9px] font-mono text-zinc-500">
                      {toToken.name}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-24 pl-36 pr-4 flex items-center justify-end">
                {quoting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                ) : (
                  <span className="text-3xl font-bold font-mono text-white">{toAmount || "0.00"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Rate Info */}
          {fromAmount && toAmount && (
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider bg-[#0a0a0a] border-2 border-zinc-800 p-3">
              <span className="text-zinc-500">RATE</span>
              <span className="font-bold text-white">
                1 {fromToken.symbol} ≈{" "}
                {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)}{" "}
                {toToken.symbol}
              </span>
            </div>
          )}

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwap}
            disabled={
              loading || quoting || !fromAmount || parseFloat(fromAmount) <= 0
            }
            className="w-full h-14 border-2 border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                SWAPPING...
              </>
            ) : (
              `SWAP ${fromToken.symbol}`
            )}
          </button>

          {/* Fee Info */}
          <div className="text-center text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
            Slippage: 0.5% • Powered by Saros DLMM
          </div>
        </div>
      </div>
    </>
  );
}
