import { Spinner } from "./Spinner";

export function FullPageSpinner({ label = "Loading..." }) {
  return (
    <div className="min-h-screen bg-[#f4f2ee] flex items-center justify-center px-4">
      <div className="unir-card p-6 flex items-center gap-3">
        <Spinner />
        <span className="text-sm text-[rgba(0,0,0,0.6)]">{label}</span>
      </div>
    </div>
  );
}

