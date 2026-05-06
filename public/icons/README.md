# App Icons

## Required Icons

You need to create these icon sizes for the PWA to work properly:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Quick Generation

**Option 1: Use Online Tool (Recommended)**
1. Go to: https://realfavicongenerator.net
2. Upload a 512x512 PNG of your logo
3. Download the generated package
4. Extract icons to this folder

**Option 2: Use ImageMagick (CLI)**
```bash
# Install ImageMagick
brew install imagemagick  # macOS
apt-get install imagemagick  # Linux

# Generate all sizes from source image
for size in 72 96 128 144 152 192 384 512; do
  convert your-logo.png -resize ${size}x${size} icon-${size}x${size}.png
done
```

**Option 3: Use Figma**
1. Create 512x512 artboard
2. Design your app icon
3. Export at 1x, 1.5x, 2x, etc. for different sizes
4. Rename to match the sizes above

## Design Guidelines

**iOS:**
- Use a solid background (no transparency)
- Add rounded corners (system will mask)
- Avoid text (too small)
- Use your brand colors

**Android:**
- Adaptive icons work best
- Consider "maskable" version (icon-512x512.png)
- Safe zone: 80% of canvas (for circular masks)

**Current Status:**
⚠️ Icons not yet created - PWA will use browser default until added

**For Testing:**
You can deploy without icons, but users will see a generic icon. For demos/presentations, definitely create these!
