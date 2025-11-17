class KeywordExtractor {
  constructor() {
    this.highlightClass = 'keyword-harvest-highlight';
    this.highlightStyle = null;
    this.currentHighlights = [];
    this.observer = null;
    
    this.injectStyles();
    this.startObservingChanges();
    this.setupMessageListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      try {
        if (request.action === 'extractKeywords') {
          this.handleExtractKeywords(request, sendResponse);
          return true; // Keep message channel open for async response
        } else if (request.action === 'toggleHighlight') {
          this.handleToggleHighlight(request, sendResponse);
        } else if (request.action === 'deleteMatches') {
          this.handleDeleteMatches(request, sendResponse);
          return true; // Keep message channel open for async response
        }
      } catch (error) {
        console.error('Error in message listener:', error);
        sendResponse({ success: false, error: error.message });
      }
    });
  }

  async handleExtractKeywords(request, sendResponse) {
    try {
      const { keyword, options } = request;
      
      if (!keyword || keyword.trim() === '') {
        throw new Error('Please enter a keyword to search for');
      }
      
      
      // Clear existing highlights
      this.clearHighlights();
      
      // Extract keywords with error handling
      let results = [];
      try {
        results = this.extractKeywords(keyword, options);
      } catch (extractError) {
        console.error('Error in extractKeywords:', extractError);
        throw new Error(`Search failed: ${extractError.message}`);
      }
      
      
      // Apply highlights if requested
      if (options.highlight && results.length > 0) {
        try {
          this.highlightMatches(keyword, options);
        } catch (highlightError) {
          console.warn('Highlighting failed:', highlightError);
          // Don't fail the entire operation if highlighting fails
        }
      }
      
      sendResponse({
        success: true,
        results: results
      });
    } catch (error) {
      console.error('Error extracting keywords:', error);
      sendResponse({
        success: false,
        error: error.message || 'An unknown error occurred'
      });
    }
  }

  handleToggleHighlight(request, sendResponse) {
    if (request.enabled) {
      // Highlights should already be applied
    } else {
      this.clearHighlights();
    }
    sendResponse({ success: true });
  }

  async handleDeleteMatches(request, sendResponse) {
    try {
      const { keyword, options } = request;
      
      if (!keyword || keyword.trim() === '') {
        throw new Error('Please enter a keyword to delete');
      }
      
      
      let deletedCount = 0;
      
      if (this.isGoogleDocs()) {
        deletedCount = await this.deleteMatchesInGoogleDocs(keyword, options);
      } else {
        deletedCount = await this.deleteMatchesInRegularPage(keyword, options);
      }
      
      
      sendResponse({
        success: true,
        deletedCount: deletedCount
      });
    } catch (error) {
      console.error('Error deleting matches:', error);
      sendResponse({
        success: false,
        error: error.message || 'Failed to delete matches'
      });
    }
  }

  async deleteMatchesInGoogleDocs(keyword, options) {
    
    // For Google Docs, we'll use the Find and Replace functionality
    // This is tricky as Google Docs has complex keyboard shortcuts
    let deletedCount = 0;
    
    try {
      // Try to use Ctrl+H (Find and Replace)
      const event = new KeyboardEvent('keydown', {
        key: 'h',
        code: 'KeyH',
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      
      document.activeElement.dispatchEvent(event);
      
      // Wait a bit for the dialog to open
      await this.sleep(500);
      
      // Alternative approach: try to select all and replace using execCommand
      const allText = this.getGoogleDocsText();
      const { caseSensitive, regexMode } = options;
      
      let searchPattern;
      let flags = 'g';
      if (!caseSensitive) flags += 'i';
      
      if (regexMode) {
        searchPattern = new RegExp(keyword, flags);
      } else {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escapedKeyword, flags);
      }
      
      const matches = allText.match(searchPattern);
      deletedCount = matches ? matches.length : 0;
      
      // Show a message to user about how to manually delete
      if (deletedCount > 0) {
        const message = `Found ${deletedCount} matches. To delete them:\n\n1. Press Ctrl+H (Find & Replace)\n2. Search for: "${keyword}"\n3. Replace with: (leave empty)\n4. Click "Replace all"\n\nOr use Ctrl+F to find each instance and delete manually.`;
        alert(message);
      }
      
    } catch (error) {
      console.error('Google Docs deletion failed:', error);
      throw new Error('Google Docs text deletion requires manual Find & Replace (Ctrl+H)');
    }
    
    return deletedCount;
  }

  async deleteMatchesInRegularPage(keyword, options) {
    
    const { caseSensitive, regexMode } = options;
    let deletedCount = 0;
    
    let searchPattern;
    let flags = 'g';
    if (!caseSensitive) flags += 'i';
    
    try {
      if (regexMode) {
        searchPattern = new RegExp(keyword, flags);
      } else {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escapedKeyword, flags);
      }
    } catch (error) {
      throw new Error('Invalid regular expression: ' + error.message);
    }

    // Get all text nodes
    const textNodes = this.getAllTextNodes(document.body);
    
    textNodes.forEach(node => {
      const originalText = node.textContent;
      const newText = originalText.replace(searchPattern, (match) => {
        deletedCount++;
        return ''; // Replace with empty string to delete
      });
      
      if (originalText !== newText) {
        node.textContent = newText;
      }
    });
    
    return deletedCount;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  extractKeywords(keyword, options) {
    
    const results = [];
    const { caseSensitive, regexMode } = options;
    
    let searchPattern;
    let flags = 'g';
    
    if (!caseSensitive) {
      flags += 'i';
    }
    
    try {
      if (regexMode) {
        searchPattern = new RegExp(keyword, flags);
      } else {
        // Escape special regex characters for literal search
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escapedKeyword, flags);
      }
    } catch (error) {
      throw new Error('Invalid regular expression: ' + error.message);
    }

    // Try two approaches: individual text nodes and combined text
    const results1 = this.searchInTextNodes(keyword, searchPattern, options);
    const results2 = this.searchInCombinedText(keyword, searchPattern, options);
    
    // Combine results and remove duplicates based on position
    const allResults = [...results1, ...results2];
    const uniqueResults = this.removeDuplicateMatches(allResults);
    
    console.log(`Found ${uniqueResults.length} total matches (${results1.length} from nodes, ${results2.length} from combined text)`);
    return uniqueResults;
  }

  searchInTextNodes(keyword, searchPattern, options) {
    const results = [];
    const textNodes = this.getAllTextNodes(document.body);
    
    textNodes.forEach((node, nodeIndex) => {
      const text = node.textContent;
      let match;
      
      searchPattern.lastIndex = 0;
      
      while ((match = searchPattern.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        const contextStart = Math.max(0, matchStart - 50);
        const contextEnd = Math.min(text.length, matchEnd + 50);
        
        let context = text.substring(contextStart, contextEnd);
        
        if (contextStart > 0) context = '...' + context;
        if (contextEnd < text.length) context = context + '...';
        
        const location = this.getElementLocation(node);
        
        results.push({
          match: match[0],
          context: context,
          location: location,
          position: {
            type: 'node',
            node: nodeIndex,
            start: matchStart,
            end: matchEnd
          }
        });
        
        if (match[0].length === 0) {
          searchPattern.lastIndex++;
        }
      }
    });
    
    return results;
  }

  searchInCombinedText(keyword, searchPattern, options) {
    const results = [];
    
    // Get all visible text content from the page
    const visibleText = this.getVisibleTextContent();
    console.log(`Searching in combined text (${visibleText.length} characters)`);
    
    let match;
    searchPattern.lastIndex = 0;
    
    while ((match = searchPattern.exec(visibleText)) !== null) {
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;
      const contextStart = Math.max(0, matchStart - 50);
      const contextEnd = Math.min(visibleText.length, matchEnd + 50);
      
      let context = visibleText.substring(contextStart, contextEnd);
      
      if (contextStart > 0) context = '...' + context;
      if (contextEnd < visibleText.length) context = context + '...';
      
      results.push({
        match: match[0],
        context: context,
        location: 'Combined page text',
        position: {
          type: 'combined',
          start: matchStart,
          end: matchEnd
        }
      });
      
      if (match[0].length === 0) {
        searchPattern.lastIndex++;
      }
    }
    
    return results;
  }

  getVisibleTextContent() {
    // Special handling for Google Docs
    if (this.isGoogleDocs()) {
      return this.getGoogleDocsText();
    }
    
    // Try multiple approaches to get all text
    let allText = '';
    
    // Method 1: Try common content selectors
    const selectors = [
      'main', 'article', '[role="main"]', '.content', '#content',
      '.post', '.entry', '.article', '.document', '[data-docs-text-content]'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => {
          if (this.isElementVisible(el)) {
            const text = el.innerText || el.textContent;
            if (text && text.length > allText.length) {
              allText = text;
            }
          }
        });
      }
    }
    
    // Method 2: If still short, try body text
    if (allText.length < 1000) {
      const bodyText = document.body.innerText || document.body.textContent || '';
      if (bodyText.length > allText.length) {
        allText = bodyText;
      }
    }
    
    // Method 3: Last resort - concatenate all visible text elements
    if (allText.length < 1000) {
      const allElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6, li, td, th');
      let concatenatedText = '';
      allElements.forEach(el => {
        if (this.isElementVisible(el) && el.innerText) {
          concatenatedText += ' ' + el.innerText;
        }
      });
      if (concatenatedText.length > allText.length) {
        allText = concatenatedText;
      }
    }
    
    return allText;
  }

  isGoogleDocs() {
    try {
      return (window.location && window.location.hostname && window.location.hostname.includes('docs.google.com')) ||
             document.querySelector('.kix-canvas-tile-content') !== null ||
             document.querySelector('[data-docs-text-content]') !== null ||
             document.querySelector('.kix-canvas') !== null ||
             document.title.includes('Google Docs');
    } catch (error) {
      console.error('Error checking if Google Docs:', error);
      return false;
    }
  }

  getGoogleDocsText() {
    
    let allText = '';
    let bestMethod = 'none';
    
    // Method 1: Try different Google Docs selectors
    const googleDocsSelectors = [
      '.kix-canvas-tile-content',
      '.kix-canvas-tile-selection',  
      '.kix-page-content-wrapper',
      '.kix-page-column',
      '.kix-canvas',
      '.kix-document-ui',
      '[data-docs-text-content]',
      '.kix-line-contenteditable'
    ];
    
    for (const selector of googleDocsSelectors) {
      const elements = document.querySelectorAll(selector);
      let methodText = '';
      
      elements.forEach(el => {
        const text = el.innerText || el.textContent;
        if (text && text.trim()) {
          methodText += ' ' + text;
        }
      });
      
      if (methodText.length > allText.length) {
        allText = methodText;
        bestMethod = selector;
      }
    }
    
    // Method 2: Try to get text from all visible elements
    if (allText.length < 1000) {
      console.log('Trying comprehensive element extraction');
      const allElements = document.querySelectorAll('span, div, p');
      let comprehensiveText = '';
      
      allElements.forEach(el => {
        if (this.isElementVisible(el) && el.innerText && el.innerText.trim()) {
          comprehensiveText += ' ' + el.innerText;
        }
      });
      
      if (comprehensiveText.length > allText.length) {
        allText = comprehensiveText;
        bestMethod = 'comprehensive';
      }
    }
    
    // Method 3: Selection-based extraction (Ctrl+A equivalent)
    if (allText.length < 1000) {
      const selectionText = this.getTextViaSelection();
      if (selectionText.length > allText.length) {
        allText = selectionText;
        bestMethod = 'selection';
      }
    }
    
    // Method 4: Try to get from document body as fallback
    if (allText.length < 500) {
      const bodyText = document.body.innerText || document.body.textContent || '';
      if (bodyText.length > allText.length) {
        allText = bodyText;
        bestMethod = 'body';
      }
    }
    
    // Method 5: Try accessing Google Docs internal APIs (experimental)
    if (allText.length < 1000) {
      try {
        const docsText = this.tryGoogleDocsInternalAPI();
        if (docsText && docsText.length > allText.length) {
          allText = docsText;
          bestMethod = 'internal';
        }
      } catch (error) {
      }
    }
    
    
    // Debug: show first 200 chars to verify content
    
    return allText;
  }

  tryGoogleDocsInternalAPI() {
    // Try to access Google Docs internal data structures
    try {
      // Look for common Google Apps script variables
      const possibleDataSources = [
        'window.initialData',
        'window._docs_flag_initialData', 
        'window.DOCS_modelChunk',
        'window._docs_annotations_sugg_v2'
      ];
      
      for (const source of possibleDataSources) {
        try {
          const data = eval(source);
          if (data && typeof data === 'object') {
            // Try to extract text from the data structure
            const text = JSON.stringify(data);
            if (text.length > 1000) {
              return text;
            }
          }
        } catch (e) {
          // Ignore individual failures
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  getTextViaSelection() {
    try {
      // Save current selection
      const currentSelection = window.getSelection().rangeCount > 0 ? 
        window.getSelection().getRangeAt(0) : null;
      
      // Select all text
      const selection = window.getSelection();
      selection.selectAllChildren(document.body);
      
      // Get selected text
      const allText = selection.toString();
      
      // Restore original selection
      selection.removeAllRanges();
      if (currentSelection) {
        selection.addRange(currentSelection);
      }
      
      return allText;
    } catch (error) {
      console.error('Selection-based extraction failed:', error);
      return document.body.innerText || document.body.textContent || '';
    }
  }

  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetParent !== null;
  }

  removeDuplicateMatches(matches) {
    const seen = new Set();
    return matches.filter(match => {
      // Create a unique key based on the match text and approximate position
      const key = `${match.match}-${match.context.substring(0, 30)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  getAllTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip empty text nodes
          if (!node.textContent || node.textContent.trim().length === 0) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip script, style, and other non-visible elements
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          
          const tagName = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'head', 'meta', 'link'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Don't check computed styles as it can be expensive and may reject valid text
          // Just check basic visibility attributes
          if (parent.style.display === 'none' || parent.hidden) {
            return NodeFilter.FILTER_REJECT;
          }
          
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    return textNodes;
  }

  getElementLocation(textNode) {
    const element = textNode.parentElement;
    if (!element) return 'Unknown location';
    
    const tagName = element.tagName.toLowerCase();
    let location = `<${tagName}>`;
    
    // Add ID if present
    if (element.id) {
      location += `#${element.id}`;
    }
    
    // Add first class if present
    if (element.classList.length > 0) {
      location += `.${element.classList[0]}`;
    }
    
    // Add position info for better context
    const rect = element.getBoundingClientRect();
    if (rect.top > 0) {
      location += ` (${Math.round(rect.top)}px from top)`;
    }
    
    return location;
  }

  highlightMatches(keyword, options) {
    const { caseSensitive, regexMode } = options;
    
    let searchPattern;
    let flags = 'g';
    
    if (!caseSensitive) {
      flags += 'i';
    }
    
    try {
      if (regexMode) {
        searchPattern = new RegExp(keyword, flags);
      } else {
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escapedKeyword, flags);
      }
    } catch (error) {
      return; // Skip highlighting on regex error
    }

    const textNodes = this.getAllTextNodes(document.body);
    
    textNodes.forEach(node => {
      const text = node.textContent;
      searchPattern.lastIndex = 0;
      
      if (searchPattern.test(text)) {
        this.highlightInTextNode(node, searchPattern);
      }
    });
  }

  highlightInTextNode(textNode, searchPattern) {
    const text = textNode.textContent;
    const parent = textNode.parentElement;
    
    if (!parent) return;
    
    const fragments = [];
    let lastIndex = 0;
    let match;
    
    searchPattern.lastIndex = 0;
    
    while ((match = searchPattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        fragments.push(document.createTextNode(beforeText));
      }
      
      // Add highlighted match
      const highlightSpan = document.createElement('span');
      highlightSpan.className = this.highlightClass;
      highlightSpan.textContent = match[0];
      fragments.push(highlightSpan);
      this.currentHighlights.push(highlightSpan);
      
      lastIndex = match.index + match[0].length;
      
      // Prevent infinite loop
      if (match[0].length === 0) {
        searchPattern.lastIndex++;
      }
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      const afterText = text.substring(lastIndex);
      fragments.push(document.createTextNode(afterText));
    }
    
    // Replace the original text node with fragments
    if (fragments.length > 1) {
      const nextSibling = textNode.nextSibling;
      parent.removeChild(textNode);
      
      fragments.forEach(fragment => {
        parent.insertBefore(fragment, nextSibling);
      });
    }
  }

  clearHighlights() {
    this.currentHighlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        // Replace highlight with text content
        const textNode = document.createTextNode(highlight.textContent);
        parent.insertBefore(textNode, highlight);
        parent.removeChild(highlight);
        
        // Merge adjacent text nodes
        this.mergeAdjacentTextNodes(parent);
      }
    });
    
    this.currentHighlights = [];
  }

  mergeAdjacentTextNodes(element) {
    let child = element.firstChild;
    
    while (child) {
      if (child.nodeType === Node.TEXT_NODE && 
          child.nextSibling && 
          child.nextSibling.nodeType === Node.TEXT_NODE) {
        
        child.textContent += child.nextSibling.textContent;
        element.removeChild(child.nextSibling);
      } else {
        child = child.nextSibling;
      }
    }
  }

  injectStyles() {
    // Remove existing style if present
    if (this.highlightStyle) {
      this.highlightStyle.remove();
    }
    
    this.highlightStyle = document.createElement('style');
    this.highlightStyle.textContent = `
      .${this.highlightClass} {
        background-color: #ffeb3b !important;
        color: #d84315 !important;
        padding: 1px 2px !important;
        border-radius: 2px !important;
        font-weight: bold !important;
        box-shadow: 0 0 3px rgba(255, 235, 59, 0.8) !important;
        animation: keyword-harvest-pulse 2s ease-in-out !important;
      }
      
      @keyframes keyword-harvest-pulse {
        0% { box-shadow: 0 0 3px rgba(255, 235, 59, 0.8); }
        50% { box-shadow: 0 0 8px rgba(255, 235, 59, 1); }
        100% { box-shadow: 0 0 3px rgba(255, 235, 59, 0.8); }
      }
    `;
    
    document.head.appendChild(this.highlightStyle);
  }

  startObservingChanges() {
    // Clear existing observer
    if (this.observer) {
      this.observer.disconnect();
    }
    
    this.observer = new MutationObserver((mutations) => {
      let hasTextChanges = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' || 
            mutation.type === 'characterData') {
          hasTextChanges = true;
        }
      });
      
      // Debounce rapid changes
      if (hasTextChanges) {
        clearTimeout(this.observerTimeout);
        this.observerTimeout = setTimeout(() => {
          // Re-highlight if we currently have highlights
          if (this.currentHighlights.length > 0) {
            // This would require storing the last search parameters
            // For now, we'll just clear highlights when content changes
            this.clearHighlights();
          }
        }, 1000);
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new KeywordExtractor();
  });
} else {
  new KeywordExtractor();
}