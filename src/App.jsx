import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import RequireAuth from "@/routes/RequireAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FullPageSpinner } from "@/components/ui/FullPageSpinner";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const JobsPage = lazy(() => import("@/pages/JobsPage"));
const NetworkPage = lazy(() => import("@/pages/NetworkPage"));
const MessagingPage = lazy(() => import("@/pages/MessagingPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageSpinner />}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/feed" replace /> : <HomePage />} />

          <Route path="/login" element={isAuthenticated ? <Navigate to="/feed" replace /> : <LoginPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/onboarding" replace /> : <RegisterPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/messaging" element={<MessagingPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}