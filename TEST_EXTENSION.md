# 🧪 TEST YOUR EXTENSION - 5 MINUTE GUIDE

## STEP 1: Load Extension in Chrome (2 minutes)

1. **Open Chrome Extensions Page:**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode:**
   - Toggle switch in top-right corner

3. **Load Extension:**
   - Click "Load unpacked"
   - Navigate to: `/home/adampangelinan/ubuntu-projects/keywordharvest.app/extension-v1`
   - Click "Select Folder"

4. **Verify Loaded:**
   - Should see "Keyword Harvest" with version 1.0.0
   - Icon should appear in toolbar (purple "KH")

---

## STEP 2: Quick Functionality Test (3 minutes)

### Test 1: Basic Search
1. Go to: `https://en.wikipedia.org/wiki/Technology`
2. Click extension icon (or press Ctrl+Shift+E)
3. Type: `technology`
4. Click "Extract"
5. **Expected:** See multiple matches with context

### Test 2: Case Sensitive
1. Same page
2. Enable "Case sensitive" toggle
3. Search: `Technology` (capital T)
4. **Expected:** Fewer matches (only capitalized)

### Test 3: Copy Results
1. Click "Copy All" button
2. Open notepad/text editor
3. Paste (Ctrl+V)
4. **Expected:** All results copied with formatting

### Test 4: Export
1. Click "Export ▼"
2. Click "Export as TXT"
3. **Expected:** File downloads

### Test 5: Highlight
1. Enable "Highlight on page" toggle
2. Search any word
3. **Expected:** Words turn yellow on page

### Test 6: Search History
1. Search for 3-4 different words
2. Look at "Recent Searches" section
3. Click a previous search
4. **Expected:** Search runs again

---

## STEP 3: Test on Different Sites

### Try These:
- ✓ Wikipedia (long articles)
- ✓ GitHub README
- ✓ News site (CNN, BBC)
- ✓ Your own website

### What to Check:
- Extension icon appears
- Popup opens correctly
- Search works on all sites
- Results display properly

---

## 🐛 COMMON ISSUES & FIXES

### Issue: Extension won't load
**Fix:** Check all files in extension-v1/ folder

### Issue: No matches found
**Fix:**
- Try simple word like "the"
- Check console (F12) for errors
- Refresh the webpage

### Issue: Icons don't show
**Fix:** Verify icon16.png, icon48.png, icon128.png exist

### Issue: Can't copy/export
**Fix:** Check browser permissions for downloads

---

## ✅ WORKING? YOU'RE READY!

If all tests pass:
1. ✅ Extension loads
2. ✅ Search finds keywords
3. ✅ Copy works
4. ✅ Export works
5. ✅ Highlight works

**→ You're ready to submit to Chrome Web Store!**

Go to: `CHROME_STORE_READY.md` for submission guide.

---

## 📸 TAKE SCREENSHOTS NOW

While testing, take 5 screenshots:
1. Main popup interface
2. Results displaying
3. Options toggles
4. Export menu
5. Highlighted keywords on page

Use for Chrome Web Store listing!

---

## 🎯 FOR CLIENT DEMO

Run through this test sequence while sharing screen:
1. Show loading extension
2. Demo on Wikipedia
3. Show keyword extraction
4. Show export feature
5. Show highlight feature

**Time:** 2-3 minutes
**Impact:** Professional and polished!
