import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera, Sparkles, Cloud, Float } from "@react-three/drei";
import { Suspense } from "react";
import FloatingShape from "./FloatingShapes";

export default function GravityScene() {
  return (
    <div className="fixed inset-0 -z-10 bg-white">
      <Canvas dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />

          {/* Dynamic Colorful Lighting */}
          <ambientLight intensity={0.5} />
          {/* Brand Color Spotlights for vibrant atmosphere */}
          <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={200} color="#4285F4" castShadow />
          <spotLight position={[-10, -5, 10]} angle={0.5} penumbra={1} intensity={200} color="#EA4335" castShadow />
          <pointLight position={[0, 10, -10]} intensity={100} color="#FBBC05" />
          <pointLight position={[0, -10, 5]} intensity={100} color="#34A853" />

          {/* Dreamy Clouds for depth */}
          <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
            <Cloud position={[-10, 5, -15]} speed={0.2} opacity={0.3} color="#E8F0FE" />
            <Cloud position={[10, -5, -20]} speed={0.2} opacity={0.3} color="#FCE8E6" />
          </Float>

          {/* Colorful Sparkles - Google Brand Colors */}
          {/* Blue Sparkles */}
          <Sparkles count={80} scale={15} size={6} speed={0.4} opacity={0.8} color="#4285F4" noise={0.1} />
          {/* Red Sparkles */}
          <Sparkles count={80} scale={15} size={6} speed={0.3} opacity={0.8} color="#EA4335" noise={0.2} />
          {/* Yellow Sparkles */}
          <Sparkles count={80} scale={15} size={6} speed={0.5} opacity={0.8} color="#FBBC05" noise={0.1} />
          {/* Green Sparkles */}
          <Sparkles count={80} scale={15} size={6} speed={0.4} opacity={0.8} color="#34A853" noise={0.2} />
          
          {/* Base Dark Sparkles for Contrast */}
          <Sparkles count={50} scale={20} size={3} speed={0.2} opacity={0.4} color="#1e3a5f" />

          {/* Floating Objects - Enhanced with better materials */}
          <group>
            {/* Center abstract structure */}
            <FloatingShape position={[0, 0, 0]} geometry="icosahedron" color="#ffffff" scale={1} rotationIntensity={0.8} floatIntensity={2} />
            
            {/* Surrounding Nodes - Vibrant Colors */}
            <FloatingShape position={[-4, 3, -2]} geometry="box" color="#4285F4" speed={1.5} rotationIntensity={1.5} />
            <FloatingShape position={[4, -3, -3]} geometry="sphere" color="#34A853" speed={1.2} rotationIntensity={1} />
            <FloatingShape position={[-3, -4, 0]} geometry="icosahedron" color="#FBBC05" speed={1} scale={0.8} />
            <FloatingShape position={[3, 4, -1]} geometry="box" color="#EA4335" speed={1.8} />
            
            {/* Distant background shapes */}
            <FloatingShape position={[-6, 0, -8]} geometry="sphere" color="#AECBFA" scale={0.6} speed={0.5} />
            <FloatingShape position={[7, 2, -10]} geometry="box" color="#FAD2CF" scale={0.7} speed={0.5} />
          </group>
          
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
      
      {/* Overlay gradient to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/70 pointer-events-none" />
    </div>
  );
}
