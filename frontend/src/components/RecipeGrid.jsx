import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import RecipeCard from './RecipeCard';
import { ChefHat, SearchX } from 'lucide-react';

export default function RecipeGrid({ recipes, onEdit, onDelete, onView, isLoading }) {
  const gridRef = useRef(null);

  // GSAP stagger animation whenever recipes change
  useEffect(() => {
    if (!isLoading && recipes.length > 0 && gridRef.current) {
      const cards = gridRef.current.querySelectorAll('[data-recipe-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }
  }, [recipes, isLoading]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl overflow-hidden">
            <div className="aspect-video shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-4 shimmer rounded-full w-3/4" />
              <div className="h-3 shimmer rounded-full w-1/2" />
              <div className="h-3 shimmer rounded-full w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-slate-700 rounded-full blur-xl opacity-50" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
            <ChefHat className="h-10 w-10 text-slate-600" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-300">No recipes yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Search for recipes or create your first one!
          </p>
        </div>
      </div>
    );
  }

  // No search results state
  if (recipes.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <SearchX className="h-16 w-16 text-slate-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-300">No results found</h3>
          <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id}
          recipe={recipe}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      ))}
    </div>
  );
}
