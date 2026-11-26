interface ProgressBarProps {
  value: number;
  label: string;
  detail?: string;
  indeterminate?: boolean;
  tone?: 'gold' | 'emerald' | 'error';
  size?: 'sm' | 'md';
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  label,
  detail,
  indeterminate = false,
  tone = 'gold',
  size = 'md',
  showPercent = true,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const trackHeight = size === 'sm' ? 'h-1.5' : 'h-2.5';

  const fillGradient =
    tone === 'emerald'
      ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300'
      : tone === 'error'
        ? 'bg-gradient-to-r from-red-700 via-red-500 to-red-400'
        : 'bg-gradient-to-r from-[#9E6E3B] via-[#D4AF6A] to-[#E7CA91]';

  const percentColor =
    tone === 'emerald'
      ? 'text-emerald-300'
      : tone === 'error'
        ? 'text-red-300'
        : 'text-[#E7CA91]';

  const isActive = indeterminate || (clamped > 0 && clamped < 100);

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-xs font-medium text-[#F5F2EB]">{label}</span>
        {showPercent && (
          <span className={`shrink-0 font-mono text-[11px] font-semibold tabular-nums ${percentColor}`}>
            {indeterminate ? 'En cours…' : `${clamped}%`}
          </span>
        )}
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : clamped}
        className={`relative w-full overflow-hidden rounded-full border border-white/10 bg-[#09090B] ${trackHeight}`}
      >
        {indeterminate ? (
          <div
            className={`absolute inset-y-0 left-0 w-2/5 rounded-full ${fillGradient}`}
            style={{animation: 'progressShimmer 1.35s ease-in-out infinite'}}
          />
        ) : (
          <div
            className={`relative h-full overflow-hidden rounded-full transition-[width] duration-300 ease-out ${fillGradient}`}
            style={{width: `${clamped}%`}}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                style={{animation: 'progressShimmer 1.4s ease-in-out infinite'}}
              />
            )}
          </div>
        )}
      </div>

      {detail && (
        <p className="mt-1.5 truncate font-mono text-[10px] tracking-wide text-stone-400">
          {detail}
        </p>
      )}
    </div>
  );
}
