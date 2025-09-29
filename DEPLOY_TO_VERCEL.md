# 🚀 Deploy Base Names to basenameservice.xyz

## ✅ Prerequisites Completed
- [x] Smart contracts deployed to Base mainnet
- [x] Frontend configured for mainnet
- [x] Build tested successfully

## 📦 Mainnet Contract Addresses
```
ENSRegistry: 0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E
BaseRegistrar: 0xD158de26c787ABD1E0f2955C442fea9d4DC0a917
BaseController: 0xca7FD90f4C76FbCdbdBB3427804374b16058F55e
PublicResolver: 0x5D5bC53bDa5105561371FEf50B50E03aA94c962E
BasePriceOracle: 0xA1805458A1C1294D53eBBBd025B397F89Dd963AC
```

## 🌐 Deploy to Vercel (Recommended)

### Option 1: Via GitHub (Easiest)

1. **Push code to GitHub**:
```bash
git add .
git commit -m "🚀 Production ready for basenameservice.xyz"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select `base-names-frontend` as root directory

3. **Configure Build Settings**:
   - Framework Preset: `Next.js`
   - Root Directory: `base-names-frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   ```

5. **Add Custom Domain**:
   - Go to Project Settings → Domains
   - Add `basenameservice.xyz`
   - Add `www.basenameservice.xyz`
   - Update your domain's DNS:
     - A Record: `76.76.21.21`
     - CNAME (www): `cname.vercel-dns.com`

### Option 2: Via Vercel CLI

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Deploy**:
```bash
cd base-names-frontend
vercel --prod
```

3. **Add domain**:
```bash
vercel domains add basenameservice.xyz
```

## 🌍 Deploy to Netlify (Alternative)

1. **Build locally**:
```bash
cd base-names-frontend
npm run build
```

2. **Deploy via Netlify CLI**:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=.next
```

3. **Add custom domain in Netlify dashboard**

## 🔧 DNS Configuration

### For Vercel:
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### For Netlify:
```
Type    Name    Value
A       @       75.2.60.5
CNAME   www     [your-site].netlify.app
```

## ✨ Post-Deployment Checklist

- [ ] Verify domain resolves to your site
- [ ] Test wallet connection on mainnet
- [ ] Register a test domain
- [ ] Check all contract interactions
- [ ] Verify theme toggle works
- [ ] Test on mobile devices
- [ ] Monitor for any errors

## 🎉 Your Base Names Service is Now LIVE!

Visit: https://basenameservice.xyz

### Smart Contract Verification on BaseScan
To verify contracts (optional but recommended):
```bash
cd base-name-service-fork
npx hardhat verify --network base 0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E
# Repeat for each contract address
```

## 📊 Analytics & Monitoring

Consider adding:
- Google Analytics
- Vercel Analytics
- Error tracking (Sentry)

## 🆘 Troubleshooting

If domain doesn't work:
1. Check DNS propagation: https://dnschecker.org
2. Verify in Vercel/Netlify dashboard
3. Wait 24-48 hours for full propagation

## 📞 Support

- Vercel: https://vercel.com/support
- Base: https://base.org/discord
- Your deployment wallet: 0x5a66231663D22d7eEEe6e2A4781050076E8a3876