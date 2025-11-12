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
      
      console.log('Starting keyword extraction for:', keyword);
      
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
      
      console.log('Extraction complete, found', results.length, 'matches');
      
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

  extractKeywords(keyword, options) {
    console.log('Extracting keywords:', keyword, 'Options:', options);
    
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
      console.log('Search pattern:', searchPattern);
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
    console.log(`Searching in ${textNodes.length} individual text nodes`);
    
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
    // Get text from common content containers, excluding navigation, ads, etc.
    const selectors = [
      'main', 'article', '[role="main"]', '.content', '#content',
      '.post', '.entry', '.article', 'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ];
    
    let allText = '';
    
    // Try to get text from main content areas first
    for (const selector of selectors.slice(0, 5)) { // Try main content selectors first
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(el => {
          if (this.isElementVisible(el)) {
            allText += ' ' + el.innerText;
          }
        });
        if (allText.length > 1000) break; // If we found substantial content, use it
      }
    }
    
    // Fallback to body text if no main content found
    if (allText.length < 1000) {
      allText = document.body.innerText || document.body.textContent || '';
    }
    
    return allText;
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
    
    console.log(`Found ${textNodes.length} text nodes to search`);
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