import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import RecipeGrid from '@/components/RecipeGrid';
import RecipeModal from '@/components/RecipeModal';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import { useRecipes } from '@/hooks/useRecipes';
import { Sparkles, Loader2, ChefHat } from 'lucide-react';

const PAGE_LIMIT = 8;

export default function App() {
  const { fetchAllRecipes, searchRecipes, createRecipe, updateRecipe, deleteRecipe } =
    useRecipes();

  // Core state 
  const [recipes, setRecipes]       = useState([]);
  const [dbCount, setDbCount]       = useState(0);
  const [apiCount, setApiCount]     = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading]   = useState(false);

  // Pagination / infinite scroll state 
  const [currentPage, setCurrentPage]     = useState(1);
  const [hasMore, setHasMore]             = useState(false);
  const [totalCount, setTotalCount]       = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Modal state  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [viewTarget, setViewTarget]   = useState(null);
  const [toast, setToast]             = useState(null);

  //    Refs                                                                      
  const heroRef     = useRef(null);
  const searchRef   = useRef(null);
  const sentinelRef = useRef(null);   // Intersection Observer target
  const toastTimer  = useRef(null);

  //    GSAP page-load animation                                                 
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(heroRef.current,   { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo(searchRef.current, { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');
  }, []);

  //    Load page 1 on mount                                                     
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { recipes: data, hasMore: more, total } = await fetchAllRecipes(1, PAGE_LIMIT);
        setRecipes(data);
        setCurrentPage(1);
        setHasMore(more);
        setTotalCount(total);
      } catch {
        showToast('Failed to load recipes. Is the backend running?', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  //    Infinite scroll   Intersection Observer on sentinel div                  
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetchingMore && !isLoading && !searchQuery) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isFetchingMore, isLoading, searchQuery, currentPage]);

  const loadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    try {
      const nextPage = currentPage + 1;
      const { recipes: newData, hasMore: more, total } = await fetchAllRecipes(nextPage, PAGE_LIMIT);
      setRecipes((prev) => {
        // De-duplicate by _id in case of race conditions
        const ids = new Set(prev.map((r) => r._id));
        return [...prev, ...newData.filter((r) => !ids.has(r._id))];
      });
      setCurrentPage(nextPage);
      setHasMore(more);
      setTotalCount(total);
    } catch {
      showToast('Failed to load more recipes.', 'error');
    } finally {
      setIsFetchingMore(false);
    }
  };

  //    Toast helper                                                             
  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  //    Search handler                                                           
  const handleSearch = useCallback(
    async (query) => {
      if (!query) {
        // Clear search → reset to paginated all-recipes view
        setIsLoading(true);
        setSearchQuery('');
        setDbCount(0);
        setApiCount(0);
        try {
          const { recipes: data, hasMore: more, total } = await fetchAllRecipes(1, PAGE_LIMIT);
          setRecipes(data);
          setCurrentPage(1);
          setHasMore(more);
          setTotalCount(total);
        } catch {
          showToast('Failed to load recipes.', 'error');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setSearchQuery(query);
      setHasMore(false); // disable infinite scroll during search
      try {
        const { dbRecipes, apiRecipes } = await searchRecipes(query);
        setRecipes([...dbRecipes, ...apiRecipes]);
        setDbCount(dbRecipes.length);
        setApiCount(apiRecipes.length);
      } catch {
        showToast('Search failed. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAllRecipes, searchRecipes]
  );

  //    Create / Edit                                                             
  const handleModalSubmit = async (formData) => {
    if (editTarget) {
      const updated = await updateRecipe(editTarget._id, formData);
      setRecipes((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      if (viewTarget?._id === updated._id) setViewTarget(updated);
      showToast(`"${updated.name}" updated successfully!`);
    } else {
      const created = await createRecipe(formData);
      setRecipes((prev) => [created, ...prev]);
      setTotalCount((n) => n + 1);
      showToast(`"${created.name}" added to your vault!`);
    }
  };

  //    Delete                                                                    
  const handleDelete = async (id) => {
    const recipe = recipes.find((r) => r._id === id);
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      setTotalCount((n) => Math.max(0, n - 1));
      if (viewTarget?._id === id) setViewTarget(null);
      showToast(`"${recipe?.name}" deleted.`, 'info');
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  //    Modal helpers                                                             
  const openCreate = () => { setEditTarget(null); setIsModalOpen(true); };
  const openEdit   = (r) => { setEditTarget(r);   setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditTarget(null); };
  const openView   = (r) => setViewTarget(r);
  const closeView  = () => setViewTarget(null);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar onAddRecipe={openCreate} recipeCount={totalCount || recipes.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* Hero */}
        <div ref={heroRef} className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm text-emerald-400 font-medium mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Recipe Vault
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Your Personal{' '}
            <span className="gradient-text">Recipe Dashboard</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Search millions of recipes. Save your favorites. Create your own. Powered by intelligent caching.
          </p>
        </div>

        {/* Search */}
        <div ref={searchRef}>
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            dbCount={dbCount}
            apiCount={apiCount}
            query={searchQuery}
          />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {searchQuery ? 'Search Results' : 'All Recipes'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {searchQuery ? (
                <>
                  {dbCount > 0 && <span className="text-emerald-400">{dbCount} from your vault</span>}
                  {dbCount > 0 && apiCount > 0 && <span className="text-slate-600"> · </span>}
                  {apiCount > 0 && <span className="text-blue-400">{apiCount} new from API</span>}
                  {dbCount === 0 && apiCount === 0 && !isLoading && (
                    <span>No results found for "{searchQuery}"</span>
                  )}
                </>
              ) : (
                <>
                  Browse your complete recipe collection
                  {totalCount > 0 && (
                    <span className="ml-1 text-slate-600">
                        showing {recipes.length} of {totalCount}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Recipe grid */}
        <RecipeGrid
          recipes={recipes}
          onEdit={openEdit}
          onDelete={handleDelete}
          onView={openView}
          isLoading={isLoading}
        />

        {/*    Infinite scroll sentinel    */}
        {!searchQuery && (
          <div ref={sentinelRef} className="flex flex-col items-center py-6 gap-3">
            {isFetchingMore && (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                <p className="text-sm text-slate-500">Loading more recipes…</p>
              </>
            )}
            {!hasMore && !isLoading && recipes.length > 0 && (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                  <ChefHat className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-sm text-slate-500">
                  You've seen all <span className="font-medium text-slate-400">{recipes.length}</span> recipes
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        editTarget={editTarget}
      />
      <RecipeDetailModal
        recipe={viewTarget}
        isOpen={Boolean(viewTarget)}
        onClose={closeView}
        onEdit={openEdit}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[99998] flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-2xl border max-w-sm ${
          toast.type === 'error' ? 'bg-red-950 border-red-800 text-red-300'
          : toast.type === 'info' ? 'bg-slate-800 border-slate-700 text-slate-200'
          : 'bg-emerald-950 border-emerald-800 text-emerald-300'
        }`}>
          <span className="text-base">
            {toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
