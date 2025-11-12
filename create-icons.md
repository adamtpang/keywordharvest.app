# Creating Icons for Keyword Harvest

## Quick Setup (No Icons Required)
The extension will work perfectly without icons. Chrome will use default placeholder icons.

## Option 1: Use the SVG Template
Use the provided `icon.svg` file as a template and convert it to PNG files:

### Required Sizes:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

### Converting SVG to PNG:

**Using Inkscape:**
```bash
inkscape icon.svg --export-filename=icon16.png --export-width=16 --export-height=16
inkscape icon.svg --export-filename=icon48.png --export-width=48 --export-height=48
inkscape icon.svg --export-filename=icon128.png --export-width=128 --export-height=128
```

**Using ImageMagick:**
```bash
convert -density 300 -resize 16x16 icon.svg icon16.png
convert -density 300 -resize 48x48 icon.svg icon48.png
convert -density 300 -resize 128x128 icon.svg icon128.png
```

**Using Online Converter:**
1. Go to any SVG to PNG converter website
2. Upload `icon.svg`
3. Convert to the three required sizes
4. Save as `icon16.png`, `icon48.png`, and `icon128.png`

## Option 2: Create Custom Icons
Create your own 128x128 pixel icon with a harvest/search theme:
- Use wheat, magnifying glass, or text-related imagery
- Ensure good visibility at 16x16 pixels
- Use the brand colors: #6366f1 (primary) and #8b5cf6 (secondary)

## Option 3: Skip Icons Entirely
Simply remove the "icons" section from `manifest.json`:
```json
"icons": {
  "16": "icon16.png",
  "48": "icon48.png", 
  "128": "icon128.png"
}
```

The extension will work perfectly with Chrome's default extension icon.