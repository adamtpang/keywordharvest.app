import React, { useState } from 'react'
import { Search, Download, Copy, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { CompactButton } from '@/components/extension/compact-button'
import { PopupCard } from '@/components/extension/popup-card'
import { MinimalBadge } from '@/components/extension/minimal-badge'
import { QuickToggle } from '@/components/extension/quick-toggle'

export function PopupApp() {
  const [keyword, setKeyword] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [regexMode, setRegexMode] = useState(false)
  const [highlightOn, setHighlightOn] = useState(false)
  const [results, setResults] = useState<number>(0)

  const handleExtract = () => {
    // TODO: Implement extraction logic
    console.log('Extracting:', keyword)
  }

  return (
    <div className="popup-container popup-spacing">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">🌾 Keyword Harvest</h1>
        <MinimalBadge count={results} />
      </div>

      {/* Search Input */}
      <PopupCard>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
              className="h-9 text-sm"
            />
            <CompactButton onClick={handleExtract} icon={<Search />}>
              Extract
            </CompactButton>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <QuickToggle
              id="case-sensitive"
              label="Case sensitive"
              checked={caseSensitive}
              onCheckedChange={setCaseSensitive}
            />
            <QuickToggle
              id="regex-mode"
              label="Regex mode"
              checked={regexMode}
              onCheckedChange={setRegexMode}
            />
            <QuickToggle
              id="highlight"
              label="Highlight on page"
              checked={highlightOn}
              onCheckedChange={setHighlightOn}
            />
          </div>
        </div>
      </PopupCard>

      {/* Actions */}
      <div className="flex gap-2">
        <CompactButton variant="outline" icon={<Copy />}>
          Copy
        </CompactButton>
        <CompactButton variant="outline" icon={<Download />}>
          Export
        </CompactButton>
        <CompactButton variant="destructive" icon={<Trash2 />}>
          Delete
        </CompactButton>
      </div>

      {/* Results Placeholder */}
      <PopupCard title="Results" description="No matches found yet">
        <p className="text-xs text-muted-foreground text-center py-4">
          Enter a keyword and click Extract to start
        </p>
      </PopupCard>
    </div>
  )
}
