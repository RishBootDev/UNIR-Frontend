import { useEffect } from 'react';

export default function ExternalRedirect({ url }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to HireSense...</p>
    </div>
  );
}
