# Frontend Cleanup & Update Plan

## 🎯 Objectives
1. Update all pages with V2 contract addresses
2. Clean up unused code and components
3. Ensure all features work with new infrastructure
4. Improve code consistency and quality
5. Remove any hardcoded old addresses

---

## 📋 Pages to Review & Update

### 1. Dashboard Page (207 lines) ✅
**Current Status**: Uses useDomainOwnership hook and CONTRACTS
**Updates Needed**:
- ✅ Already using CONTRACTS from lib - should work with V2
- Review domain fetching logic
- Ensure tokenURI calls work with new metadata
- Test NFT display integration
- Add V2-specific features (metadata preview?)

### 2. DeFi Page (360 lines)
**Current Status**: Unknown
**Updates Needed**:
- Review for contract address usage
- Update any staking/reward contracts
- Ensure compatibility with V2 registrar
- Check for hardcoded addresses

### 3. Bridge Page (340 lines)
**Current Status**: Unknown
**Updates Needed**:
- Review bridging logic
- Update contract interfaces
- Ensure cross-chain compatibility maintained
- Test bridge functionality

### 4. Marketplace Page (708 lines) 🔴 LARGEST
**Current Status**: Unknown
**Priority**: HIGH (most complex)
**Updates Needed**:
- Update to use V2 registrar for domain listings
- Ensure NFT metadata displays correctly
- Update buy/sell logic for ERC-721 compatibility
- Test marketplace contract integration
- Verify pricing and fees

### 5. Auctions Page (507 lines)
**Current Status**: Unknown
**Updates Needed**:
- Update auction contract addresses
- Ensure bidding works with V2 NFTs
- Test auction finalization
- Verify NFT transfer logic

### 6. Enterprise Page (488 lines)
**Current Status**: Unknown
**Updates Needed**:
- Review bulk registration features
- Update contract interfaces
- Ensure enterprise pricing works
- Test batch operations

### 7. Analytics Page (592 lines)
**Current Status**: Unknown
**Priority**: MEDIUM
**Updates Needed**:
- Update data fetching for V2 contracts
- Add V2-specific metrics
- Ensure graphs/charts work
- Test real-time data updates

---

## 🔍 Key Areas to Check

### Contract Address Updates
- [ ] Search all files for old contract addresses
- [ ] Replace with CONTRACTS import from lib
- [ ] Remove any hardcoded addresses
- [ ] Verify chainId-based selection works

### Hook Updates
- [ ] Review useDomainOwnership hook
- [ ] Check any marketplace hooks
- [ ] Update staking hooks if applicable
- [ ] Ensure all hooks use V2 contracts

### Component Updates
- [ ] NFT display components (should show metadata)
- [ ] Domain card components
- [ ] Search components
- [ ] Transaction confirmation modals

### Feature Compatibility
- [ ] Registration flow (already tested ✅)
- [ ] Domain management
- [ ] Marketplace listing/buying
- [ ] Auctions
- [ ] Staking/DeFi features
- [ ] Analytics data fetching

---

## 🛠️ Cleanup Tasks

### Code Quality
- [ ] Remove commented-out code
- [ ] Remove unused imports
- [ ] Fix TypeScript warnings
- [ ] Standardize error handling
- [ ] Add proper loading states

### Performance
- [ ] Optimize re-renders
- [ ] Lazy load heavy components
- [ ] Optimize image loading
- [ ] Cache contract calls where appropriate

### User Experience
- [ ] Consistent loading states
- [ ] Better error messages
- [ ] Toast notifications for actions
- [ ] Responsive design check
- [ ] Dark mode consistency

---

## 📝 Implementation Plan

### Phase 1: Assessment (Today)
1. ✅ Read through each page file
2. ✅ Identify all contract interactions
3. ✅ List required updates
4. ✅ Prioritize by impact

### Phase 2: Core Updates (Session 1)
1. [ ] Update Dashboard page
   - Verify domain fetching
   - Test NFT metadata display
   - Add V2 features

2. [ ] Update DeFi page
   - Review staking logic
   - Update contract addresses
   - Test functionality

3. [ ] Update Bridge page
   - Review bridge contracts
   - Test cross-chain features
   - Update interfaces

### Phase 3: Marketplace & Auctions (Session 2)
1. [ ] Update Marketplace page (PRIORITY)
   - V2 registrar integration
   - NFT metadata in listings
   - Buy/sell with new contracts
   - Test end-to-end

2. [ ] Update Auctions page
   - Auction contract updates
   - Bidding with V2 NFTs
   - Test complete auction flow

### Phase 4: Enterprise & Analytics (Session 3)
1. [ ] Update Enterprise page
   - Bulk operations with V2
   - Enterprise pricing
   - Test batch features

2. [ ] Update Analytics page
   - V2 metrics
   - Real-time data
   - Charts and graphs

### Phase 5: Testing & Polish (Session 4)
1. [ ] End-to-end testing
2. [ ] Cross-browser testing
3. [ ] Mobile responsiveness
4. [ ] Performance optimization
5. [ ] Final cleanup

---

## 🔧 Technical Checklist

### Contract Integration
```typescript
// OLD - Hardcoded addresses (remove these)
const OLD_REGISTRAR = "0x69b81319958388b5133DF617Ba542FB6c9e03177";

// NEW - Use CONTRACTS from lib (do this everywhere)
import { CONTRACTS, getContractsForChain } from '@/lib/contracts';
const contracts = getContractsForChain(chainId);
```

### Hook Pattern
```typescript
// Ensure all hooks follow this pattern
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';

export function useSomething() {
  const { chainId } = useAccount();
  const contracts = CONTRACTS[chainId === 8453 ? 'BASE_MAINNET' : 'BASE_SEPOLIA'];
  
  // Use contracts.BaseRegistrar, contracts.BaseController, etc.
}
```

### Error Handling
```typescript
// Consistent error handling pattern
try {
  // operation
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('Failed: ' + error.message);
}
```

---

## 📊 Success Criteria

### Functionality
- ✅ All pages load without errors
- ✅ All contract calls use V2 addresses
- ✅ Registration works (already verified)
- ✅ Dashboard shows domains correctly
- ✅ Marketplace can list/buy domains
- ✅ Auctions work end-to-end
- ✅ DeFi features functional
- ✅ Analytics display correctly
- ✅ NFT metadata displays beautifully everywhere

### Code Quality
- ✅ No TypeScript errors
- ✅ No console warnings
- ✅ Consistent code style
- ✅ Proper error handling
- ✅ Good loading states

### User Experience
- ✅ Fast page loads
- ✅ Responsive on all devices
- ✅ Clear error messages
- ✅ Smooth transitions
- ✅ Professional appearance

---

## 🚨 Known Issues to Address

### From Previous Work
1. ✅ Contract addresses updated in lib/contracts.ts
2. ✅ SDK updated with V2 addresses
3. ✅ Registration flow tested and working

### To Investigate
1. [ ] Do marketplace contracts need updates?
2. [ ] Do auction contracts work with V2 NFTs?
3. [ ] Do staking contracts need changes?
4. [ ] Are analytics pulling from correct sources?

---

## 📚 Documentation Needs

### User-Facing
- [ ] How to register domains
- [ ] How to manage domains
- [ ] How to list on marketplace
- [ ] How to participate in auctions
- [ ] How to use DeFi features

### Developer-Facing
- [ ] Contract integration guide
- [ ] Hook usage examples
- [ ] Component library
- [ ] Testing procedures

---

## 🎯 Next Steps

1. **Start with Dashboard** - Verify it works perfectly with V2
2. **Move to Marketplace** - Most critical for user value
3. **Update Auctions** - Important secondary feature
4. **Clean up DeFi/Bridge/Enterprise** - Ensure compatibility
5. **Polish Analytics** - Make sure data is accurate
6. **Final testing** - Everything working together

---

## 💡 Improvement Opportunities

### While We're Cleaning Up
1. Add NFT metadata preview on hover
2. Show domain expiration warnings
3. Add bulk actions in dashboard
4. Improve search functionality
5. Add domain history/activity log
6. Social sharing features
7. Domain portfolio value tracking
8. Notification system for expirations

---

**Status**: 📋 PLANNING PHASE
**Next Session**: Start with Dashboard cleanup and verification
**Goal**: Production-ready frontend matching V2 backend quality

