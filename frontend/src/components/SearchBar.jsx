import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Database, Globe, X, TrendingUp, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar({
  onSearch,
  isLoading,
  dbCount,
  apiCount,
  query,
}) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const containerRef = useRef(null);
  const debouncedInput = useDebounce(inputValue, 300);

  // ── Fetch suggestions from backend as user types ──────────────────────────
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedInput.trim().length < 2) {
        setSuggestions([]);
        setIsSuggestionsOpen(false);
        return;
      }

      setIsFetchingSuggestions(true);
      try {
        const { data } = await axios.get('/api/recipes/suggestions', {
          params: { q: debouncedInput.trim() },
        });
        setSuggestions(data.suggestions || []);
        setIsSuggestionsOpen((data.suggestions || []).length > 0);
        setActiveSuggestion(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedInput]);

  // ── Close suggestions when clicking outside ───────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Keyboard navigation for suggestions ──────────────────────────────────
  const handleKeyDown = (e) => {
    if (!isSuggestionsOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeSuggestion].name);
    } else if (e.key === 'Escape') {
      setIsSuggestionsOpen(false);
    }
  };

  const selectSuggestion = useCallback(
    (name) => {
      setInputValue(name);
      setIsSuggestionsOpen(false);
      setSuggestions([]);
      onSearch(name);
    },
    [onSearch]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setIsSuggestionsOpen(false);
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    onSearch('');
  };

  const totalResults = (dbCount || 0) + (apiCount || 0);
  const hasResults = query && !isLoading && totalResults >= 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">

      {/* Search form + suggestions container */}
      <div ref={containerRef} className="relative">
        <form onSubmit={handleSubmit} className="group">
          <div className="search-glow relative flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-2xl p-2 pl-4 transition-all duration-300">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />
            ) : isFetchingSuggestions ? (
              <Loader2 className="h-5 w-5 text-slate-500 animate-spin shrink-0" />
            ) : (
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors shrink-0" />
            )}

            <Input
              id="recipe-search-input"
              type="text"
              placeholder="Search recipes… e.g. pasta, chicken, salad"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value.trim().length >= 2) {
                  setIsSuggestionsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setIsSuggestionsOpen(true);
              }}
              className="border-0 bg-transparent p-0 h-auto text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500"
              disabled={isLoading}
              autoComplete="off"
            />

            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="p-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <Button
              id="search-submit-btn"
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="shrink-0 rounded-xl"
            >
              {isLoading ? 'Searching…' : 'Search'}
            </Button>
          </div>
        </form>

        {/* ── Suggestions Dropdown ──────────────────────────────────────────── */}
        {isSuggestionsOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Saved in your vault
              </span>
            </div>

            {/* Suggestion items */}
            <ul role="listbox" id="suggestions-list" className="py-1">
              {suggestions.map((s, idx) => (
                <li
                  key={s._id}
                  role="option"
                  aria-selected={idx === activeSuggestion}
                  id={`suggestion-${idx}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before click
                    selectSuggestion(s.name);
                  }}
                  onMouseEnter={() => setActiveSuggestion(idx)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100 ${
                    idx === activeSuggestion
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 flex items-center justify-center">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt={s.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ChefHat className="h-4 w-4 text-slate-600" />
                    )}
                  </div>

                  {/* Name with highlighted match */}
                  <span className="text-sm flex-1 line-clamp-1">
                    <HighlightMatch text={s.name} query={inputValue} />
                  </span>

                  {/* Source badge */}
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                      s.source === 'User'
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                        : 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                    }`}
                  >
                    {s.source}
                  </span>
                </li>
              ))}
            </ul>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-600">
                ↑↓ navigate · Enter select · Esc close
              </span>
              <span className="text-[11px] text-slate-600">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Result metadata badges ──────────────────────────────────────────── */}
      {hasResults && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {dbCount > 0 && (
            <Badge variant="default" className="gap-1.5 text-xs">
              <Database className="h-3 w-3" />
              {dbCount} from Local DB
            </Badge>
          )}
          {apiCount > 0 && (
            <Badge variant="blue" className="gap-1.5 text-xs">
              <Globe className="h-3 w-3" />
              {apiCount} new from API
            </Badge>
          )}
          {dbCount === 0 && apiCount === 0 && (
            <span className="text-sm text-slate-500">No results found</span>
          )}
          <span className="text-sm text-slate-400">
            for{' '}
            <span className="text-emerald-400 font-medium">"{query}"</span>
            {totalResults > 0 && (
              <span className="text-slate-500 ml-1">
                — {totalResults} total
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Helper: highlight matching substring in suggestion name ────────────────────
function HighlightMatch({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <span className="text-emerald-400 font-semibold">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
