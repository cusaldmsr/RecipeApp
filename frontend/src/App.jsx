import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import RecipeGrid from '@/components/RecipeGrid';
import RecipeModal from '@/components/RecipeModal';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import { useRecipes } from '@/hooks/useRecipes';
import { Sparkles } from 'lucide-react';

export default function App() {
  const { fetchAllRecipes, searchRecipes, createRecipe, updateRecipe, deleteRecipe } =
    useRecipes();

  // ── State ───────────────────────────────────────────────────────────────────
  const [recipes, setRecipes] = useState([]);   // merged display list
  const [dbCount, setDbCount] = useState(0);    // # from local DB on last search
  const [apiCount, setApiCount] = useState(0);  // # new from API on last search
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null); // recipe being viewed
  const [toast, setToast] = useState(null); // { message, type }

  // ── Refs for GSAP ──────────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const searchRef = useRef(null);
  const toastTimer = useRef(null);

  // ── Initial page-load GSAP animation ───────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.8 }
    ).fromTo(
      searchRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      '-=0.4'
    );
  }, []);

  // ── Load all recipes on mount ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { recipes: data } = await fetchAllRecipes();
        setRecipes(data);
        setDbCount(data.length);
        setApiCount(0);
      } catch (err) {
        showToast('Failed to load recipes. Is the backend running?', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // ── Search handler ─────────────────────────────────────────────────────────
  const handleSearch = useCallback(
    async (query) => {
      if (!query) {
        // Reset: reload all
        setIsLoading(true);
        setSearchQuery('');
        setDbCount(0);
        setApiCount(0);
        try {
          const { recipes: data } = await fetchAllRecipes();
          setRecipes(data);
          setDbCount(data.length);
        } catch {
          showToast('Failed to load recipes.', 'error');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setSearchQuery(query);
      try {
        // Backend now returns { dbRecipes, apiRecipes, total }
        const { dbRecipes, apiRecipes } = await searchRecipes(query);
        // DB results first, then new API results
        setRecipes([...dbRecipes, ...apiRecipes]);
        setDbCount(dbRecipes.length);
        setApiCount(apiRecipes.length);
      } catch (err) {
        showToast('Search failed. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [fetchAllRecipes, searchRecipes]
  );

  // ── Create / Edit submit ────────────────────────────────────────────────────
  const handleModalSubmit = async (formData) => {
    if (editTarget) {
      // Update
      const updated = await updateRecipe(editTarget._id, formData);
      setRecipes((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );
      showToast(`"${updated.name}" updated successfully!`);
    } else {
      // Create
      const created = await createRecipe(formData);
      setRecipes((prev) => [created, ...prev]);
      showToast(`"${created.name}" added to your vault!`);
    }
  };

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const recipe = recipes.find((r) => r._id === id);
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      showToast(`"${recipe?.name}" deleted.`, 'info');
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  // ── Modal open helpers ─────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setIsModalOpen(true);
  };

  const openEdit = (recipe) => {
    setEditTarget(recipe);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditTarget(null);
  };

  const openView = (recipe) => setViewTarget(recipe);
  const closeView = () => setViewTarget(null);

  return (
    <div className="min-h-screen bg-mesh">
      {/* Navbar */}
      <Navbar onAddRecipe={openCreate} recipeCount={recipes.length} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero section */}
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

        {/* Search bar */}
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
                  {dbCount > 0 && (
                    <span className="text-emerald-400">{dbCount} from your vault</span>
                  )}
                  {dbCount > 0 && apiCount > 0 && <span className="text-slate-600"> · </span>}
                  {apiCount > 0 && (
                    <span className="text-blue-400">{apiCount} new from API</span>
                  )}
                  {dbCount === 0 && apiCount === 0 && !isLoading && (
                    <span>No results found for "{searchQuery}"</span>
                  )}
                </>
              ) : (
                'Browse your complete recipe collection'
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
      </main>

      {/* Recipe Create/Edit Modal */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        editTarget={editTarget}
      />

      {/* Recipe Detail/View Modal */}
      <RecipeDetailModal
        recipe={viewTarget}
        isOpen={Boolean(viewTarget)}
        onClose={closeView}
        onEdit={openEdit}
      />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium shadow-2xl border transition-all duration-300 max-w-sm ${
            toast.type === 'error'
              ? 'bg-red-950 border-red-800 text-red-300'
              : toast.type === 'info'
              ? 'bg-slate-800 border-slate-700 text-slate-200'
              : 'bg-emerald-950 border-emerald-800 text-emerald-300'
          }`}
        >
          <span className="text-base">
            {toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}
          </span>
          {toast.message}
        </div>
      )}
    </div>
  );
}
