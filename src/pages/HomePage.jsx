import { Link } from "react-router-dom";
import UNIR_LOGO from "@/assets/UNIR_logo.jpeg";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <header className="py-4 px-6 flex items-center justify-between max-w-[1128px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src={UNIR_LOGO} alt="UNIR" className="w-10 h-10 object-contain" />
          <span className="text-[#1e3a5f] text-2xl font-bold">UNIR</span>
        </Link>
        <nav className="flex items-center gap-6">
          <a href="#" className="text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] text-sm">
            Discover
          </a>
          <a href="#" className="text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] text-sm">
            People
          </a>
          <a href="#" className="text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] text-sm">
            Learning
          </a>
          <Link
            to="/jobs"
            className="text-[rgba(0,0,0,0.6)] hover:text-[rgba(0,0,0,0.9)] text-sm"
          >
            Jobs
          </Link>
          <div className="h-6 w-px bg-[rgba(0,0,0,0.15)]" />
          <Link
            to="/login"
            className="text-[#6ab04c] font-semibold hover:bg-[#e8f5e0] px-4 py-2 rounded-full transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="bg-[#6ab04c] text-white font-semibold px-4 py-2 rounded-full hover:bg-[#5a9a3c] transition-colors"
          >
            Join now
          </Link>
        </nav>
      </header>

      <main className="max-w-[1128px] mx-auto px-6 py-16">
        <div className="flex items-center gap-12">
          <div className="flex-1">
            <h1 className="text-5xl font-light text-[#1e3a5f] leading-tight mb-6">
              Welcome to your professional community
            </h1>
            <div className="space-y-4 max-w-md">
              <button className="w-full py-3 border border-[rgba(0,0,0,0.6)] rounded-full font-semibold text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)] hover:border-black flex items-center justify-center gap-3 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              <Link
                to="/register"
                className="w-full py-3 border border-[rgba(0,0,0,0.6)] rounded-full font-semibold text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)] hover:border-black flex items-center justify-center transition-colors"
              >
                Join with email
              </Link>
              <p className="text-xs text-center text-[rgba(0,0,0,0.6)] pt-2">
                By clicking Continue, you agree to UNIR&apos;s{" "}
                <a href="#" className="text-[#6ab04c] hover:underline">
                  User Agreement
                </a>
                ,{" "}
                <a href="#" className="text-[#6ab04c] hover:underline">
                  Privacy Policy
                </a>
                , and{" "}
                <a href="#" className="text-[#6ab04c] hover:underline">
                  Cookie Policy
                </a>
                .
              </p>
              <p className="text-center text-[rgba(0,0,0,0.9)] pt-4">
                Already on UNIR?{" "}
                <Link to="/login" className="text-[#6ab04c] font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=560&fit=crop"
              alt="Professional networking"
              className="w-full rounded-lg"
            />
          </div>
        </div>

        <section className="mt-24">
          <h2 className="text-4xl font-light text-[rgba(0,0,0,0.9)] text-center mb-12">
            Explore topics you are interested in
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Technology", "Business", "Design", "Marketing", "Finance", "Healthcare", "Education", "Engineering"].map(
              (topic) => (
                <button
                  key={topic}
                  className="px-4 py-2 border border-[rgba(0,0,0,0.6)] rounded-full text-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.04)] hover:border-black transition-colors"
                >
                  {topic}
                </button>
              )
            )}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="text-4xl font-light text-[rgba(0,0,0,0.9)] text-center mb-4">
            Find the right job or internship for you
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              "Engineering",
              "Business Development",
              "Finance",
              "Administrative",
              "Marketing",
              "Sales",
              "Healthcare",
              "Human Resources",
            ].map((role) => (
              <Link
                key={role}
                to="/jobs"
                className="px-6 py-3 bg-[#e8f5e0] text-[#6ab04c] rounded-lg hover:bg-[#d4edc8] transition-colors font-semibold"
              >
                {role}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-24 bg-[#f9fafb] rounded-lg p-12">
          <div className="flex items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl font-light text-[rgba(0,0,0,0.9)] mb-4">
                Post your job for millions of people to see
              </h2>
              <Link
                to="/jobs"
                className="inline-block px-6 py-3 border border-[#6ab04c] text-[#6ab04c] rounded-full font-semibold hover:bg-[#e8f5e0] transition-colors"
              >
                Post a job
              </Link>
            </div>
            <div className="flex-1">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=350&fit=crop"
                alt="Job posting"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#f3f2ef] py-8 border-t border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1128px] mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <img src={UNIR_LOGO} alt="UNIR" className="w-6 h-6 object-contain" />
            <span className="text-[#1e3a5f] font-bold">UNIR</span>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-[rgba(0,0,0,0.6)]">
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              About
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              Accessibility
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              User Agreement
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              Cookie Policy
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              Copyright Policy
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              Brand Policy
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              Guest Controls
            </a>
            <a href="#" className="hover:text-[#6ab04c] hover:underline">
              Community Guidelines
            </a>
          </div>
          <p className="text-sm text-[rgba(0,0,0,0.6)] mt-6">UNIR Corporation © 2024</p>
        </div>
      </footer>
    </div>
  );
}

