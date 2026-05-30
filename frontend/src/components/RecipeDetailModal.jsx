import {
  Clock,
  Flame,
  Users,
  ChefHat,
  BookOpen,
  CheckCircle2,
  ListChecks,
  X,
  Pencil,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RecipeDetailModal({ recipe, isOpen, onClose, onEdit }) {
  if (!isOpen || !recipe) return null;

  const {
    _id,
    name,
    image,
    source,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    ingredients = [],
    instructions = [],
  } = recipe;

  const totalTime = (prepTimeMinutes || 0) + (cookTimeMinutes || 0);

  const sourceVariant =
    source === 'User'      ? 'amber' :
    source === 'DummyJSON' ? 'blue'  : 'secondary';

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Recipe detail: ${name}`}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">

        {/* ── Hero image ── */}
        <div className="relative h-52 shrink-0 overflow-hidden bg-slate-800">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ChefHat className="h-20 w-20 text-slate-700" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Source badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={sourceVariant} className="backdrop-blur-sm bg-slate-900/60">
              {source}
            </Badge>
          </div>

          {/* Close button */}
          <button
            id="detail-modal-close"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-sm text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title overlaid on gradient */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-2xl font-bold text-white leading-tight line-clamp-2">
              {name}
            </h2>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Stats bar */}
          <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
            <StatCell icon={<Clock className="h-4 w-4 text-emerald-400" />} label="Prep" value={prepTimeMinutes > 0 ? `${prepTimeMinutes} min` : '—'} />
            <StatCell icon={<Flame className="h-4 w-4 text-orange-400" />}  label="Cook" value={cookTimeMinutes > 0 ? `${cookTimeMinutes} min` : '—'} />
            <StatCell icon={<Users className="h-4 w-4 text-blue-400" />}    label="Serves" value={servings > 0 ? servings : '—'} />
          </div>

          <div className="p-6 space-y-7">
            {/* ── Ingredients ── */}
            {ingredients.length > 0 && (
              <section>
                <SectionHeader icon={<ListChecks className="h-5 w-5 text-emerald-400" />} title="Ingredients" count={ingredients.length} />
                <ul className="mt-3 space-y-2">
                  {ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3 group">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      </span>
                      <span className="text-sm text-slate-300 leading-relaxed">{ing}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── Instructions ── */}
            {instructions.length > 0 && (
              <section>
                <SectionHeader icon={<BookOpen className="h-5 w-5 text-blue-400" />} title="Instructions" count={instructions.length + ' steps'} />
                <ol className="mt-3 space-y-4">
                  {instructions.map((step, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Empty state */}
            {ingredients.length === 0 && instructions.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <ChefHat className="h-12 w-12 text-slate-700" />
                <p className="text-slate-500 text-sm">No details available for this recipe yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4 shrink-0">
          <div className="text-xs text-slate-500">
            {totalTime > 0 && <span>⏱ Total time: <strong className="text-slate-300">{totalTime} min</strong></span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              id={`detail-edit-${_id}`}
              size="sm"
              onClick={() => { onClose(); onEdit(recipe); }}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Recipe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function StatCell({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 px-4">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-base font-bold text-white">{value}</span>
    </div>
  );
}

function SectionHeader({ icon, title, count }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-white text-base">{title}</h3>
      </div>
      <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
        {count}
      </span>
    </div>
  );
}
