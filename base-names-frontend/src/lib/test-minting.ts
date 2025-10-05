import { createPublicClient, http, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS, ABIS, labelHash } from './contracts';

// Create a public client to test contract interactions
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://base-mainnet.infura.io/v3/9cf038d5acc346f481e94ec4550a888c')
});

export async function testMintingProcess(domainName: string, userAddress: string) {
  console.log('🧪 TESTING MINTING PROCESS FOR:', `${domainName}.base`);
  console.log('👤 User Address:', userAddress);
  console.log('⛽ Network: Base Mainnet (Chain ID: 8453)');

  try {
    // Step 1: Check domain availability
    console.log('\n📋 Step 1: Checking domain availability...');
    const tokenId = labelHash(domainName);
    console.log('🔢 TokenID:', tokenId.toString());

    const isAvailable = await publicClient.readContract({
      address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
      abi: ABIS.BaseRegistrar,
      functionName: 'available',
      args: [tokenId],
    });

    console.log('✅ Available:', isAvailable);

    if (!isAvailable) {
      console.log('❌ DOMAIN ALREADY REGISTERED');

      // Check current owner
      try {
        const owner = await publicClient.readContract({
          address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
          abi: ABIS.BaseRegistrar,
          functionName: 'ownerOf',
          args: [tokenId],
        });
        console.log('👤 Current Owner:', owner);
      } catch (e) {
        console.log('❌ Error checking owner:', e);
      }

      return {
        success: false,
        error: 'Domain already registered',
        available: false
      };
    }

    // Step 2: Get pricing
    console.log('\n💰 Step 2: Getting registration price...');
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

      console.log('💵 Base Price:', formatEther(basePrice), 'ETH');
      console.log('💎 Premium:', formatEther(premium), 'ETH');
      console.log('💰 Total Price:', formatEther(totalPrice), 'ETH');
      console.log('💸 USD Estimate:', `$${(parseFloat(formatEther(totalPrice)) * 2500).toFixed(2)}`);

      // Step 3: Simulate transaction parameters
      console.log('\n🔧 Step 3: Transaction parameters...');
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

      console.log('📝 Function: register()');
      console.log('📊 Parameters:', {
        name: registerParams.name,
        owner: registerParams.owner,
        duration: `${Number(duration)} seconds (1 year)`,
        resolver: registerParams.resolver,
        reverseRecord: registerParams.reverseRecord,
        value: `${formatEther(totalPrice)} ETH`
      });

      // Step 4: Check user balance
      console.log('\n💳 Step 4: Checking user balance...');
      const balance = await publicClient.getBalance({
        address: userAddress as `0x${string}`
      });

      console.log('💰 User Balance:', formatEther(balance), 'ETH');
      console.log('💸 Required:', formatEther(totalPrice), 'ETH');
      console.log('✅ Sufficient Funds:', balance >= totalPrice);

      if (balance < totalPrice) {
        return {
          success: false,
          error: 'Insufficient funds',
          required: formatEther(totalPrice),
          available: formatEther(balance)
        };
      }

      // Step 5: Estimate gas
      console.log('\n⛽ Step 5: Estimating gas...');
      try {
        const gasEstimate = await publicClient.estimateContractGas({
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

        console.log('⛽ Estimated Gas:', gasEstimate.toString());
        console.log('💨 Gas Price: ~0.00001 ETH (estimated)');

      } catch (gasError: any) {
        console.log('⚠️ Gas estimation failed:', gasError.message);
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

    } catch (pricingError: any) {
      console.log('❌ Error getting pricing:', pricingError.message);
      return {
        success: false,
        error: 'Failed to get pricing: ' + pricingError.message
      };
    }

  } catch (error: any) {
    console.log('❌ MINTING TEST FAILED:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test contract ownership and revenue flow
export async function analyzeRevenueFlow() {
  console.log('\n💰 REVENUE FLOW ANALYSIS');
  console.log('=======================');

  try {
    // Check who owns the BaseController contract
    console.log('\n🏢 Contract Ownership Analysis:');

    // BaseController is the main revenue recipient
    console.log('📋 BaseController:', CONTRACTS.BASE_MAINNET.contracts.BaseController);

    // Check if there's an owner function (many contracts have this)
    try {
      const owner = await publicClient.readContract({
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
      console.log('👤 Contract Owner:', owner);
    } catch {
      console.log('ℹ️ No standard owner() function found');
    }

    // Check contract balance
    const contractBalance = await publicClient.getBalance({
      address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`
    });

    console.log('💰 Contract Balance:', formatEther(contractBalance), 'ETH');

    return {
      contractAddress: CONTRACTS.BASE_MAINNET.contracts.BaseController,
      balance: formatEther(contractBalance),
    };

  } catch (error: any) {
    console.log('❌ Revenue analysis failed:', error.message);
    return { error: error.message };
  }
}