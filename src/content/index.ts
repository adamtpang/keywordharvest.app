// Content script - Runs on web pages
console.log('Keyword Harvest content script loaded')

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractKeywords') {
    // TODO: Implement keyword extraction
    const results = extractKeywordsFromPage(request.keyword, request.options)
    sendResponse({ success: true, results })
  }
  return true
})

function extractKeywordsFromPage(keyword: string, options: any) {
  // Placeholder implementation
  return []
}

export {}
