# 🌾 Keyword Harvest - User Guide

Find and extract all keyword matches from any webpage instantly!

## Quick Start

1. **Open the extension**: Click the Keyword Harvest icon in your browser toolbar (or press `Ctrl+Shift+E`)
2. **Enter a keyword**: Type the word or phrase you want to find
3. **Click Extract**: See all matches with surrounding context
4. **Use the results**: Copy, export, or highlight matches

## Features

### Search Options
- **Case sensitive**: Toggle to match exact letter casing
- **Regex mode**: Use regular expressions for advanced pattern matching
- **Highlight on page**: Visually mark all matches on the webpage

### Actions
- **Copy All**: Copy all results to your clipboard
- **Export as TXT**: Download results as a text file
- **Export as JSON**: Download results as structured JSON data
- **Delete from Page**: Remove matched text from the webpage (use carefully!)

### Search History
Your last 5 searches are automatically saved. Click any previous search to run it again.

## Examples

### Basic Search
- Search for: `customer`
- Finds: "customer", "Customer", "CUSTOMER" (case-insensitive by default)

### Case-Sensitive Search
- Enable "Case sensitive"
- Search for: `API`
- Finds only: "API" (not "api" or "Api")

### Regex Search
- Enable "Regex mode"
- Search for: `\b\d{3}-\d{3}-\d{4}\b`
- Finds: Phone numbers like "555-123-4567"

## Tips

- **Large pages**: May take a few seconds to process all text
- **Export before deleting**: Always export results before using "Delete from Page"
- **Keyboard shortcut**: Press `Ctrl+Shift+E` (Mac: `Cmd+Shift+E`) to open quickly
- **Multiple windows**: Works on the currently active tab

## Known Limitations

- Google Docs has limited text extraction due to its complex structure
- Some dynamic content may not be captured immediately
- Delete function may not work on all page types

## Support

Found a bug or have a feature request? Please open an issue on GitHub.

## Privacy

- All processing happens locally in your browser
- No data is sent to external servers
- Search history is stored only on your device
