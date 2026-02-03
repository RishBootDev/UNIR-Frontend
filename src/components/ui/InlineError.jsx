export function InlineError({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="unir-card p-4 border border-[rgba(204,16,22,0.25)] bg-[rgba(204,16,22,0.05)]">
      <p className="font-semibold text-[rgba(0,0,0,0.9)]">{title}</p>
      {message && <p className="text-sm text-[rgba(0,0,0,0.6)] mt-1">{message}</p>}
      {onRetry && (
        <button className="mt-3 unir-btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

