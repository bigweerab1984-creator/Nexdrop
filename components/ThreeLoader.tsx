'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';
import { Float } from '@react-three/drei';

function LoadingBox() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#6c47ff" wireframe />
    </mesh>
  );
}

export default function ThreeLoader() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0b0f' }}>
      <div style={{ width: '300px', height: '300px' }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Float speed={4} rotationIntensity={1} floatIntensity={2}>
             <LoadingBox />
          </Float>
        </Canvas>
      </div>
      <h2 style={{ color: '#e8eaf2', marginTop: '20px' }}>Loading...</h2>
    </div>
  );
}
