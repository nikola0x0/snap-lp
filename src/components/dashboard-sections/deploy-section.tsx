"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useAppStore } from "@/store/app-store";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
}

// DLMM Service instance (following ref/DLMM/service.ts pattern)
const dlmmService = new LiquidityBookServices({
  mode: MODE.DEVNET,
  options: {
    rpcUrl:
      "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7",
  },
});
import { TokenSwapModal } from "../token-swap-modal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ClientOnly } from "../client-only";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Settings,
  AlertTriangle,
  Rocket,
  Play,
} from "lucide-react";

type DeployStep = "configure" | "review" | "deploy";

interface DeployConfig {
  liquidityAmount: number;
  tokenXPercentage: number;
  tokenYPercentage: number;
  slippage: number;
  autoRebalance: boolean;
}

const steps = [
  { id: "configure", label: "Configure Position", icon: Settings },
  { id: "review", label: "Review & Confirm", icon: CheckCircle },
  { id: "deploy", label: "Deploy", icon: Rocket },
];

export function DeploySection() {
  const {
    connected,
    wallet,
    publicKey,
    sendTransaction,
    signTransaction,
  } = useWallet();
  const { connection } = useConnection();
  const {
    selectedPool,
    selectedTemplate,
    setStep,
    getTokenPairSymbol,
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState<DeployStep>("configure");
  const [deployConfig, setDeployConfig] = useState<DeployConfig>({
    liquidityAmount: selectedTemplate?.parameters.minTokenAmount || 1000,
    tokenXPercentage:
      selectedTemplate?.parameters.defaultTokenXPercentage || 50,
    tokenYPercentage: 50,
    slippage: selectedTemplate?.parameters.slippage
      ? selectedTemplate.parameters.slippage * 100
      : 1.0,
    autoRebalance: selectedTemplate?.parameters.autoRebalance || false,
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [showTokenSwapModal, setShowTokenSwapModal] = useState(false);
  const [hasRequiredTokens, setHasRequiredTokens] = useState(false);
  const [tokenPrices, setTokenPrices] = useState<Record<string, TokenPrice>>(
    {}
  );
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [tokenXAmount, setTokenXAmount] = useState<string>("0");
  const [tokenYAmount, setTokenYAmount] = useState<string>("0");
  const [tokenXBalance, setTokenXBalance] = useState<string>("0");
  const [tokenYBalance, setTokenYBalance] = useState<string>("0");

  // Fetch real pool data and prices from DLMM
  useEffect(() => {
    const fetchPoolData = async () => {
      if (!selectedPool?.metadata) return;

      setLoadingPrices(true);
      try {
        // Get pool metadata from DLMM service
        const poolAddress = selectedPool.address;
        const poolMetadata = await dlmmService.fetchPoolMetadata(poolAddress);

        // Get pair account info for current prices
        const pairInfo = await dlmmService.getPairAccount(
          new PublicKey(poolAddress)
        );

        console.log("DLMM Pool Metadata:", poolMetadata);
        console.log("DLMM Pair Info:", pairInfo);

        // Extract token information and current price from active bin
        // Guard against extreme activeId values that would cause Infinity
        let activePrice = 1;
        if (pairInfo && pairInfo.activeId) {
          // Check if the result would be finite before using it
          const calculatedPrice = Math.pow(1.0001, pairInfo.activeId);
          activePrice =
            isFinite(calculatedPrice) && calculatedPrice > 0
              ? calculatedPrice
              : 180.5;
        } else {
          activePrice = 180.5; // Fallback SOL price
        }

        const tokenPricesData: Record<string, TokenPrice> = {
          [selectedPool.metadata.baseMint]: {
            symbol: "PYUSD",
            price: 1.0, // Base token (PYUSD = $1)
            change24h: 0.1,
          },
          [selectedPool.metadata.quoteMint]: {
            symbol: "WSOL",
            price: activePrice, // Price from active bin
            change24h: 2.3,
          },
        };

        setTokenPrices(tokenPricesData);
      } catch (error) {
        console.error("Error fetching DLMM pool data:", error);
        // Fallback to basic token info if DLMM fetch fails
        const fallbackPrices: Record<string, TokenPrice> = {
          [selectedPool.metadata.baseMint]: {
            symbol: "PYUSD",
            price: 1.0,
            change24h: 0.1,
          },
          [selectedPool.metadata.quoteMint]: {
            symbol: "WSOL",
            price: 180.5,
            change24h: 2.3,
          },
        };
        setTokenPrices(fallbackPrices);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPoolData();
  }, [selectedPool?.metadata]);

  // Fetch wallet token balances
  useEffect(() => {
    const fetchWalletBalances = async () => {
      if (!connected || !publicKey || !selectedPool?.metadata) return;

      try {
        const baseMint = new PublicKey(selectedPool.metadata.baseMint);
        const quoteMint = new PublicKey(selectedPool.metadata.quoteMint);

        console.log("Fetching real token balances for:", {
          baseMint: baseMint.toString(),
          quoteMint: quoteMint.toString(),
          wallet: publicKey.toString(),
        });

        // Fetch Token X (base token) balance
        try {
          const baseTokenAccounts = await connection.getParsedTokenAccountsByOwner(
            publicKey,
            { mint: baseMint }
          );

          if (baseTokenAccounts.value.length > 0) {
            const balance = baseTokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            setTokenXBalance(balance?.toFixed(4) || "0");
            console.log(`✅ ${getTokenSymbol(baseMint.toString())} balance:`, balance);
          } else {
            setTokenXBalance("0");
            console.log(`⚠️ No ${getTokenSymbol(baseMint.toString())} token account found`);
          }
        } catch (error) {
          console.error("Error fetching base token balance:", error);
          setTokenXBalance("0");
        }

        // Fetch Token Y (quote token) balance
        // Check if it's wrapped SOL
        if (quoteMint.toString() === "So11111111111111111111111111111111111111112") {
          const solBalance = await connection.getBalance(publicKey);
          setTokenYBalance((solBalance / 1e9).toFixed(4));
          console.log(`✅ SOL balance:`, (solBalance / 1e9).toFixed(4));
        } else {
          try {
            const quoteTokenAccounts = await connection.getParsedTokenAccountsByOwner(
              publicKey,
              { mint: quoteMint }
            );

            if (quoteTokenAccounts.value.length > 0) {
              const balance = quoteTokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
              setTokenYBalance(balance?.toFixed(4) || "0");
              console.log(`✅ ${getTokenSymbol(quoteMint.toString())} balance:`, balance);
            } else {
              setTokenYBalance("0");
              console.log(`⚠️ No ${getTokenSymbol(quoteMint.toString())} token account found`);
            }
          } catch (error) {
            console.error("Error fetching quote token balance:", error);
            setTokenYBalance("0");
          }
        }
      } catch (error) {
        console.error("Error fetching wallet balances:", error);
        setTokenXBalance("0");
        setTokenYBalance("0");
      }
    };

    fetchWalletBalances();
  }, [connected, publicKey, selectedPool?.metadata, connection]);

  // Redirect if no pool or template is selected
  if (!selectedPool || !selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-muted-foreground">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-semibold mb-2">Ready to Deploy?</h2>
          <p className="max-w-md">
            {!selectedPool
              ? "Please select a pool first."
              : "Please select a strategy template first."}
          </p>
        </div>
        <Button
          onClick={() => setStep(!selectedPool ? "pools" : "templates")}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {!selectedPool ? "Go to Pool Selection" : "Go to Template Selection"}
        </Button>
      </div>
    );
  }

  // Wallet connection requirement
  if (!connected) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Step 4: Deploy Strategy
            </h1>
            <p className="text-muted-foreground">
              Deploy your {selectedTemplate.name} strategy to{" "}
              {getTokenPairSymbol()} pool.
            </p>
          </div>

          {/* Selection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Selected Pool
                    </div>
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
                    <div className="text-sm text-muted-foreground">
                      Selected Strategy
                    </div>
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
              <ClientOnly
                fallback={
                  <div className="h-9 w-32 bg-muted animate-pulse rounded-md mx-auto" />
                }
              >
                <WalletMultiButton className="mx-auto" />
              </ClientOnly>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get token symbol from mint address
  const getTokenSymbol = (mintAddress: string) => {
    const tokenMap: Record<string, string> = {
      CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM: "PYUSD", // PYUSD devnet
      So11111111111111111111111111111111111111112: "WSOL", // Wrapped SOL
      mntRT93wUdszL1e9QoLGtWoEfAYzFgofePyT8fTTe7z: "C98", // Dex V3 C98
      mnt3Mc5iK8UNZheyPmS9UQKrM6Rz5s4d8x63BUv22F9: "USDT", // Dex V3 Tether USD
    };
    return tokenMap[mintAddress] || `${mintAddress.slice(0, 4)}...`;
  };

  // Calculate required token amounts based on selected pool and config
  const getRequiredTokens = () => {
    if (!selectedPool?.metadata) {
      return {
        tokenXAmount: 0,
        tokenYAmount: 0,
        tokenXSymbol: "Unknown",
        tokenYSymbol: "Unknown",
        tokenXUsdValue: 0,
        tokenYUsdValue: 0,
        totalUsdValue: 0,
        tokenXPrice: null,
        tokenYPrice: null,
      };
    }

    // Use the state variables tokenXAmount and tokenYAmount instead
    const tokenXAmountNum = parseFloat(tokenXAmount) || 0;
    const tokenYAmountNum = parseFloat(tokenYAmount) || 0;

    const tokenXSymbol = getTokenSymbol(selectedPool.metadata.baseMint);
    const tokenYSymbol = getTokenSymbol(selectedPool.metadata.quoteMint);

    // Get prices and calculate USD values
    const tokenXPrice = tokenPrices[selectedPool.metadata.baseMint] || null;
    const tokenYPrice = tokenPrices[selectedPool.metadata.quoteMint] || null;

    const tokenXUsdValue = tokenXPrice
      ? tokenXAmountNum * tokenXPrice.price
      : 0;
    const tokenYUsdValue = tokenYPrice
      ? tokenYAmountNum * tokenYPrice.price
      : 0;
    const totalUsdValue = tokenXUsdValue + tokenYUsdValue;

    return {
      tokenXAmount: tokenXAmountNum,
      tokenYAmount: tokenYAmountNum,
      tokenXSymbol,
      tokenYSymbol,
      tokenXUsdValue,
      tokenYUsdValue,
      totalUsdValue,
      tokenXPrice,
      tokenYPrice,
      // Legacy properties for backward compatibility
      c98Amount:
        tokenXSymbol === "C98"
          ? tokenXAmountNum
          : tokenYSymbol === "C98"
          ? tokenYAmountNum
          : 0,
      usdtAmount:
        tokenXSymbol === "USDT"
          ? tokenXAmountNum
          : tokenYSymbol === "USDT"
          ? tokenYAmountNum
          : 0,
    };
  };

  const handleGetTokens = () => {
    setShowTokenSwapModal(true);
  };

  const handleSwapComplete = () => {
    setHasRequiredTokens(true);
    setShowTokenSwapModal(false);
  };

  const handleDeploy = async () => {
    if (!wallet || !publicKey) {
      console.error("Wallet not connected");
      alert("Please connect your wallet first");
      return;
    }

    // Check if user has required tokens first
    if (!hasRequiredTokens) {
      alert('Please get the required tokens first by clicking "Get Tokens"');
      return;
    }

    setIsDeploying(true);
    setCurrentStep("deploy");

    try {
      console.log("Starting real DLMM deployment with config:", {
        pool: selectedPool,
        template: selectedTemplate,
        config: deployConfig,
      });

      // Use the existing dlmm-integration service
      console.log("Using DLMM integration service for deployment");

      // Convert template configuration to the format expected by DLMM service
      // Convert the distribution type to actual bin distribution array
      const getBinDistribution = (
        _distributionType: string,
        binCount: number
      ) => {
        // This is a simplified conversion - in a real implementation, you'd have more sophisticated logic
        const distribution = [];
        for (let i = 0; i < binCount; i++) {
          distribution.push({
            binId: i - Math.floor(binCount / 2), // Center bins around 0
            weight: 1, // Equal weight for now - could be more sophisticated based on distributionType
          });
        }
        return distribution;
      };

      const templateConfig = {
        binDistribution: getBinDistribution(
          selectedTemplate.binConfiguration.distribution,
          selectedTemplate.binConfiguration.binCount
        ),
        totalAmount: deployConfig.liquidityAmount,
        tokenXPercentage: deployConfig.tokenXPercentage,
      };

      // TODO: Use DLMM SDK to create position (using reference scripts from ref/DLMM/)
      const result = {
        success: true,
        message: `Position created successfully with ${templateConfig.totalAmount} liquidity`,
        transaction: null, // Would contain the actual transaction
        positionMintKeypair: null,
      };

      console.log("DLMM deployment result:", result);

      if (result.success) {
        console.log("Position created successfully!", result);

        // If we have a real transaction to sign, send it through the wallet
        if (
          result.transaction &&
          sendTransaction &&
          result.positionMintKeypair
        ) {
          console.log("Sending transaction through wallet...");

          try {
            // The transaction is already prepared, just need to sign with position mint first
            const transaction = result.transaction;

            console.log("Transaction before signing:", {
              recentBlockhash: transaction.recentBlockhash,
              feePayer: transaction.feePayer?.toString(),
              signatures: transaction.signatures.map((s) => ({
                publicKey: s.publicKey.toString(),
                signature: s.signature ? "present" : "null",
              })),
              instructions: transaction.instructions.length,
            });

            // Sign with the position mint keypair first
            transaction.partialSign(result.positionMintKeypair);
            console.log("Position mint signed the transaction");

            // Verify transaction is valid before sending
            console.log("Transaction after position mint signing:", {
              recentBlockhash: transaction.recentBlockhash,
              feePayer: transaction.feePayer?.toString(),
              signatures: transaction.signatures.map((s) => ({
                publicKey: s.publicKey.toString(),
                signature: s.signature ? "present" : "null",
              })),
              instructions: transaction.instructions.length,
            });

            // Try using signTransaction instead of sendTransaction for better compatibility
            console.log("Signing transaction with wallet...");
            if (!signTransaction) {
              throw new Error("Wallet does not support transaction signing");
            }
            const signedTransaction = await signTransaction(transaction);

            if (!signedTransaction) {
              throw new Error("Failed to sign transaction");
            }

            console.log(
              "Transaction signed by wallet, now sending to network..."
            );
            const signature = await connection.sendRawTransaction(
              signedTransaction.serialize()
            );
            console.log("Transaction sent:", signature);

            // Wait for confirmation
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
              signature,
              blockhash: latestBlockhash.blockhash,
              lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            });
            console.log("Transaction confirmed!");

            alert(
              `Real DLMM position created successfully! Transaction: ${signature}`
            );
          } catch (txError) {
            console.error("Transaction failed:", txError);
            alert(
              `Transaction failed: ${
                txError instanceof Error ? txError.message : "Unknown error"
              }`
            );
            return;
          }
        } else {
          // For simulation responses
          alert(`Position created successfully! ${result.message}`);
        }

        setStep("portfolio"); // Navigate to portfolio to see the new position
      } else {
        throw new Error(result.error || result.message);
      }
    } catch (error) {
      console.error("Deployment failed:", error);
      alert(
        `Deployment failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const StepIndicator = ({ stepId }: { stepId: DeployStep }) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    const isCompleted =
      stepIndex < currentIndex || (currentStep === "deploy" && !isDeploying);
    const isCurrent = stepId === currentStep;
    const StepIcon = steps[stepIndex].icon;

    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted
              ? "bg-green-500 text-white"
              : isCurrent
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <StepIcon className="w-4 h-4" />
          )}
        </div>
        <span
          className={`text-sm font-medium ${
            isCurrent ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {steps[stepIndex].label}
        </span>
      </div>
    );
  };

  // Get token symbols for display
  const getTokenSymbols = () => {
    if (!selectedPool?.metadata)
      return { tokenX: "Token X", tokenY: "Token Y" };
    const tokenX = getTokenSymbol(selectedPool.metadata.baseMint);
    const tokenY = getTokenSymbol(selectedPool.metadata.quoteMint);
    return { tokenX, tokenY };
  };

  const { tokenX, tokenY } = getTokenSymbols();

  // Calculate pool share and price ratios
  const calculatePoolInfo = () => {
    const xAmount = parseFloat(tokenXAmount) || 0;
    const yAmount = parseFloat(tokenYAmount) || 0;

    const tokenXPrice =
      tokenPrices[selectedPool?.metadata?.baseMint || ""]?.price || 1;
    const tokenYPrice =
      tokenPrices[selectedPool?.metadata?.quoteMint || ""]?.price || 1;

    // Validate prices and calculate ratios safely
    let xPerY = 0;
    let yPerX = 0;

    if (
      tokenXPrice > 0 &&
      tokenYPrice > 0 &&
      isFinite(tokenXPrice) &&
      isFinite(tokenYPrice)
    ) {
      xPerY = tokenYPrice / tokenXPrice;
      yPerX = tokenXPrice / tokenYPrice;

      // Ensure results are finite
      if (!isFinite(xPerY)) xPerY = 0;
      if (!isFinite(yPerX)) yPerX = 0;
    }

    // Calculate more realistic pool share based on current pool reserves
    const totalValue = xAmount * tokenXPrice + yAmount * tokenYPrice;
    let poolShare = 0;

    if (totalValue > 0 && selectedPool?.metadata) {
      // Use actual pool reserves for more realistic calculation
      const baseReserveValue =
        parseFloat(selectedPool.metadata.baseReserve || "1000000") *
        tokenXPrice;
      const quoteReserveValue =
        parseFloat(selectedPool.metadata.quoteReserve || "2000000") *
        tokenYPrice;
      const totalPoolValue = baseReserveValue + quoteReserveValue;

      if (totalPoolValue > 0) {
        poolShare = (totalValue / (totalPoolValue + totalValue)) * 100;
        // Cap at reasonable maximum
        poolShare = Math.min(poolShare, 25); // Max 25% for safety
      }
    }

    return {
      xPerY: xPerY.toFixed(6),
      yPerX: yPerX.toFixed(6),
      poolShare: poolShare.toFixed(2),
    };
  };

  const poolInfo = calculatePoolInfo();

  // Auto-rebalance function to calculate corresponding token amount
  const handleTokenXChange = (value: string) => {
    setTokenXAmount(value);

    if (value && parseFloat(value) > 0) {
      // Auto-calculate tokenY based on current price ratio
      const tokenXPrice =
        tokenPrices[selectedPool?.metadata?.baseMint || ""]?.price || 1;
      const tokenYPrice =
        tokenPrices[selectedPool?.metadata?.quoteMint || ""]?.price || 1;

      const xAmount = parseFloat(value);

      // Validate prices to prevent Infinity calculations
      if (
        tokenXPrice > 0 &&
        tokenYPrice > 0 &&
        isFinite(tokenXPrice) &&
        isFinite(tokenYPrice)
      ) {
        const correspondingYAmount = (xAmount * tokenXPrice) / tokenYPrice;

        if (isFinite(correspondingYAmount) && correspondingYAmount > 0) {
          setTokenYAmount(correspondingYAmount.toFixed(6));
        } else {
          setTokenYAmount("0");
        }
      } else {
        // Fallback to 1:1 ratio if prices are invalid
        setTokenYAmount(value);
      }
    } else {
      setTokenYAmount("0");
    }
  };

  const handleTokenYChange = (value: string) => {
    setTokenYAmount(value);

    if (value && parseFloat(value) > 0) {
      // Auto-calculate tokenX based on current price ratio
      const tokenXPrice =
        tokenPrices[selectedPool?.metadata?.baseMint || ""]?.price || 1;
      const tokenYPrice =
        tokenPrices[selectedPool?.metadata?.quoteMint || ""]?.price || 1;

      const yAmount = parseFloat(value);

      // Validate prices to prevent Infinity calculations
      if (
        tokenXPrice > 0 &&
        tokenYPrice > 0 &&
        isFinite(tokenXPrice) &&
        isFinite(tokenYPrice)
      ) {
        const correspondingXAmount = (yAmount * tokenYPrice) / tokenXPrice;

        if (isFinite(correspondingXAmount) && correspondingXAmount > 0) {
          setTokenXAmount(correspondingXAmount.toFixed(6));
        } else {
          setTokenXAmount("0");
        }
      } else {
        // Fallback to 1:1 ratio if prices are invalid
        setTokenXAmount(value);
      }
    } else {
      setTokenXAmount("0");
    }
  };

  // Handle Add Liquidity button click - Real DLMM Implementation
  const handleAddLiquidity = async () => {
    if (!connected || !publicKey || !selectedPool || !selectedTemplate) {
      alert("Please connect your wallet and select a pool and strategy first");
      return;
    }

    const xAmount = parseFloat(tokenXAmount);
    const yAmount = parseFloat(tokenYAmount);

    if (xAmount <= 0 && yAmount <= 0) {
      alert("Please enter token amounts");
      return;
    }

    // Validate sufficient token balances
    const xBalance = parseFloat(tokenXBalance);
    const yBalance = parseFloat(tokenYBalance);

    if (xAmount > xBalance) {
      alert(`❌ Insufficient ${tokenX} balance!\n\nRequired: ${xAmount} ${tokenX}\nAvailable: ${xBalance} ${tokenX}\n\nPlease reduce the amount or acquire more tokens.`);
      return;
    }

    if (yAmount > yBalance) {
      alert(`❌ Insufficient ${tokenY} balance!\n\nRequired: ${yAmount} ${tokenY}\nAvailable: ${yBalance} ${tokenY}\n\nPlease reduce the amount or acquire more tokens.`);
      return;
    }

    setIsDeploying(true);

    try {
      console.log("🚀 Starting real DLMM liquidity deployment:", {
        pool: selectedPool.address,
        strategy: selectedTemplate.name,
        tokenXAmount: xAmount,
        tokenYAmount: yAmount,
        wallet: publicKey.toString(),
      });

      // Import DLMM SDK components following ref/DLMM patterns
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
      const { Keypair, PublicKey: SolanaPublicKey, Transaction } = await import(
        "@solana/web3.js"
      );
      const bigDecimal = (await import("js-big-decimal")).default;

      // Initialize DLMM service with devnet configuration from ref/DLMM/service.ts
      const sarosDLMM = new LiquidityBookServices({
        mode: MODE.DEVNET,
        options: {
          rpcUrl:
            "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7",
        },
      });

      const connection = sarosDLMM.connection;
      const { blockhash } = await connection.getLatestBlockhash({
        commitment: "confirmed",
      });

      const pair = new SolanaPublicKey(selectedPool.address);
      const pairInfo = await sarosDLMM.getPairAccount(pair);

      if (!pairInfo) {
        throw new Error("Could not fetch pair account from DLMM");
      }

      // Strategy determines bin range - following template patterns
      const binRange: [number, number] = selectedTemplate.binRange || [-5, 5];
      const activeBin = pairInfo.activeId;

      console.log("🎯 Strategy config:", {
        name: selectedTemplate.name,
        binRange,
        activeBin,
        riskLevel: selectedTemplate.riskLevel,
      });

      // Create transaction queue following ref/DLMM/add-liquidity.ts
      const txQueue: Transaction[] = [];
      const signersQueue: Keypair[][] = []; // Track signers for each transaction
      const binArrayList = getMaxBinArray(binRange, activeBin);
      const binsAndVaultsTx = new Transaction();

      console.log("⚙️ Initializing bin arrays and vaults...");

      // Initialize required bin arrays and token vaults
      await Promise.all([
        ...binArrayList.map(async (bin) => {
          await sarosDLMM.getBinArray({
            binArrayIndex: bin.binArrayLowerIndex,
            pair,
            payer: publicKey,
            transaction: binsAndVaultsTx as any,
          });
          await sarosDLMM.getBinArray({
            binArrayIndex: bin.binArrayUpperIndex,
            pair,
            payer: publicKey,
            transaction: binsAndVaultsTx as any,
          });
        }),
        // Initialize vault information for both tokens
        ...[
          selectedPool.metadata.baseMint,
          selectedPool.metadata.quoteMint,
        ].map(async (mintAddress) => {
          await sarosDLMM.getPairVaultInfo({
            pair,
            payer: publicKey,
            transaction: binsAndVaultsTx as any,
            tokenAddress: new SolanaPublicKey(mintAddress),
          });
          await sarosDLMM.getUserVaultInfo({
            payer: publicKey,
            transaction: binsAndVaultsTx as any,
            tokenAddress: new SolanaPublicKey(mintAddress),
          });
        }),
      ]);

      if (binsAndVaultsTx.instructions.length > 0) {
        binsAndVaultsTx.recentBlockhash = blockhash;
        binsAndVaultsTx.feePayer = publicKey;
        txQueue.push(binsAndVaultsTx);
        signersQueue.push([]); // No additional signers for setup tx
        console.log("📝 Added setup transaction to queue");
      }

      // Create position and liquidity distribution
      const maxPositionList = getMaxPosition(binRange, activeBin);
      const userPositions = await sarosDLMM.getUserPositions({
        payer: publicKey,
        pair,
      });
      const maxLiquidityDistribution = createUniformDistribution({
        shape: LiquidityShape.Spot,
        binRange,
      });

      console.log(
        `💰 Creating ${maxPositionList.length} positions with liquidity distribution`
      );

      // Process positions following ref/DLMM/add-liquidity.ts pattern
      for (const position of maxPositionList) {
        const { range, binLower, binUpper } = getBinRange(position, activeBin);
        const currentPosition = userPositions.find(
          findPosition(position, activeBin)
        );

        const startIndex =
          maxLiquidityDistribution.findIndex(
            (item) => item.relativeBinId === range[0]
          ) ?? 0;
        const endIndex =
          (maxLiquidityDistribution.findIndex(
            (item) => item.relativeBinId === range[1]
          ) ?? maxLiquidityDistribution.length - 1) + 1;
        const liquidityDistribution = maxLiquidityDistribution.slice(
          startIndex,
          endIndex
        );

        const binArray = binArrayList.find(
          (item) =>
            item.binArrayLowerIndex * 256 <= binLower &&
            (item.binArrayUpperIndex + 1) * 256 > binUpper
        );

        if (!binArray) continue;

        let positionMint: SolanaPublicKey;

        // Create position if it doesn't exist
        if (!currentPosition) {
          const createPositionTx = new Transaction();
          const newPositionMint = Keypair.generate();

          await sarosDLMM.createPosition({
            pair,
            payer: publicKey,
            relativeBinIdLeft: range[0]!,
            relativeBinIdRight: range[1]!,
            binArrayIndex: binArray.binArrayLowerIndex,
            positionMint: newPositionMint.publicKey,
            transaction: createPositionTx as any,
          });

          createPositionTx.recentBlockhash = blockhash;
          createPositionTx.feePayer = publicKey;
          txQueue.push(createPositionTx);
          signersQueue.push([newPositionMint]); // Position mint needs to sign
          positionMint = newPositionMint.publicKey;

          console.log(
            "🆕 Created new position:",
            newPositionMint.publicKey.toString().slice(0, 8)
          );
        } else {
          positionMint = currentPosition.positionMint;
          console.log(
            "♻️ Using existing position:",
            positionMint.toString().slice(0, 8)
          );
        }

        // Add liquidity to position
        const addLiquidityTx = new Transaction();

        // Convert user amounts to proper token decimals
        const tokenXDecimals =
          selectedPool.metadata.extra?.tokenBaseDecimal || 6;
        const tokenYDecimals =
          selectedPool.metadata.extra?.tokenQuoteDecimal || 9;

        const amountX = Number(
          new bigDecimal(Math.pow(10, tokenXDecimals))
            .multiply(new bigDecimal(xAmount))
            .getValue()
        );
        const amountY = Number(
          new bigDecimal(Math.pow(10, tokenYDecimals))
            .multiply(new bigDecimal(yAmount))
            .getValue()
        );

        const binArrayLower = await sarosDLMM.getBinArray({
          binArrayIndex: binArray.binArrayLowerIndex,
          pair,
          payer: publicKey,
        });
        const binArrayUpper = await sarosDLMM.getBinArray({
          binArrayIndex: binArray.binArrayUpperIndex,
          pair,
          payer: publicKey,
        });

        await sarosDLMM.addLiquidityIntoPosition({
          amountX,
          amountY,
          positionMint,
          liquidityDistribution,
          binArrayLower: new SolanaPublicKey(binArrayLower.toString()),
          binArrayUpper: new SolanaPublicKey(binArrayUpper.toString()),
          transaction: addLiquidityTx as any,
          payer: publicKey,
          pair,
        });

        addLiquidityTx.recentBlockhash = blockhash;
        addLiquidityTx.feePayer = publicKey;
        txQueue.push(addLiquidityTx);
        signersQueue.push([]); // No additional signers for liquidity tx

        console.log("💧 Added liquidity transaction for position");
      }

      console.log(`🚀 Transaction queue ready: ${txQueue.length} transactions`);

      // Execute transactions through wallet adapter
      if (txQueue.length === 0) {
        throw new Error("No transactions to execute");
      }

      console.log("📝 Executing transactions...");
      const executedSignatures: string[] = [];

      for (let i = 0; i < txQueue.length; i++) {
        const tx = txQueue[i];
        const signers = signersQueue[i];
        console.log(`📤 Sending transaction ${i + 1}/${txQueue.length}...`);

        if (!tx) {
          console.log(`Skipping undefined transaction at index ${i}`);
          continue;
        }

        try {
          // Get fresh blockhash for each transaction
          const { blockhash: freshBlockhash } = await connection.getLatestBlockhash("confirmed");
          tx.recentBlockhash = freshBlockhash;

          // Sign transaction - following ref/DLMM/add-liquidity.ts pattern
          if (tx.signatures.length === 0 || !tx.signatures[0].signature) {
            // If we have additional signers (keypairs), use sendTransaction with signers
            if (signers.length > 0) {
              console.log(`🔑 Signing with wallet + ${signers.length} keypair(s)`);
              const signature = await sendTransaction(tx, connection, {
                skipPreflight: false,
                preflightCommitment: "confirmed",
                signers,
              });
              executedSignatures.push(signature);
            } else {
              // No additional signers, just wallet signature
              const signature = await sendTransaction(tx, connection, {
                skipPreflight: false,
                preflightCommitment: "confirmed",
              });
              executedSignatures.push(signature);
            }
          }

          console.log(`✅ Transaction ${i + 1} sent:`, executedSignatures[executedSignatures.length - 1]);

          // Wait for confirmation
          const confirmation = await connection.confirmTransaction(
            executedSignatures[executedSignatures.length - 1],
            "confirmed"
          );

          if (confirmation.value.err) {
            throw confirmation.value.err;
          }

          console.log(`✅ Transaction ${i + 1} confirmed`);
        } catch (txError) {
          console.error(`❌ Transaction ${i + 1} failed:`, txError);
          throw new Error(
            `Transaction ${i + 1}/${txQueue.length} failed: ${
              txError instanceof Error ? txError.message : "Unknown error"
            }`
          );
        }
      }

      // All transactions successful
      alert(`🎉 DLMM Position Created Successfully!

Strategy: ${selectedTemplate.name}
Token X: ${xAmount} ${tokenX}
Token Y: ${yAmount} ${tokenY}
Bin Range: [${binRange[0]}, ${binRange[1]}]
Active Bin: ${activeBin}
Positions: ${maxPositionList.length}

✅ ${executedSignatures.length} transactions confirmed on-chain!

View on Solana Explorer:
${executedSignatures.map((sig, idx) => `${idx + 1}. ${sig.slice(0, 8)}...`).join("\n")}`);

      // Navigate to portfolio
      setStep("portfolio");
    } catch (error) {
      console.error("❌ DLMM position creation failed:", error);
      alert(`❌ Failed to create DLMM position: ${
        error instanceof Error ? error.message : "Unknown error"
      }

This might be due to:
• Network connectivity issues
• Insufficient token balances  
• DLMM service unavailable
• Invalid pool configuration`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Add Liquidity</h1>
          <p className="text-muted-foreground">
            Add liquidity to {getTokenPairSymbol()} pool using{" "}
            {selectedTemplate.name} strategy.
          </p>
        </div>
      </div>

      {/* Clean Token Input Interface */}
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Add Liquidity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First Token Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0"
                    value={tokenXAmount}
                    onChange={(e) => handleTokenXChange(e.target.value)}
                    className="border-0 text-2xl font-semibold bg-transparent p-0 focus:ring-0"
                  />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleTokenXChange(tokenXBalance)}
                    >
                      MAX
                    </Button>
                    <span className="font-semibold">{tokenX}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Balance: {tokenXBalance}
                  </div>
                </div>
              </div>
            </div>

            {/* Plus Sign */}
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground font-semibold">+</span>
              </div>
            </div>

            {/* Second Token Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0"
                    value={tokenYAmount}
                    onChange={(e) => handleTokenYChange(e.target.value)}
                    className="border-0 text-2xl font-semibold bg-transparent p-0 focus:ring-0"
                  />
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleTokenYChange(tokenYBalance)}
                    >
                      MAX
                    </Button>
                    <span className="font-semibold">{tokenY}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Balance: {tokenYBalance}
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Pool Share Info */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="text-sm font-medium">Price and Pool Share</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">{poolInfo.yPerX}</div>
                  <div className="font-medium">
                    {tokenX} Per {tokenY}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">{poolInfo.xPerY}</div>
                  <div className="font-medium">
                    {tokenY} Per {tokenX}
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-muted-foreground">
                  {poolInfo.poolShare}%
                </div>
                <div className="font-medium">Share of Pool</div>
              </div>
            </div>

            {/* Action Message */}
            <div className="text-center text-sm text-muted-foreground">
              {parseFloat(tokenXAmount) > 0 || parseFloat(tokenYAmount) > 0
                ? `Adding liquidity with ${selectedTemplate.name} strategy`
                : "Input an amount"}
            </div>

            {/* Add Liquidity Button */}
            <Button
              className="w-full"
              size="lg"
              disabled={
                !connected ||
                (parseFloat(tokenXAmount) === 0 &&
                  parseFloat(tokenYAmount) === 0) ||
                isDeploying
              }
              onClick={handleAddLiquidity}
            >
              {!connected
                ? "Connect Wallet"
                : isDeploying
                ? "Adding Liquidity..."
                : "Add Liquidity"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Token Swap Modal */}
      <TokenSwapModal
        isOpen={showTokenSwapModal}
        onClose={() => setShowTokenSwapModal(false)}
        requiredTokens={getRequiredTokens()}
        onSwapComplete={handleSwapComplete}
      />
    </div>
  );
}
