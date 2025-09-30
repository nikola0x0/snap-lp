"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useAppStore } from "@/store/app-store";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { TokenPairIcon } from "../token-pair-icon";
import { Loader2, TrendingUp, Target, Layers, Wallet as WalletIcon, Plus, AlertCircle } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "../client-only";
import { useToast } from "../ui/toast";
import { ConfirmDialog } from "../ui/confirm-dialog";

// DLMM Service instance
const dlmmService = new LiquidityBookServices({
  mode: MODE.DEVNET,
  options: {
    rpcUrl:
      "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7",
  },
});

const TOKEN_IMAGES: Record<string, string> = {
  'SOL': 'https://coin98.s3.amazonaws.com/hUTZN237FzDLlfP3',
  'WSOL': 'https://coin98.s3.amazonaws.com/hUTZN237FzDLlfP3',
  'USDT': 'https://file.coin98.com/images/untitled-2-CdtGnpYdjMHmHJNL.png',
  'USDC': 'https://file.coin98.com/images/tdugg6fe0z74qafm-PJ4GMyP9c0PtzSUJ.png',
  'PYUSD': 'https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png',
};

const DEFAULT_IMAGE = 'https://general-inventory.coin98.tech/images/%5Bsaros%5D-mark-purple(1)-115nWyZPJBI9hik4.png';

export function DeploySection() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { selectedPool, selectedTemplate, setStep, getTokenPairSymbol } = useAppStore();
  const { showToast, hideToast, ToastContainer } = useToast();

  const [tokenXAmount, setTokenXAmount] = useState<string>("");
  const [tokenYAmount, setTokenYAmount] = useState<string>("");
  const [tokenXBalance, setTokenXBalance] = useState<string>("0");
  const [tokenYBalance, setTokenYBalance] = useState<string>("0");
  const [isDeploying, setIsDeploying] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, { price: number }>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAmounts, setPendingAmounts] = useState<{ x: number; y: number } | null>(null);

  // Get token symbol from mint address
  const getTokenSymbol = (mintAddress: string) => {
    const tokenMap: Record<string, string> = {
      CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM: "PYUSD",
      So11111111111111111111111111111111111111112: "WSOL",
      mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z: "C98",
      mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9: "USDT",
    };
    return tokenMap[mintAddress] || `${mintAddress.slice(0, 4)}...`;
  };

  // Fetch pool data and prices
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!selectedPool?.metadata) return;

      setLoadingPrices(true);
      try {
        const poolAddress = selectedPool.address;
        const pairInfo = await dlmmService.getPairAccount(new PublicKey(poolAddress));

        let activePrice = 1;
        if (pairInfo && pairInfo.activeId) {
          const calculatedPrice = Math.pow(1.0001, pairInfo.activeId);
          activePrice = isFinite(calculatedPrice) && calculatedPrice > 0 ? calculatedPrice : 180.5;
        } else {
          activePrice = 180.5;
        }

        const tokenPricesData: Record<string, { price: number }> = {
          [selectedPool.metadata.baseMint]: { price: 1.0 },
          [selectedPool.metadata.quoteMint]: { price: activePrice },
        };

        setTokenPrices(tokenPricesData);
      } catch (error) {
        const fallbackPrices: Record<string, { price: number }> = {
          [selectedPool.metadata.baseMint]: { price: 1.0 },
          [selectedPool.metadata.quoteMint]: { price: 180.5 },
        };
        setTokenPrices(fallbackPrices);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPoolData();
  }, [selectedPool?.metadata]);

  // Fetch wallet balances
  useEffect(() => {
    const fetchWalletBalances = async () => {
      if (!connected || !publicKey || !selectedPool?.metadata) return;

      try {
        const baseMint = new PublicKey(selectedPool.metadata.baseMint);
        const quoteMint = new PublicKey(selectedPool.metadata.quoteMint);

        // Fetch Token X balance
        try {
          const baseTokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { mint: baseMint }
          );

          if (baseTokenAccounts.value.length > 0) {
            const balance = baseTokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            setTokenXBalance(balance?.toFixed(4) || "0");
          } else {
            setTokenXBalance("0");
          }
        } catch (error) {
          setTokenXBalance("0");
        }

        // Fetch Token Y balance
        if (quoteMint.toString() === "So11111111111111111111111111111111111111112") {
          const solBalance = await connection.getBalance(publicKey);
          setTokenYBalance((solBalance / 1e9).toFixed(4));
        } else {
          try {
            const quoteTokenAccounts = await connection.getParsedTokenAccountsByOwner(
              publicKey,
              { mint: quoteMint }
            );

            if (quoteTokenAccounts.value.length > 0) {
              const balance = quoteTokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
              setTokenYBalance(balance?.toFixed(4) || "0");
            } else {
              setTokenYBalance("0");
            }
          } catch (error) {
            setTokenYBalance("0");
          }
        }
      } catch (error) {
        setTokenXBalance("0");
        setTokenYBalance("0");
      }
    };

    fetchWalletBalances();
  }, [connected, publicKey, selectedPool?.metadata, connection]);

  // Auto-balance token amounts
  const handleTokenXChange = (value: string) => {
    setTokenXAmount(value);

    if (value && parseFloat(value) > 0 && selectedPool?.metadata) {
      const tokenXPrice = tokenPrices[selectedPool.metadata.baseMint]?.price || 1;
      const tokenYPrice = tokenPrices[selectedPool.metadata.quoteMint]?.price || 1;

      const xAmount = parseFloat(value);

      if (tokenXPrice > 0 && tokenYPrice > 0 && isFinite(tokenXPrice) && isFinite(tokenYPrice)) {
        const correspondingYAmount = (xAmount * tokenXPrice) / tokenYPrice;

        if (isFinite(correspondingYAmount) && correspondingYAmount > 0) {
          setTokenYAmount(correspondingYAmount.toFixed(6));
        } else {
          setTokenYAmount("0");
        }
      } else {
        setTokenYAmount(value);
      }
    } else {
      setTokenYAmount("0");
    }
  };

  const handleTokenYChange = (value: string) => {
    setTokenYAmount(value);

    if (value && parseFloat(value) > 0 && selectedPool?.metadata) {
      const tokenXPrice = tokenPrices[selectedPool.metadata.baseMint]?.price || 1;
      const tokenYPrice = tokenPrices[selectedPool.metadata.quoteMint]?.price || 1;

      const yAmount = parseFloat(value);

      if (tokenXPrice > 0 && tokenYPrice > 0 && isFinite(tokenXPrice) && isFinite(tokenYPrice)) {
        const correspondingXAmount = (yAmount * tokenYPrice) / tokenXPrice;

        if (isFinite(correspondingXAmount) && correspondingXAmount > 0) {
          setTokenXAmount(correspondingXAmount.toFixed(6));
        } else {
          setTokenXAmount("0");
        }
      } else {
        setTokenXAmount(value);
      }
    } else {
      setTokenXAmount("0");
    }
  };

  // Handle Add Liquidity - Main entry point
  const handleAddLiquidity = async () => {
    if (!connected || !publicKey || !selectedPool || !selectedTemplate) {
      showToast("Please connect your wallet and select a pool and strategy first", "error");
      return;
    }

    const xAmount = parseFloat(tokenXAmount);
    const yAmount = parseFloat(tokenYAmount);

    if (xAmount <= 0 && yAmount <= 0) {
      showToast("Please enter token amounts", "error");
      return;
    }

    const xBalance = parseFloat(tokenXBalance);
    const yBalance = parseFloat(tokenYBalance);

    // Check if user has insufficient balance
    const hasInsufficientBalance = xAmount > xBalance || yAmount > yBalance;

    if (hasInsufficientBalance) {
      // Show confirmation dialog
      setPendingAmounts({ x: xAmount, y: yAmount });
      setShowConfirmDialog(true);
      return;
    }

    // Proceed directly if balance is sufficient
    await executeTransaction(xAmount, yAmount);
  };

  // Execute the actual transaction
  const executeTransaction = async (xAmount: number, yAmount: number) => {
    const toastId = showToast("Preparing transaction...", "loading");
    setIsDeploying(true);

    try {
      hideToast(toastId);
      showToast("Loading DLMM SDK...", "loading");

      const {
        LiquidityBookServices,
        MODE,
        createUniformDistribution,
        LiquidityShape,
        findPosition,
        getBinRange,
        getMaxBinArray,
        getMaxPosition,
      } = await import("@saros-finance/dlmm-sdk");
      const { Keypair, PublicKey: SolanaPublicKey, Transaction } = await import("@solana/web3.js");
      type TransactionType = typeof Transaction;
      type KeypairType = typeof Keypair;
      type PublicKeyType = typeof SolanaPublicKey;
      const bigDecimal = (await import("js-big-decimal")).default;

      showToast("Initializing DLMM service...", "loading");
      const sarosDLMM = new LiquidityBookServices({
        mode: MODE.DEVNET,
        options: {
          rpcUrl: "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7",
        },
      });

      showToast("Connecting to Solana network...", "loading");
      const { blockhash } = await connection.getLatestBlockhash({ commitment: "confirmed" });

      showToast("Fetching pool information...", "loading");
      const pair = new SolanaPublicKey(selectedPool!.address);
      const pairInfo = await sarosDLMM.getPairAccount(pair);

      if (!pairInfo) {
        throw new Error("Could not fetch pair account from DLMM");
      }

      const binRange: [number, number] = (selectedTemplate as any).binRange || [-5, 5];
      const activeBin = pairInfo.activeId;

      const txQueue: InstanceType<TransactionType>[] = [];
      const signersQueue: InstanceType<KeypairType>[][] = [];
      const binArrayList = getMaxBinArray(binRange, activeBin);
      const binsAndVaultsTx = new Transaction();

      await Promise.all([
        ...binArrayList.map(async (bin) => {
          await sarosDLMM.getBinArray({
            binArrayIndex: bin.binArrayLowerIndex,
            pair,
            payer: publicKey!,
            transaction: binsAndVaultsTx as any,
          });
          await sarosDLMM.getBinArray({
            binArrayIndex: bin.binArrayUpperIndex,
            pair,
            payer: publicKey!,
            transaction: binsAndVaultsTx as any,
          });
        }),
        ...[selectedPool!.metadata!.baseMint, selectedPool!.metadata!.quoteMint].map(async (mintAddress) => {
          await sarosDLMM.getPairVaultInfo({
            pair,
            payer: publicKey!,
            transaction: binsAndVaultsTx as any,
            tokenAddress: new SolanaPublicKey(mintAddress),
          });
          await sarosDLMM.getUserVaultInfo({
            payer: publicKey!,
            transaction: binsAndVaultsTx as any,
            tokenAddress: new SolanaPublicKey(mintAddress),
          });
        }),
      ]);

      if (binsAndVaultsTx.instructions.length > 0) {
        binsAndVaultsTx.recentBlockhash = blockhash;
        binsAndVaultsTx.feePayer = publicKey!;
        txQueue.push(binsAndVaultsTx);
        signersQueue.push([]);
      }

      const maxPositionList = getMaxPosition(binRange, activeBin);
      const userPositions = await sarosDLMM.getUserPositions({ payer: publicKey!, pair });
      const maxLiquidityDistribution = createUniformDistribution({
        shape: LiquidityShape.Spot,
        binRange,
      });

      for (const position of maxPositionList) {
        const { range, binLower, binUpper } = getBinRange(position, activeBin);
        const currentPosition = userPositions.find(findPosition(position, activeBin));

        const startIndex =
          maxLiquidityDistribution.findIndex((item) => item.relativeBinId === range[0]) ?? 0;
        const endIndex =
          (maxLiquidityDistribution.findIndex((item) => item.relativeBinId === range[1]) ??
            maxLiquidityDistribution.length - 1) + 1;
        const liquidityDistribution = maxLiquidityDistribution.slice(startIndex, endIndex);

        const binArray = binArrayList.find(
          (item) =>
            item.binArrayLowerIndex * 256 <= binLower && (item.binArrayUpperIndex + 1) * 256 > binUpper
        );

        if (!binArray) continue;

        let positionMint: InstanceType<PublicKeyType>;

        if (!currentPosition) {
          const createPositionTx = new Transaction();
          const newPositionMint = Keypair.generate();

          await sarosDLMM.createPosition({
            pair,
            payer: publicKey!,
            relativeBinIdLeft: range[0]!,
            relativeBinIdRight: range[1]!,
            binArrayIndex: binArray.binArrayLowerIndex,
            positionMint: newPositionMint.publicKey,
            transaction: createPositionTx as any,
          });

          createPositionTx.recentBlockhash = blockhash;
          createPositionTx.feePayer = publicKey!;
          txQueue.push(createPositionTx);
          signersQueue.push([newPositionMint]);
          positionMint = newPositionMint.publicKey;
        } else {
          positionMint = currentPosition.positionMint;
        }

        const addLiquidityTx = new Transaction();

        const tokenXDecimals = selectedPool!.metadata!.extra?.tokenBaseDecimal || 6;
        const tokenYDecimals = selectedPool!.metadata!.extra?.tokenQuoteDecimal || 9;

        const amountX = Number(
          new bigDecimal(Math.pow(10, tokenXDecimals)).multiply(new bigDecimal(xAmount)).getValue()
        );
        const amountY = Number(
          new bigDecimal(Math.pow(10, tokenYDecimals)).multiply(new bigDecimal(yAmount)).getValue()
        );

        const binArrayLower = await sarosDLMM.getBinArray({
          binArrayIndex: binArray.binArrayLowerIndex,
          pair,
          payer: publicKey!,
        });
        const binArrayUpper = await sarosDLMM.getBinArray({
          binArrayIndex: binArray.binArrayUpperIndex,
          pair,
          payer: publicKey!,
        });

        await sarosDLMM.addLiquidityIntoPosition({
          amountX,
          amountY,
          positionMint,
          liquidityDistribution,
          binArrayLower: new SolanaPublicKey(binArrayLower.toString()),
          binArrayUpper: new SolanaPublicKey(binArrayUpper.toString()),
          transaction: addLiquidityTx as any,
          payer: publicKey!,
          pair,
        });

        addLiquidityTx.recentBlockhash = blockhash;
        addLiquidityTx.feePayer = publicKey!;
        txQueue.push(addLiquidityTx);
        signersQueue.push([]);
      }

      if (txQueue.length === 0) {
        throw new Error("No transactions to execute");
      }

      showToast(`Processing ${txQueue.length} transaction(s)...`, "loading");
      const executedSignatures: string[] = [];

      for (let i = 0; i < txQueue.length; i++) {
        const tx = txQueue[i];
        const signers = signersQueue[i];

        if (!tx) continue;

        try {
          showToast(`Signing transaction ${i + 1}/${txQueue.length}...`, "loading");
          const { blockhash: freshBlockhash } = await connection.getLatestBlockhash("confirmed");
          tx.recentBlockhash = freshBlockhash;

          if (tx.signatures.length === 0 || !tx.signatures[0].signature) {
            if (signers.length > 0) {
              const signature = await sendTransaction(tx, connection, {
                skipPreflight: false,
                preflightCommitment: "confirmed",
                signers,
              });
              executedSignatures.push(signature);
            } else {
              const signature = await sendTransaction(tx, connection, {
                skipPreflight: false,
                preflightCommitment: "confirmed",
              });
              executedSignatures.push(signature);
            }
          }

          showToast(`Confirming transaction ${i + 1}/${txQueue.length}...`, "loading");
          const confirmation = await connection.confirmTransaction(
            executedSignatures[executedSignatures.length - 1],
            "confirmed"
          );

          if (confirmation.value.err) {
            throw confirmation.value.err;
          }

          showToast(`✅ Transaction ${i + 1}/${txQueue.length} confirmed`, "success");
        } catch (txError) {
          throw new Error(
            `Transaction ${i + 1}/${txQueue.length} failed: ${
              txError instanceof Error ? txError.message : "Unknown error"
            }`
          );
        }
      }

      showToast(`🎉 Position created! ${executedSignatures.length} transaction(s) confirmed`, "success");
      setTimeout(() => setStep("portfolio"), 2000);
    } catch (error) {
      showToast(
        `❌ Failed to create position: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      );
    } finally {
      setIsDeploying(false);
    }
  };

  // Redirect if no pool/template selected
  if (!selectedPool || !selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <Target className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Ready to Deploy?</h3>
          <p className="text-muted-foreground max-w-sm">
            {!selectedPool ? "Please select a pool first." : "Please select a strategy template first."}
          </p>
        </div>
        <Button onClick={() => setStep(!selectedPool ? "pools" : "templates")} variant="outline">
          {!selectedPool ? "Go to Pool Selection" : "Go to Template Selection"}
        </Button>
      </div>
    );
  }

  // Wallet connection requirement
  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
          <WalletIcon className="w-10 h-10 text-white" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Connect Wallet</h3>
          <p className="text-muted-foreground max-w-sm">
            Connect your wallet to add liquidity to the pool
          </p>
        </div>
        <ClientOnly fallback={<div className="h-10 w-32 bg-muted animate-pulse rounded-md" />}>
          <WalletMultiButton />
        </ClientOnly>
      </div>
    );
  }

  const tokenX = selectedPool?.metadata ? getTokenSymbol(selectedPool.metadata.baseMint) : "Token X";
  const tokenY = selectedPool?.metadata ? getTokenSymbol(selectedPool.metadata.quoteMint) : "Token Y";

  const tokenXPrice = selectedPool?.metadata ? tokenPrices[selectedPool.metadata.baseMint]?.price || 1 : 1;
  const tokenYPrice = selectedPool?.metadata ? tokenPrices[selectedPool.metadata.quoteMint]?.price || 1 : 1;

  const xAmount = parseFloat(tokenXAmount) || 0;
  const yAmount = parseFloat(tokenYAmount) || 0;

  const totalValue = xAmount * tokenXPrice + yAmount * tokenYPrice;

  // Calculate exchange rate
  let exchangeRate = 0;
  if (tokenXPrice > 0 && tokenYPrice > 0 && isFinite(tokenXPrice) && isFinite(tokenYPrice)) {
    exchangeRate = tokenYPrice / tokenXPrice;
    if (!isFinite(exchangeRate)) exchangeRate = 0;
  }

  const getTokenImage = (symbol: string) => TOKEN_IMAGES[symbol] || DEFAULT_IMAGE;

  // Get token symbols for display
  const currentTokenX = selectedPool?.metadata ? getTokenSymbol(selectedPool.metadata.baseMint) : "Token X";
  const currentTokenY = selectedPool?.metadata ? getTokenSymbol(selectedPool.metadata.quoteMint) : "Token Y";
  const currentXBalance = parseFloat(tokenXBalance);
  const currentYBalance = parseFloat(tokenYBalance);

  return (
    <>
      <ToastContainer />

      {/* Confirmation Dialog for Insufficient Balance */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setPendingAmounts(null);
        }}
        onConfirm={() => {
          if (pendingAmounts) {
            executeTransaction(pendingAmounts.x, pendingAmounts.y);
            setPendingAmounts(null);
          }
        }}
        title="No Tokens Available"
        message={`You don't have enough tokens to add liquidity.

Required: ${pendingAmounts?.x || 0} ${currentTokenX} + ${pendingAmounts?.y || 0} ${currentTokenY}
Available: ${currentXBalance} ${currentTokenX} + ${currentYBalance} ${currentTokenY}

Continuing will create an empty position without adding liquidity. You can add liquidity later when you have tokens.`}
        confirmText="Create Empty Position"
        cancelText="Cancel"
      />

      <div className="space-y-4 pb-32">
      {/* Pool & Strategy Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Add Liquidity</h2>
          <p className="text-xs text-muted-foreground">
            Deploy {selectedTemplate.name} strategy
          </p>
        </div>
        {selectedPool && (
          <TokenPairIcon
            tokenA={{ symbol: currentTokenX, image: getTokenImage(currentTokenX) }}
            tokenB={{ symbol: currentTokenY, image: getTokenImage(currentTokenY) }}
            size="md"
          />
        )}
      </div>

      {/* Main Card */}
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="p-4 space-y-3">
            {/* Token X Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">First token</span>
                <span className="text-muted-foreground">Balance: {tokenXBalance}</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <div className="flex items-center gap-2">
                    <img
                      src={getTokenImage(tokenX)}
                      alt={tokenX}
                      className="w-8 h-8 rounded-full border-2 border-background"
                    />
                    <div>
                      <div className="font-semibold text-sm">{tokenX}</div>
                      <div className="text-[10px] text-muted-foreground">
                        ${(xAmount * tokenXPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <Input
                  type="number"
                  value={tokenXAmount}
                  onChange={(e) => handleTokenXChange(e.target.value)}
                  placeholder="0.00"
                  className="h-16 pl-28 pr-20 text-right text-2xl font-bold"
                  min="0"
                  step="1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTokenXChange(tokenXBalance)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs h-7"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center -my-1">
              <div className="h-8 w-8 rounded-full border-2 border-border flex items-center justify-center bg-muted">
                <Plus className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* Token Y Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Second token</span>
                <span className="text-muted-foreground">Balance: {tokenYBalance}</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <div className="flex items-center gap-2">
                    <img
                      src={getTokenImage(tokenY)}
                      alt={tokenY}
                      className="w-8 h-8 rounded-full border-2 border-background"
                    />
                    <div>
                      <div className="font-semibold text-sm">{tokenY}</div>
                      <div className="text-[10px] text-muted-foreground">
                        ${(yAmount * tokenYPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <Input
                  type="number"
                  value={tokenYAmount}
                  onChange={(e) => handleTokenYChange(e.target.value)}
                  placeholder="0.00"
                  className="h-16 pl-28 pr-20 text-right text-2xl font-bold"
                  min="0"
                  step="1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTokenYChange(tokenYBalance)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs h-7"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Zero Balance Warning */}
            {connected && (parseFloat(tokenXBalance) === 0 || parseFloat(tokenYBalance) === 0) && (
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-orange-700">No Token Balance</div>
                  <div className="text-orange-600 mt-0.5">
                    You need {currentTokenX} and {currentTokenY} tokens in your wallet to add liquidity.
                    {parseFloat(tokenXBalance) === 0 && ` Missing ${currentTokenX}.`}
                    {parseFloat(tokenYBalance) === 0 && ` Missing ${currentTokenY}.`}
                  </div>
                </div>
              </div>
            )}

            {/* Strategy Info */}
            {totalValue > 0 && (
              <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <Layers className="w-3 h-3" />
                  <span>Strategy Details</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Total Value</div>
                    <div className="font-semibold">${totalValue.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Est. APR</div>
                    <div className="font-semibold text-green-600">{selectedTemplate.estimatedAPR}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Risk Level</div>
                    <Badge variant="secondary" className="font-semibold text-[10px] px-1.5 py-0">
                      {selectedTemplate.riskLevel}
                    </Badge>
                  </div>
                </div>
                {exchangeRate > 0 && (
                  <div className="pt-1.5 border-t text-[10px] text-muted-foreground">
                    Rate: 1 {tokenX} ≈ {exchangeRate.toFixed(6)} {tokenY}
                  </div>
                )}
              </div>
            )}

            {/* Add Liquidity Button */}
            <Button
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleAddLiquidity}
              disabled={isDeploying || !tokenXAmount || parseFloat(tokenXAmount) <= 0}
            >
              {isDeploying ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding Liquidity...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Add Liquidity
                </div>
              )}
            </Button>

            {/* Footer Info */}
            <div className="text-center text-[10px] text-muted-foreground">
              Slippage: {selectedTemplate.parameters.slippage * 100}% • Range: ±
              {selectedTemplate.binConfiguration.rangeWidth / 2}% • Powered by Saros DLMM
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}