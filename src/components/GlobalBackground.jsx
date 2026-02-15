import { Suspense } from "react";
import Antigravity from "./Antigravity";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-50 bg-white pointer-events-none">
      <Suspense fallback={null}>
        <Antigravity
          count={2000} // More particles for star field
          magnetRadius={15}
          ringRadius={15}
          waveSpeed={0.5}
          particleSize={0.6} // Smaller for stars
          lerpSpeed={0.05}
          colors={['#4285F4', '#EA4335', '#FBBC05', '#34A853']} // Google colors
          autoAnimate={true}
          particleVariance={0.8}
          rotationSpeed={0.05}
          depthFactor={1.5}
          pulseSpeed={1}
          particleShape="capsule"
          fieldStrength={10}
          mouseSmoothness={0.08}
        />
      </Suspense>
    </div>
  );
}
