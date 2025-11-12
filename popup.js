class KeywordHarvest {
  constructor() {
    this.results = [];
    this.currentTabId = null;
    this.searchHistory = [];
    this.maxHistoryItems = 5;
    
    this.init();
  }

  async init() {
    await this.loadSearchHistory();
    this.bindEvents();
    this.getCurrentTab();
    this.displayHistory();
  }

  bindEvents() {
    const keywordInput = document.getElementById('keyword-input');
    const extractBtn = document.getElementById('extract-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const exportTxtBtn = document.getElementById('export-txt');
    const exportJsonBtn = document.getElementById('export-json');
    const highlightToggle = document.getElementById('highlight-toggle');

    extractBtn.addEventListener('click', () => this.extractKeywords());
    keywordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.extractKeywords();
    });
    
    copyAllBtn.addEventListener('click', () => this.copyAllResults());
    exportTxtBtn.addEventListener('click', () => this.exportResults('txt'));
    exportJsonBtn.addEventListener('click', () => this.exportResults('json'));
    
    highlightToggle.addEventListener('change', (e) => {
      this.toggleHighlighting(e.target.checked);
    });
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTabId = tab.id;
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  async extractKeywords() {
    const keywordInput = document.getElementById('keyword-input');
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
      this.showError('Please enter a keyword to search for');
      return;
    }

    const caseSensitive = document.getElementById('case-sensitive').checked;
    const regexMode = document.getElementById('regex-mode').checked;
    const highlight = document.getElementById('highlight-toggle').checked;

    this.showLoading(true);
    
    try {
      const response = await chrome.tabs.sendMessage(this.currentTabId, {
        action: 'extractKeywords',
        keyword: keyword,
        options: {
          caseSensitive,
          regexMode,
          highlight
        }
      });

      if (response && response.success) {
        this.results = response.results;
        this.displayResults();
        this.addToHistory(keyword, this.results.length);
        this.updateActionButtons(true);
      } else {
        this.showError(response?.error || 'Failed to extract keywords');
      }
    } catch (error) {
      console.error('Error extracting keywords:', error);
      this.showError('Could not connect to the page. Please refresh and try again.');
    }
    
    this.showLoading(false);
  }

  displayResults() {
    const container = document.getElementById('results-container');
    const countElement = document.getElementById('results-count');
    
    countElement.textContent = `${this.results.length} matches found`;
    
    if (this.results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No matches found for the given keyword.</p>
        </div>
      `;
      return;
    }

    const resultsHTML = this.results.map((result, index) => `
      <div class="result-item">
        <div class="result-header">
          <span class="match-number">Match ${index + 1}</span>
        </div>
        <div class="context-text">${this.highlightKeyword(result.context, result.match)}</div>
        <div class="location-info">${result.location}</div>
      </div>
    `).join('');

    container.innerHTML = resultsHTML;
  }

  highlightKeyword(context, match) {
    if (!context || !match) return context;
    
    const regex = new RegExp(`(${this.escapeRegExp(match)})`, 'gi');
    return context.replace(regex, '<span class="highlight">$1</span>');
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async toggleHighlighting(enabled) {
    if (!this.currentTabId) return;

    try {
      await chrome.tabs.sendMessage(this.currentTabId, {
        action: 'toggleHighlight',
        enabled: enabled
      });
    } catch (error) {
      console.error('Error toggling highlights:', error);
    }
  }

  async copyAllResults() {
    if (this.results.length === 0) return;

    const text = this.results.map((result, index) => 
      `Match ${index + 1}:\n${result.context}\nLocation: ${result.location}\n`
    ).join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(text);
      this.showSuccessMessage('Results copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showError('Failed to copy to clipboard');
    }
  }

  exportResults(format) {
    if (this.results.length === 0) return;

    const keyword = document.getElementById('keyword-input').value;
    const timestamp = new Date().toISOString();
    
    let content, filename, mimeType;

    if (format === 'txt') {
      content = this.formatResultsAsText(keyword, timestamp);
      filename = `keyword-harvest-${keyword.replace(/[^a-z0-9]/gi, '_')}.txt`;
      mimeType = 'text/plain';
    } else if (format === 'json') {
      content = this.formatResultsAsJSON(keyword, timestamp);
      filename = `keyword-harvest-${keyword.replace(/[^a-z0-9]/gi, '_')}.json`;
      mimeType = 'application/json';
    }

    this.downloadFile(content, filename, mimeType);
  }

  formatResultsAsText(keyword, timestamp) {
    const header = `Keyword Harvest Results
Keyword: ${keyword}
Total Matches: ${this.results.length}
Timestamp: ${timestamp}
${'='.repeat(50)}

`;

    const results = this.results.map((result, index) => 
      `Match ${index + 1}:
Context: ${result.context}
Location: ${result.location}
`
    ).join('\n' + '-'.repeat(30) + '\n\n');

    return header + results;
  }

  formatResultsAsJSON(keyword, timestamp) {
    const data = {
      keyword: keyword,
      totalMatches: this.results.length,
      timestamp: timestamp,
      results: this.results.map((result, index) => ({
        matchNumber: index + 1,
        match: result.match,
        context: result.context,
        location: result.location,
        position: result.position
      }))
    };

    return JSON.stringify(data, null, 2);
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    this.showSuccessMessage(`Exported as ${filename}`);
  }

  async addToHistory(keyword, count) {
    const historyItem = {
      keyword: keyword,
      count: count,
      timestamp: Date.now()
    };

    this.searchHistory.unshift(historyItem);
    this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);

    await this.saveSearchHistory();
    this.displayHistory();
  }

  displayHistory() {
    const container = document.getElementById('history-container');
    
    if (this.searchHistory.length === 0) {
      container.innerHTML = '<p class="empty-history">No recent searches</p>';
      return;
    }

    const historyHTML = this.searchHistory.map(item => `
      <div class="history-item" data-keyword="${item.keyword}">
        <span class="history-keyword">${item.keyword}</span>
        <span class="history-count">${item.count} matches</span>
      </div>
    `).join('');

    container.innerHTML = historyHTML;

    container.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const keyword = item.dataset.keyword;
        document.getElementById('keyword-input').value = keyword;
        this.extractKeywords();
      });
    });
  }

  async loadSearchHistory() {
    try {
      const result = await chrome.storage.local.get(['searchHistory']);
      this.searchHistory = result.searchHistory || [];
    } catch (error) {
      console.error('Error loading search history:', error);
      this.searchHistory = [];
    }
  }

  async saveSearchHistory() {
    try {
      await chrome.storage.local.set({ searchHistory: this.searchHistory });
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  updateActionButtons(enabled) {
    const copyBtn = document.getElementById('copy-all-btn');
    const exportBtn = document.getElementById('export-btn');
    
    copyBtn.disabled = !enabled;
    exportBtn.disabled = !enabled;
  }

  showLoading(show) {
    const container = document.getElementById('results-container');
    
    if (show) {
      container.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          Extracting keywords...
        </div>
      `;
    }
  }

  showError(message) {
    const container = document.getElementById('results-container');
    container.innerHTML = `
      <div class="empty-state">
        <p style="color: #ef4444;">❌ ${message}</p>
      </div>
    `;
  }

  showSuccessMessage(message) {
    const container = document.getElementById('results-container');
    const originalHTML = container.innerHTML;
    
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    successDiv.textContent = `✅ ${message}`;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      document.body.removeChild(successDiv);
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KeywordHarvest();
});