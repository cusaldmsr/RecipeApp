import { ChefHat, Plus, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar({ onAddRecipe, recipeCount }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-md opacity-40" />
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500">
                <ChefHat className="h-5 w-5 text-slate-900" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">RecipeVault</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5 font-medium tracking-wider uppercase">
                Dashboard
              </p>
            </div>
          </div>

          {/* Center stats */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/40 border border-slate-700/50 rounded-full px-4 py-1.5">
            <Utensils className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-sm text-slate-300">
              <span className="font-semibold text-emerald-400">{recipeCount}</span>
              <span className="text-slate-500 ml-1">recipes saved</span>
            </span>
          </div>

          {/* Add Recipe button */}
          <Button
            id="add-recipe-btn"
            onClick={onAddRecipe}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Recipe
          </Button>
        </div>
      </div>
    </header>
  );
}
