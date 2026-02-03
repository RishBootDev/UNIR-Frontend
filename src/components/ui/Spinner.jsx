export function Spinner({ className = "" }) {
  return (
    <div
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-[rgba(0,0,0,0.2)] border-t-[rgba(0,0,0,0.6)] ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}

