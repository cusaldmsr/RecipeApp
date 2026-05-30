import { useState } from 'react';
import { Search, Loader2, Database, Globe, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SearchBar({ onSearch, isLoading, source, resultCount, query }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="search-glow relative flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-2xl p-2 pl-4 transition-all duration-300">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />
          ) : (
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors shrink-0" />
          )}
          <Input
            id="recipe-search-input"
            type="text"
            placeholder="Search recipes… e.g. pasta, chicken, salad"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border-0 bg-transparent p-0 h-auto text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-500"
            disabled={isLoading}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
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

      {/* Result metadata */}
      {query && !isLoading && (
        <div className="flex items-center gap-3 px-1">
          {source === 'database' ? (
            <Badge variant="default" className="gap-1.5">
              <Database className="h-3 w-3" />
              Local Database
            </Badge>
          ) : source === 'api' ? (
            <Badge variant="blue" className="gap-1.5">
              <Globe className="h-3 w-3" />
              External API
            </Badge>
          ) : null}

          <span className="text-sm text-slate-400">
            <span className="font-semibold text-white">{resultCount}</span>
            {' '}result{resultCount !== 1 ? 's' : ''} for{' '}
            <span className="text-emerald-400 font-medium">"{query}"</span>
          </span>
        </div>
      )}
    </div>
  );
}
