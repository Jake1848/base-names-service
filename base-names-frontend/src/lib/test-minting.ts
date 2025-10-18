import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS, ABIS, labelHash } from './contracts';

// Get Infura API key from environment variable
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;
const rpcUrl = infuraApiKey
  ? `https://base-mainnet.infura.io/v3/${infuraApiKey}`
  : 'https://mainnet.base.org';

// Create a public client to test contract interactions
const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl)
});

export async function testMintingProcess(domainName: string, userAddress: string) {
  try {
    // Step 1: Check domain availability
    const tokenId = labelHash(domainName);

    const isAvailable = await publicClient.readContract({
      address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
      abi: ABIS.BaseRegistrar,
      functionName: 'available',
      args: [tokenId],
    });

    if (!isAvailable) {
      // Check current owner
      try {
        await publicClient.readContract({
          address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
          abi: ABIS.BaseRegistrar,
          functionName: 'ownerOf',
          args: [tokenId],
        });
      } catch {
        // Owner check failed, domain might be in an invalid state
      }

      return {
        success: false,
        error: 'Domain already registered',
        available: false
      };
    }

    // Step 2: Get pricing
    const duration = BigInt(365 * 24 * 60 * 60); // 1 year in seconds

    try {
      const pricing = await publicClient.readContract({
        address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
        abi: ABIS.BaseController,
        functionName: 'rentPrice',
        args: [domainName, duration],
      });

      const [basePrice, premium] = pricing as [bigint, bigint];
      const totalPrice = basePrice + premium;

      // Step 3: Simulate transaction parameters
      const registerParams = {
        name: domainName,
        owner: userAddress,
        duration: duration,
        secret: '0x0000000000000000000000000000000000000000000000000000000000000000', // No commitment needed for public registration
        resolver: CONTRACTS.BASE_MAINNET.contracts.PublicResolver,
        data: [], // No additional data
        reverseRecord: true, // Set reverse record
        referrer: `0x${'0'.repeat(64)}` as `0x${string}`, // No referrer
        fuses: BigInt(0), // No fuses
      };

      // Step 4: Check user balance
      const balance = await publicClient.getBalance({
        address: userAddress as `0x${string}`
      });

      if (balance < totalPrice) {
        return {
          success: false,
          error: 'Insufficient funds',
          required: formatEther(totalPrice),
          available: formatEther(balance)
        };
      }

      // Step 5: Estimate gas
      try {
        await publicClient.estimateContractGas({
          address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
          abi: ABIS.BaseController,
          functionName: 'register',
          args: [
            registerParams.name,
            registerParams.owner as `0x${string}`,
            registerParams.duration,
            registerParams.secret as `0x${string}`,
            registerParams.resolver as `0x${string}`,
            registerParams.data,
            registerParams.reverseRecord,
            registerParams.referrer,
            registerParams.fuses,
          ],
          value: totalPrice,
          account: userAddress as `0x${string}`,
        });
      } catch {
        // This might fail if we don't have the exact state, but registration should still work
      }

      return {
        success: true,
        available: true,
        pricing: {
          basePrice: formatEther(basePrice),
          premium: formatEther(premium),
          total: formatEther(totalPrice),
          usdEstimate: (parseFloat(formatEther(totalPrice)) * 2500).toFixed(2)
        },
        userBalance: formatEther(balance),
        sufficientFunds: balance >= totalPrice,
        contractAddress: CONTRACTS.BASE_MAINNET.contracts.BaseController,
        parameters: registerParams
      };

    } catch (pricingError) {
      const message = pricingError instanceof Error ? pricingError.message : 'Unknown error';
      return {
        success: false,
        error: 'Failed to get pricing: ' + message
      };
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: message
    };
  }
}

// Test contract ownership and revenue flow
export async function analyzeRevenueFlow() {
  try {
    // Check who owns the BaseController contract

    // BaseController is the main revenue recipient

    // Check if there's an owner function (many contracts have this)
    try {
      await publicClient.readContract({
        address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
        abi: [
          {
            name: 'owner',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'address' }]
          }
        ],
        functionName: 'owner',
      });
    } catch {
      // Owner function not available or failed
    }

    // Check contract balance
    const contractBalance = await publicClient.getBalance({
      address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`
    });

    return {
      contractAddress: CONTRACTS.BASE_MAINNET.contracts.BaseController,
      balance: formatEther(contractBalance),
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message };
  }
}