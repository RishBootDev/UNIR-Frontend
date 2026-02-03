import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f4f2ee] flex items-center justify-center px-4">
      <div className="unir-card p-8 max-w-[520px] w-full text-center">
        <h1 className="text-2xl font-semibold text-[rgba(0,0,0,0.9)]">Page not found</h1>
        <p className="mt-2 text-[rgba(0,0,0,0.6)]">The page you’re looking for doesn’t exist.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="unir-btn-secondary">
            Go home
          </Link>
          <Link to="/feed" className="unir-btn-primary">
            Go to feed
          </Link>
        </div>
      </div>
    </div>
  );
}

