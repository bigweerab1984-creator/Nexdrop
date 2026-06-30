'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, Suspense } from 'react';
import { Mesh, Group } from 'three';
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';

function ProductBox({ position, color, speed }: { position: [number, number, number], color: string, speed: number }) {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    meshRef.current.rotation.x = Math.cos(t / 4) / 2;
    meshRef.current.rotation.y = Math.sin(t / 4) / 2;
    meshRef.current.rotation.z = Math.sin(t / 4) / 2;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <MeshDistortMaterial
        color={color}
        speed={speed * 2}
        distort={0.3}
        radius={1}
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

      <ProductBox position={[-2.5, 0.5, 0]} color="#00f2ff" speed={1} />
      <ProductBox position={[0, -0.5, 1]} color="#7000ff" speed={1.2} />
      <ProductBox position={[2.5, 0.8, -1]} color="#00e5a0" speed={0.8} />

      <Environment preset="city" />
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
    </>
  );
}

export default function StorefrontHero3D() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
