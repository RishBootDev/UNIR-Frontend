import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

export default function HomeScene() {
  const sphereRef = useRef();

  useFrame((state) => {
    if (sphereRef.current) {
        // Slow rotation
        sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group>
      {/* Ambient Light */}
      <ambientLight intensity={0.5} />
      
      {/* Directional Light for definition */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4285F4" />

      {/* Floating Hero Object */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={sphereRef} args={[1, 100, 100]} scale={2.2}>
          <MeshDistortMaterial
            color="#ffffff"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.1}
            iridescence={1}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[0, 400]}
          />
        </Sphere>
      </Float>

      {/* Floating Particles/Orbs around */}
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
         <Sphere args={[0.2, 32, 32]} position={[3, 2, -2]}>
            <meshStandardMaterial color="#4285F4" emissive="#4285F4" emissiveIntensity={2} toneMapped={false} />
         </Sphere>
         <Sphere args={[0.15, 32, 32]} position={[-3, -1, 1]}>
            <meshStandardMaterial color="#EA4335" emissive="#EA4335" emissiveIntensity={2} toneMapped={false} />
         </Sphere>
         <Sphere args={[0.1, 32, 32]} position={[2, -3, 0]}>
            <meshStandardMaterial color="#FBBC05" emissive="#FBBC05" emissiveIntensity={2} toneMapped={false} />
         </Sphere>
         <Sphere args={[0.25, 32, 32]} position={[-2, 3, -1]}>
            <meshStandardMaterial color="#34A853" emissive="#34A853" emissiveIntensity={2} toneMapped={false} />
         </Sphere>
      </Float>
    </group>
  );
}
