export function Modal({ open, title, description, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
