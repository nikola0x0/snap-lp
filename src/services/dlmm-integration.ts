import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import {
  LiquidityBookServices,
  MODE,
  createUniformDistribution,
  LiquidityShape,
  findPosition,
  getBinRange,
  getMaxBinArray,
  getMaxPosition,
} from "@saros-finance/dlmm-sdk";
import bigDecimal from "js-big-decimal";

const RPC_ENDPOINT =
  "https://devnet.helius-rpc.com/?api-key=f831b443-8520-4f01-8228-59af9bb829b7";

// DLMM Pool Configuration
export interface DLMMPoolConfig {
  address: string;
  baseToken: {
    mintAddress: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  quoteToken: {
    mintAddress: string;
    symbol: string;
    name: string;
    decimals: number;
  };
}

// Strategy Parameters for DLMM
export interface DLMMStrategyParams {
  binRange: [number, number]; // e.g., [-5, 5]
  liquidityShape: LiquidityShape;
  amountX: number;
  amountY: number;
}

// Transaction Result
export interface DLMMTransactionResult {
  success: boolean;
  signatures: string[];
  positionMints?: string[];
  error?: string;
}

/**
 * DLMM Integration Service
 * Handles actual DLMM SDK operations for liquidity provision
 */
export class DLMMIntegrationService {
  private connection: Connection;
  private dlmm: LiquidityBookServices;

  constructor(connection?: Connection) {
    this.connection =
      connection ||
      new Connection(RPC_ENDPOINT, {
        commitment: "confirmed",
        wsEndpoint: undefined,
      });

    this.dlmm = new LiquidityBookServices({
      mode: MODE.DEVNET,
      options: {
        rpcUrl: RPC_ENDPOINT,
      },
    });
  }

  /**
   * Add liquidity to a DLMM pool using strategy parameters
   */
  async addLiquidity(
    poolConfig: DLMMPoolConfig,
    strategyParams: DLMMStrategyParams,
    wallet: any, // Wallet adapter wallet
    sendTransaction?: (transaction: any, connection: any) => Promise<string>,
  ): Promise<DLMMTransactionResult> {
    try {
      console.log("🚀 Starting DLMM liquidity addition...");
      console.log("Pool:", poolConfig.address);
      console.log("Strategy:", strategyParams);

      if (!wallet.publicKey) {
        throw new Error("Wallet not connected");
      }

      // Get latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash({
        commitment: "confirmed",
      });

      const pair = new PublicKey(poolConfig.address);
      const pairInfo = await this.dlmm.getPairAccount(pair);

      if (!pairInfo) {
        throw new Error("Pool pair account not found");
      }

      const binRange = strategyParams.binRange;
      const txQueue: Transaction[] = [];
      const activeBin = pairInfo.activeId;
      const binArrayList = getMaxBinArray(binRange, activeBin);

      // Initialize bin arrays and vault info
      const binsAndVaultsTx = new Transaction();

      await Promise.all([
        ...binArrayList.map(async (bin) => {
          await this.dlmm.getBinArray({
            binArrayIndex: bin.binArrayLowerIndex,
            pair,
            payer: wallet.publicKey,
            transaction: binsAndVaultsTx as any,
          });
          await this.dlmm.getBinArray({
            binArrayIndex: bin.binArrayUpperIndex,
            pair,
            payer: wallet.publicKey,
            transaction: binsAndVaultsTx as any,
          });
        }),
        ...[poolConfig.baseToken, poolConfig.quoteToken].map(async (token) => {
          await this.dlmm.getPairVaultInfo({
            pair,
            payer: wallet.publicKey,
            transaction: binsAndVaultsTx as any,
            tokenAddress: new PublicKey(token.mintAddress),
          });
          await this.dlmm.getUserVaultInfo({
            payer: wallet.publicKey,
            transaction: binsAndVaultsTx as any,
            tokenAddress: new PublicKey(token.mintAddress),
          });
        }),
      ]);

      if (binsAndVaultsTx.instructions.length > 0) {
        binsAndVaultsTx.recentBlockhash = blockhash;
        binsAndVaultsTx.feePayer = wallet.publicKey;
        txQueue.push(binsAndVaultsTx);
      }

      // Get positions and liquidity distribution
      const maxPositionList = getMaxPosition(binRange, activeBin);
      const userPositions = await this.dlmm.getUserPositions({
        payer: wallet.publicKey,
        pair,
      });
      const maxLiquidityDistribution = createUniformDistribution({
        shape: strategyParams.liquidityShape,
        binRange,
      });

      const positionMints: string[] = [];

      // Create positions and add liquidity
      const maxLiquidityDistributions = await Promise.all(
        maxPositionList.map(async (position) => {
          const { range, binLower, binUpper } = getBinRange(
            position,
            activeBin,
          );
          const currentPosition = userPositions.find(
            findPosition(position, activeBin),
          );

          const startIndex =
            maxLiquidityDistribution.findIndex(
              (item) => item.relativeBinId === range[0],
            ) ?? 0;
          const endIndex =
            (maxLiquidityDistribution.findIndex(
              (item) => item.relativeBinId === range[1],
            ) ?? maxLiquidityDistribution.length - 1) + 1;

          const liquidityDistribution = maxLiquidityDistribution.slice(
            startIndex,
            endIndex,
          );

          const binArray = binArrayList.find(
            (item) =>
              item.binArrayLowerIndex * 256 <= binLower &&
              (item.binArrayUpperIndex + 1) * 256 > binUpper,
          )!;

          const binArrayLower = await this.dlmm.getBinArray({
            binArrayIndex: binArray.binArrayLowerIndex,
            pair: new PublicKey(pair),
            payer: wallet.publicKey,
          });
          const binArrayUpper = await this.dlmm.getBinArray({
            binArrayIndex: binArray.binArrayUpperIndex,
            pair: new PublicKey(pair),
            payer: wallet.publicKey,
          });

          let positionMint: PublicKey;

          if (!currentPosition) {
            const createPositionTx = new Transaction();
            const newPositionMint = Keypair.generate();

            await this.dlmm.createPosition({
              pair: new PublicKey(pair),
              payer: wallet.publicKey,
              relativeBinIdLeft: range[0]!,
              relativeBinIdRight: range[1]!,
              binArrayIndex: binArray.binArrayLowerIndex,
              positionMint: newPositionMint.publicKey,
              transaction: createPositionTx as any,
            });

            createPositionTx.recentBlockhash = blockhash;
            createPositionTx.feePayer = wallet.publicKey;
            createPositionTx.sign(wallet, newPositionMint);
            txQueue.push(createPositionTx);
            positionMint = newPositionMint.publicKey;
            positionMints.push(positionMint.toString());
          } else {
            positionMint = currentPosition.positionMint;
            positionMints.push(positionMint.toString());
          }

          return {
            positionMint,
            position,
            liquidityDistribution,
            binArrayLower: binArrayLower.toString(),
            binArrayUpper: binArrayUpper.toString(),
          };
        }),
      );

      // Add liquidity to positions
      await Promise.all(
        maxLiquidityDistributions.map(async (maxLiquidityDistribution) => {
          const {
            positionMint,
            liquidityDistribution,
            binArrayLower,
            binArrayUpper,
          } = maxLiquidityDistribution;

          const addLiquidityTx = new Transaction();

          // Convert amounts with proper decimals
          const amountX = Number(
            new bigDecimal(Math.pow(10, poolConfig.baseToken.decimals))
              .multiply(new bigDecimal(strategyParams.amountX))
              .getValue(),
          );
          const amountY = Number(
            new bigDecimal(Math.pow(10, poolConfig.quoteToken.decimals))
              .multiply(new bigDecimal(strategyParams.amountY))
              .getValue(),
          );

          await this.dlmm.addLiquidityIntoPosition({
            amountX,
            amountY,
            positionMint,
            liquidityDistribution,
            binArrayLower: new PublicKey(binArrayLower),
            binArrayUpper: new PublicKey(binArrayUpper),
            transaction: addLiquidityTx as any,
            payer: wallet.publicKey,
            pair,
          });

          addLiquidityTx.recentBlockhash = blockhash;
          addLiquidityTx.feePayer = wallet.publicKey;
          txQueue.push(addLiquidityTx);
        }),
      );

      // Execute transactions
      const signatures: string[] = [];

      if (sendTransaction) {
        // Use browser wallet adapter
        for (let i = 0; i < txQueue.length; i++) {
          const tx = txQueue[i];
          if (!tx) {
            console.log(`Skipping undefined transaction at index ${i}`);
            continue;
          }

          try {
            console.log(
              `📝 Sending transaction ${i + 1}/${txQueue.length} through wallet...`,
            );

            // Send through wallet adapter (will prompt user for signature)
            const signature = await sendTransaction(tx, this.connection);

            console.log(`📄 Transaction sent: ${signature.slice(0, 8)}...`);
            console.log(`⏳ Confirming transaction...`);

            const confirmation = await this.connection.confirmTransaction({
              signature,
              blockhash: tx.recentBlockhash!,
              lastValidBlockHeight: (await this.connection.getLatestBlockhash())
                .lastValidBlockHeight,
            });

            if (confirmation.value.err) {
              throw new Error(
                `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
              );
            }

            signatures.push(signature);
            console.log(
              `✅ Transaction ${i + 1} confirmed: ${signature.slice(0, 8)}...`,
            );
          } catch (error) {
            console.error(`❌ Transaction ${i + 1} failed:`, error);
            throw error;
          }
        }
      } else {
        // Fallback: Direct signing (for CLI usage or testing)
        console.log("🔧 Using direct signing mode...");
        for (let i = 0; i < txQueue.length; i++) {
          const tx = txQueue[i];
          if (!tx) {
            console.log(`Skipping undefined transaction at index ${i}`);
            continue;
          }

          try {
            console.log(
              `📝 Executing transaction ${i + 1}/${txQueue.length}...`,
            );

            // Direct signing - requires wallet to have sign method
            if (wallet.signTransaction) {
              await wallet.signTransaction(tx);
            } else {
              throw new Error("Wallet does not support transaction signing");
            }

            const signature = await this.connection.sendRawTransaction(
              tx.serialize(),
              {
                skipPreflight: false,
                preflightCommitment: "confirmed",
              },
            );

            const confirmation = await this.connection.confirmTransaction({
              signature,
              blockhash: tx.recentBlockhash!,
              lastValidBlockHeight: (await this.connection.getLatestBlockhash())
                .lastValidBlockHeight,
            });

            if (confirmation.value.err) throw confirmation.value.err;

            signatures.push(signature);
            console.log(
              `✅ Transaction ${i + 1} confirmed: ${signature.slice(0, 8)}...`,
            );
          } catch (error) {
            console.error(`❌ Transaction ${i + 1} failed:`, error);
            throw error;
          }
        }
      }

      console.log(`🎉 Successfully added liquidity to DLMM pool!`);
      console.log(`📋 Position mints:`, positionMints);
      console.log(`📄 Transaction signatures:`, signatures);

      return {
        success: true,
        signatures,
        positionMints,
      };
    } catch (error) {
      console.error("❌ DLMM liquidity addition failed:", error);
      return {
        success: false,
        signatures: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get strategy template configurations
   */
  getStrategyTemplates(): Record<string, DLMMStrategyParams> {
    return {
      conservative: {
        binRange: [-2, 2],
        liquidityShape: LiquidityShape.Spot,
        amountX: 0.1,
        amountY: 0.1,
      },
      balanced: {
        binRange: [-5, 5],
        liquidityShape: LiquidityShape.Spot,
        amountX: 0.1,
        amountY: 0.1,
      },
      aggressive: {
        binRange: [-10, 10],
        liquidityShape: LiquidityShape.Curve,
        amountX: 0.1,
        amountY: 0.1,
      },
    };
  }

  /**
   * Test connection and SDK functionality
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Test with the known PYUSD/WSOL pool
      const testPoolAddress = "H9EPqQKCvv9ddzK6KHjo8vvUPMLMJXmMmru9KUYNaDFQ";
      const pairAccount = await this.dlmm.getPairAccount(
        new PublicKey(testPoolAddress),
      );

      return {
        success: true,
        message: `DLMM service connected. Test pool active ID: ${pairAccount?.activeId || "N/A"}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

// Export singleton instance
export const dlmmIntegration = new DLMMIntegrationService();
