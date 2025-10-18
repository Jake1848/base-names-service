# Favicon Instructions

## Missing Favicon Sizes

The audit identified missing favicon sizes. To complete PWA support and better cross-platform compatibility, you need to create the following additional favicon sizes:

### Required Sizes:

1. **icon-192x192.png** (192x192 pixels)
   - Purpose: Android home screen icon, PWA icon
   - Location: `public/icon-192x192.png`
   - Format: PNG with transparency

2. **icon-512x512.png** (512x512 pixels)
   - Purpose: Android splash screen, high-resolution PWA icon
   - Location: `public/icon-512x512.png`
   - Format: PNG with transparency

3. **favicon-96x96.png** (96x96 pixels) - Optional but recommended
   - Purpose: PWA shortcuts, better browser support
   - Location: `public/favicon-96x96.png`
   - Format: PNG with transparency

### Design Guidelines:

- Use the Base Names Service logo/brand
- Maintain the Coinbase blue color scheme (#0052FF)
- Ensure the icon is recognizable at small sizes
- Include padding around the icon (safe area)
- Test visibility on both light and dark backgrounds

### Existing Favicons:

✅ **favicon-16x16.png** - Browser tab icon (small)
✅ **favicon-32x32.png** - Browser tab icon (standard)
✅ **apple-touch-icon.png** (180x180) - iOS home screen icon

### How to Create Missing Favicons:

#### Option 1: Using Design Software
1. Open your logo in Photoshop/Illustrator/Figma
2. Create a square canvas (192x192 or 512x512)
3. Center the logo with appropriate padding
4. Export as PNG with transparency
5. Place in `public/` directory

#### Option 2: Using Online Tools
1. Use a favicon generator like:
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/
   - https://favicon.io/
2. Upload your source logo
3. Generate all sizes
4. Download and extract to `public/`

#### Option 3: Using ImageMagick (Command Line)
```bash
# If you have a high-resolution source logo (logo.png)
convert logo.png -resize 192x192 -background none -gravity center -extent 192x192 public/icon-192x192.png
convert logo.png -resize 512x512 -background none -gravity center -extent 512x512 public/icon-512x512.png
convert logo.png -resize 96x96 -background none -gravity center -extent 96x96 public/favicon-96x96.png
```

### After Creating Favicons:

1. Verify all files are in the `public/` directory:
   ```
   public/
   ├── favicon-16x16.png
   ├── favicon-32x32.png
   ├── favicon-96x96.png (new)
   ├── icon-192x192.png (new)
   ├── icon-512x512.png (new)
   └── apple-touch-icon.png
   ```

2. The `manifest.json` has already been configured to reference these files

3. Test PWA installation:
   - Chrome: DevTools → Application → Manifest
   - Check that all icons load correctly
   - Test "Add to Home Screen" on mobile

### Optimization:

After creating the icons, optimize them for web:
```bash
# Using optipng
optipng -o7 public/*.png

# Using pngquant
pngquant --quality=65-80 public/*.png
```

### Reference Manifest Configuration:

The `manifest.json` already includes these icons:
```json
{
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Once you've created these files, your PWA icon support will be complete!
