'use client';

import { useFrame, useLoader } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';

const PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400&h=400',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400&h=400',
];

function ProductCard({ url, position, index }: { url: string; position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Attempt to load texture, but keep a fallback color
  const texture = useLoader(THREE.TextureLoader, url);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const angle = (index / PRODUCT_IMAGES.length) * Math.PI * 2 + time * 0.2;
      const radius = 4.5;
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = position[1] + Math.sin(time + index) * 0.4;
      meshRef.current.rotation.y = -angle + Math.PI / 2;
      meshRef.current.rotation.x = Math.sin(time * 0.5 + index) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.8, 1.8, 0.05]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? '#ffffff' : '#6c47ff'}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function RotatingProducts() {
  return (
    <group position={[0, 0, 0]}>
      <Suspense fallback={null}>
        {PRODUCT_IMAGES.map((url, i) => {
          const yPos = ((i - (PRODUCT_IMAGES.length - 1) / 2) * 1.5);
          return (
            <ProductCard
              key={url}
              url={url}
              position={[0, yPos, 0]}
              index={i}
            />
          );
        })}
      </Suspense>
    </group>
  );
}
