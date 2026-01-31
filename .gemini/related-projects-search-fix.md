# Related Projects Search - Issue Analysis & Fix

## The Problem

The Tavily API search for finding related projects was not returning the expected results because the search query was incorrectly formatted.

### What Was Happening

**Location:** `backend/src/ai/ai.service.ts` - `buildSearchQuery()` function (lines 1187-1222)

**Previous Implementation:**
```typescript
const keywords = [...new Set([...titleKeywords, ...problemKeywords])].join(' ');
return `${keywords} site:github.com OR site:producthunt.com OR platform tool app software -blog -"how to" -tutorial -guide`;
```

**Example Query Generated:**
```
blockchain decentralized payment escrow site:github.com OR site:producthunt.com OR platform tool app software -blog -"how to" -tutorial -guide
```

### Why This Was Wrong

1. **Redundant Domain Filtering**: The code was adding `site:github.com OR site:producthunt.com` operators directly in the query string, but Tavily API already has dedicated parameters for this:
   - `include_domains`: Filter to specific domains (already configured)
   - `exclude_domains`: Exclude specific domains (already configured)

2. **Search Operator Confusion**: Using Google-style search operators (`site:`, `-`) in the Tavily query may not work as expected since Tavily uses its own AI-powered search system.

3. **Unclear Intent**: The query mixed keywords with technical operators, making it unclear what actual projects/products to find.

4. **Not Using Solution Keywords**: The function was only using title and problem keywords, ignoring solution keywords which often contain important implementation details.

## The Fix

**New Implementation:**
```typescript
// Extract keywords from title, problem, AND solution
const titleKeywords = extractKeyTerms(title);
const problemKeywords = extractKeyTerms(problem).slice(0, 4);
const solutionKeywords = extractKeyTerms(solution).slice(0, 2);

// Combine unique keywords
const allKeywords = [...new Set([...titleKeywords, ...problemKeywords, ...solutionKeywords])];
const primaryKeywords = allKeywords.slice(0, 5).join(' ');

// Create natural language query
return `projects using ${primaryKeywords} real-world implementation product platform`;
```

**Example Query Generated:**
```
projects using blockchain decentralized payment escrow smart real-world implementation product platform
```

### What Changed

1. ✅ **Natural Language Query**: Clean, descriptive query that clearly states the intent (finding projects/products)
2. ✅ **Uses Solution Keywords**: Now extracts keywords from the solution field for better matching
3. ✅ **No Redundant Operators**: Removed `site:` operators since domain filtering is handled by `include_domains`/`exclude_domains` parameters
4. ✅ **Clear Search Intent**: Uses phrases like "projects using", "real-world implementation", "product platform" to find actual implementations rather than blog posts

### Domain Filtering

The domain filtering is properly configured in the Tavily API call (lines 1092-1108):

```typescript
include_domains: [
  "github.com",
  "producthunt.com",
  "ycombinator.com",
  "betalist.com",
  "indiehackers.com",
],
exclude_domains: [
  "medium.com",
  "dev.to",
  "hackernoon.com",
  // ... etc
],
```

This configuration ensures we get:
- ✅ Real projects from GitHub, Product Hunt, YC, etc.
- ❌ Not blog posts or tutorials from Medium, Dev.to, etc.

## Expected Behavior After Fix

When a user searches for related projects to an idea:

1. **Better Results**: Should find actual projects, products, and implementations that use similar technology/solve similar problems
2. **More Relevant**: Natural language helps Tavily's AI understand the search intent better
3. **Comprehensive**: Uses keywords from title, problem, AND solution for better matching
4. **Cleaner**: No confusing search operators that might interfere with Tavily's AI

## Testing

To test this fix:

1. Clear existing AI-detected projects for an idea (use the "Clear" button in the modal)
2. Trigger a new search (it auto-triggers when opening Related Projects modal with no results)
3. Verify that the results are actual projects/products, not blog posts
4. Check the backend logs to see the generated query

## Files Modified

- `backend/src/ai/ai.service.ts` - Updated `buildSearchQuery()` method (lines 1187-1222)
