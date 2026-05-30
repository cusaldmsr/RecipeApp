import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    secondary: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
    destructive: 'bg-red-500/10 text-red-400 border border-red-500/30',
    outline: 'border border-slate-600 text-slate-300',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Badge };
