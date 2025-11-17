// Background service worker for Chrome extension
console.log('Keyword Harvest background service worker loaded')

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed')
})

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request)
  sendResponse({ success: true })
  return true
})
