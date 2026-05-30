import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, Database, Globe, X, TrendingUp, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

//    Debounce hook                                                              
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

//    Highlight matched text (only when row is not active)                       
function HighlightMatch({ text, query, isActive }) {
  if (!query || isActive) return <span>{text}</span>;

  const lowerText  = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx        = lowerText.indexOf(lowerQuery);

  if (idx === -1) return <span className="text-slate-200">{text}</span>;

  return (
    <span className="text-slate-200">
      {text.slice(0, idx)}
      <span className="text-emerald-400 font-semibold bg-emerald-500/10 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </span>
  );
}

export default function SearchBar({ onSearch, isLoading, dbCount, apiCount, query }) {
  const [inputValue, setInputValue]         = useState('');
  const [suggestions, setSuggestions]       = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFetching, setIsFetching]         = useState(false);
  const [activeIdx, setActiveIdx]           = useState(-1);
  // Position of the dropdown in viewport coordinates (for the portal)
  const [dropPos, setDropPos]               = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef(null);
  const inputRef     = useRef(null);
  const debouncedInput = useDebounce(inputValue, 300);

  //    Compute fixed position from the container's bounding rect              
  const updateDropPos = useCallback(() => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 8, left: r.left, width: r.width });
    }
  }, []);

  // Recompute whenever dropdown visibility or suggestions change
  useLayoutEffect(() => {
    if (isDropdownOpen) updateDropPos();
  }, [isDropdownOpen, suggestions, updateDropPos]);

  // Recompute on scroll / resize so the portal stays aligned
  useEffect(() => {
    if (!isDropdownOpen) return;
    const onScroll = () => updateDropPos();
    const onResize = () => updateDropPos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isDropdownOpen, updateDropPos]);

  //    Fetch suggestions                                                      
  useEffect(() => {
    const run = async () => {
      const q = debouncedInput.trim();
      if (q.length < 2) {
        setSuggestions([]);
        setIsDropdownOpen(false);
        return;
      }
      setIsFetching(true);
      try {
        const { data } = await axios.get('/api/recipes/suggestions', { params: { q } });
        const list = data.suggestions || [];
        setSuggestions(list);
        setIsDropdownOpen(list.length > 0);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
        setIsDropdownOpen(false);
      } finally {
        setIsFetching(false);
      }
    };
    run();
  }, [debouncedInput]);

  //    Close on outside click                                                 
  useEffect(() => {
    const handleOutside = (e) => {
      // Check both the container AND the portal dropdown (which is in body)
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest('[data-suggestions-portal]')
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  //    Select a suggestion                                                    
  const selectSuggestion = useCallback(
    (name) => {
      setInputValue(name);
      setIsDropdownOpen(false);
      setSuggestions([]);
      setActiveIdx(-1);
      onSearch(name);
    },
    [onSearch]
  );

  //    Keyboard navigation                                                    
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((p) => (p < suggestions.length - 1 ? p + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((p) => (p > 0 ? p - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIdx].name);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setActiveIdx(-1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setIsDropdownOpen(false);
    onSearch(q);
  };

  const handleClear = () => {
    setInputValue('');
    setSuggestions([]);
    setIsDropdownOpen(false);
    setActiveIdx(-1);
    onSearch('');
    inputRef.current?.focus();
  };

  const totalResults = (dbCount || 0) + (apiCount || 0);
  const hasResultMeta = query && !isLoading;

  //    Portal dropdown markup                                                 
  const dropdown = isDropdownOpen && suggestions.length > 0
    ? createPortal(
        <div
          data-suggestions-portal
          style={{
            position: 'fixed',
            top:    dropPos.top,
            left:   dropPos.left,
            width:  dropPos.width,
            zIndex: 99999,
          }}
          className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/70"
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Saved in your vault
            </span>
          </div>

          {/* Items */}
          <ul role="listbox" className="py-1.5">
            {suggestions.map((s, idx) => {
              const isActive = idx === activeIdx;
              return (
                <li
                  key={s._id}
                  role="option"
                  aria-selected={isActive}
                  id={`suggestion-${idx}`}
                  onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s.name); }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(-1)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-100 ${
                    isActive ? 'bg-emerald-500/10' : 'hover:bg-slate-800/60'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50">
                    {s.image ? (
                      <img
                        src={s.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <ChefHat className="h-4 w-4 text-slate-600" />
                    )}
                  </div>

                  {/* Name with highlight */}
                  <span className={`flex-1 truncate text-sm font-medium ${isActive ? 'text-emerald-300' : ''}`}>
                    <HighlightMatch text={s.name} query={inputValue.trim()} isActive={isActive} />
                  </span>

                  {/* Source pill */}
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    s.source === 'User'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                  }`}>
                    {s.source}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2">
            <span className="text-[11px] text-slate-600">↑↓ navigate · Enter select · Esc close</span>
            <span className="text-[11px] text-slate-600">
              {suggestions.length} match{suggestions.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/*    Search form    */}
      <div ref={containerRef} className="relative">
        <form onSubmit={handleSubmit}>
          <div className="search-glow relative flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-2xl p-2 pl-4 transition-all duration-300">
            {isLoading ? (
              <Loader2 className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />
            ) : isFetching ? (
              <Loader2 className="h-5 w-5 text-slate-500 animate-spin shrink-0" />
            ) : (
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
            )}

            <Input
              ref={inputRef}
              id="recipe-search-input"
              type="text"
              placeholder="Search recipes… e.g. pasta, chicken, salad"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setIsDropdownOpen(true); }}
              className="border-0 bg-transparent p-0 h-auto text-base text-white focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500"
              disabled={isLoading}
              autoComplete="off"
            />

            {inputValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="p-1 text-slate-500 hover:text-white transition-colors rounded-md"
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
      </div>

      {/* Portal renders here (in document.body, above everything) */}
      {dropdown}

      {/*    Result metadata    */}
      {hasResultMeta && (
        <div className="flex flex-wrap items-center gap-2 px-1 pt-1">
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
          {totalResults === 0 && (
            <span className="text-sm text-slate-500">No results found</span>
          )}
          {totalResults > 0 && (
            <span className="text-sm text-slate-400">
              for{' '}
              <span className="font-medium text-emerald-400">"{query}"</span>
              <span className="ml-1 text-slate-600">  {totalResults} total</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
