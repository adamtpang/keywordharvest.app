# 🌾 Keyword Harvest

A powerful Chrome extension that extracts all instances of keywords from webpages with context and highlighting capabilities.

## Features

- **Smart Keyword Extraction**: Find all instances of any keyword or phrase on a webpage
- **Context Display**: See each match with 50 characters of surrounding context
- **Visual Highlighting**: Toggle highlighting of matches directly on the page
- **Advanced Search Options**: 
  - Case-sensitive search toggle
  - Regular expression support for advanced users
- **Export Capabilities**: Export results as TXT or JSON files
- **Search History**: Keep track of your last 5 searches
- **Copy to Clipboard**: Quickly copy all results
- **Keyboard Shortcut**: Use Ctrl+Shift+E (Cmd+Shift+E on Mac) to open the extension

## Installation

### Option 1: Load as Unpacked Extension (Development)

1. Clone or download this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The Keyword Harvest extension should now appear in your extensions list

### Option 2: Create Icons (Optional)

The extension references icon files that you can create:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

You can create these icons or the extension will work without them.

## Usage

1. **Open the Extension**: Click the extension icon in your toolbar or use Ctrl+Shift+E
2. **Enter Keyword**: Type the word or phrase you want to search for
3. **Configure Options**: 
   - Toggle case-sensitive search if needed
   - Enable regex mode for advanced pattern matching
   - Turn on "Highlight on page" to visually mark matches
4. **Extract**: Click the "Extract" button or press Enter
5. **View Results**: See all matches with context and location information
6. **Export/Copy**: Use the action buttons to copy results or export them

## Advanced Features

### Regular Expression Support
Enable "Regex mode" to use powerful pattern matching:
- `\\b\\w{5}\\b` - Find all 5-letter words
- `\\d{3}-\\d{3}-\\d{4}` - Find phone numbers
- `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}` - Find email addresses

### Export Formats

**TXT Format**: Plain text with headers and separators
**JSON Format**: Structured data with all match details including:
- Match text
- Context
- Location information
- Position data

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: 
  - `activeTab` - Access current webpage content
  - `storage` - Save search history locally
- **Architecture**:
  - `popup.html/js/css` - Extension interface
  - `content.js` - Webpage text extraction and highlighting
  - `manifest.json` - Extension configuration

## Files Structure

```
keyword-harvest/
├── manifest.json       # Extension configuration
├── popup.html         # Main interface
├── popup.css          # Interface styling  
├── popup.js           # Interface logic
├── content.js         # Content extraction script
├── README.md          # This file
└── icons/             # Extension icons (optional)
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Development

The extension is built with modern JavaScript (ES6+) and includes:
- Comprehensive error handling
- Dynamic content support
- Clean, responsive UI design
- Efficient DOM traversal
- Memory-conscious highlighting system

## Browser Compatibility

- Chrome 88+ (Manifest V3 support required)
- Other Chromium-based browsers with Manifest V3 support

## Privacy

- No data is sent to external servers
- Search history is stored locally in browser storage
- Extension only accesses the active tab when explicitly used

## License

This project is open source and available under the MIT License.