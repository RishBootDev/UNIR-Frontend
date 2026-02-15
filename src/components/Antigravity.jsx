/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

const AntigravityInner = ({
  count = 1000,
  magnetRadius = 20,
  ringRadius = 15,
  waveSpeed = 1,
  waveAmplitude = 2,
  particleSize = 1.5,
  lerpSpeed = 0.05,
  colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'], // Google Colors
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0.1,
  depthFactor = 1.5,
  pulseSpeed = 2,
  particleShape = 'capsule',
  fieldStrength = 10,
  mouseSmoothness = 0.1
}) => {
  const meshRef = useRef(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Convert hex colors to THREE.Color
  const colorArray = useMemo(() => colors.map(c => new THREE.Color(c)), [colors]);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    const temp = [];
    // Increase distribution area
    const width = (viewport.width || 100) * 1.5;
    const height = (viewport.height || 100) * 1.5;

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.005 + Math.random() / 200;
      
      // Spherical/Galaxy distribution attempt
      // Random angle
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      // Random radius with some concentration logic if desired, or just uniform box
      // Reference image looks like a uniform field but with depth
      
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 40; // More depth

      const randomRadiusOffset = (Math.random() - 0.5) * 2;
      
      // Assign a random color index
      const colorIndex = Math.floor(Math.random() * colorArray.length);

      temp.push({
        t,
        factor,
        speed,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        vx: 0,
        vy: 0,
        vz: 0,
        randomRadiusOffset,
        colorIndex
      });
    }
    return temp;
  }, [count, viewport.width, viewport.height, colorArray.length]);

  // Attribute for instance colors
  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    
    const count = particles.length;
    const colorData = new Float32Array(count * 3);
    
    particles.forEach((p, i) => {
      const color = colorArray[p.colorIndex];
      color.toArray(colorData, i * 3);
    });
    
    mesh.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorData, 3));
  }, [particles, colorArray]);


  useFrame(state => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { viewport: v, pointer: m } = state;

    const mouseDist = Math.sqrt(Math.pow(m.x - lastMousePos.current.x, 2) + Math.pow(m.y - lastMousePos.current.y, 2));

    if (mouseDist > 0.001) {
      lastMouseMoveTime.current = Date.now();
      lastMousePos.current = { x: m.x, y: m.y };
    }

    let destX = (m.x * v.width) / 2;
    let destY = (m.y * v.height) / 2;

    if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.3) * (v.width / 4);
      destY = Math.cos(time * 0.2) * (v.height / 4);
    }

    const smoothFactor = mouseSmoothness;
    virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;

    particles.forEach((particle, i) => {
      let { t, speed, mx, my, mz, cz, randomRadiusOffset } = particle;

      t = particle.t += speed;

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetPos = { x: mx, y: my, z: mz * depthFactor };

      // Gentle wave/float effect everywhere
      targetPos.x += Math.cos(t * 0.5) * 0.5;
      targetPos.y += Math.sin(t * 0.5) * 0.5;
      
      // Mouse interaction - Repulsion/Magnetic Wave
      if (dist < magnetRadius) {
         // Calculate a smooth falloff
         const influence = 1 - (dist / magnetRadius);
         const repulsion = influence * fieldStrength;
         
         const angle = Math.atan2(dy, dx);
         
         // Move away from mouse
         targetPos.x += Math.cos(angle) * repulsion;
         targetPos.y += Math.sin(angle) * repulsion;
         
         // Also push in Z
         targetPos.z += influence * 5;
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      
      // Look at mouse or just look forward? 
      // Stars usually face camera or look at a point.
      // For "dash" effect, looking at movement direction or a specific point is good.
      // Let's look slightly towards the mouse or center to give the "streaming" look
      dummy.lookAt(targetX, targetY, 50); // Look at virtual mouse/center
      
      const currentDistToMouse = Math.sqrt(
        Math.pow(particle.cx - targetX, 2) + Math.pow(particle.cy - targetY, 2)
      );
      
      // Scaling based on depth and proximity
      let s = particleSize; // Base size
      // Sizing variation
      s *= (0.8 + Math.sin(t * pulseSpeed) * 0.2); 
      
      dummy.scale.set(s, s, s);

      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Use capsule geometry for the "dash" look */}
      <capsuleGeometry args={[0.04, 0.4, 4, 8]} /> {/* thinner and longer relative to width */}
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
};

const Antigravity = props => {
  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <AntigravityInner {...props} />
    </Canvas>
  );
};

export default Antigravity;
