import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

export default function FloatingShape({ position, color, speed = 1, rotationIntensity = 1, floatIntensity = 1, scale = 1, geometry = "box" }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state, delta) => {
    // Add subtle rotation
    meshRef.current.rotation.x += delta * 0.2 * speed;
    meshRef.current.rotation.y += delta * 0.1 * speed;
  });

  return (
    <Float
      speed={speed} // Animation speed, defaults to 1
      rotationIntensity={rotationIntensity} // XYZ rotation intensity, defaults to 1
      floatIntensity={floatIntensity} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
      floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
    >
      <mesh
        ref={meshRef}
        position={position}
        scale={hovered ? scale * 1.1 : scale}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        {geometry === "box" && <boxGeometry args={[1, 1, 1]} />}
        {geometry === "sphere" && <sphereGeometry args={[0.7, 32, 32]} />}
        {geometry === "icosahedron" && <icosahedronGeometry args={[0.8, 0]} />}
        
        <meshStandardMaterial
          color={hovered ? "#ffffff" : color}
          originalColor={color}
          roughness={0.3}
          metalness={0.8}
          emissive={hovered ? color : "#000000"}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
    </Float>
  );
}
