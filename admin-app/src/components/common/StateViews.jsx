export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-sm text-ink-muted">
      <div className="flex items-center gap-2">
        <span className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-50"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
