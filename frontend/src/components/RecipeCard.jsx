import {
  Clock, Users, Pencil, Trash2, ChefHat, Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RecipeCard({ recipe, onEdit, onDelete, onView }) {
  const {
    _id,
    name,
    image,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    source,
    ingredients,
  } = recipe;

  const totalTime = (prepTimeMinutes || 0) + (cookTimeMinutes || 0);

  const sourceVariant =
    source === 'User'      ? 'amber' :
    source === 'DummyJSON' ? 'blue'  : 'secondary';

  return (
    <div
      className="recipe-card glass-card rounded-2xl overflow-hidden flex flex-col group"
      data-recipe-card
    >
      {/* ── Image ── */}
      <div className="relative aspect-video overflow-hidden bg-slate-800">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-800"
          style={{ display: image ? 'none' : 'flex' }}
        >
          <ChefHat className="h-12 w-12 text-slate-600" />
        </div>

        {/* Source badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={sourceVariant} className="text-[10px] backdrop-blur-sm bg-slate-900/70">
            {source}
          </Badge>
        </div>

        {/* Action buttons — revealed on hover */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          {/* View */}
          <button
            id={`view-recipe-${_id}`}
            onClick={() => onView(recipe)}
            aria-label="View recipe"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-700/50 transition-all duration-200"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {/* Edit */}
          <button
            id={`edit-recipe-${_id}`}
            onClick={() => onEdit(recipe)}
            aria-label="Edit recipe"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-emerald-400 hover:bg-slate-900 border border-slate-700/50 transition-all duration-200"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {/* Delete */}
          <button
            id={`delete-recipe-${_id}`}
            onClick={() => onDelete(_id)}
            aria-label="Delete recipe"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-red-400 hover:bg-slate-900 border border-slate-700/50 transition-all duration-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-white leading-snug line-clamp-2 text-[15px]">
          {name}
        </h3>

        {ingredients && ingredients.length > 0 && (
          <p className="text-xs text-slate-500">
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Stats row */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium">
              {totalTime > 0 ? `${totalTime} min` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Users className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium">
              {servings > 0 ? `${servings} serving${servings !== 1 ? 's' : ''}` : '—'}
            </span>
          </div>
        </div>

        {/* View button — always visible at bottom */}
        <button
          onClick={() => onView(recipe)}
          className="mt-1 w-full rounded-xl border border-slate-700/60 bg-slate-800/40 py-1.5 text-xs font-medium text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300 transition-all duration-200"
        >
          View Recipe →
        </button>
      </div>
    </div>
  );
}
