'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Float, PerspectiveCamera, Environment, ContactShadows, useTexture } from '@react-three/drei';

function ProductSphere({ index, count, radius, speed, url, name }: { index: number, count: number, radius: number, speed: number, url: string, name: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  const handleClick = () => {
    window.location.href = `/shop?q=${encodeURIComponent(name)}`;
  };

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        castShadow
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        scale={hovered ? 1.1 : 1}
      >
        <sphereGeometry args={[1.08, 64, 64]} />
        <Suspense fallback={<meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />}>
          <ProductMaterial url={url} index={index} count={count} radius={radius} speed={speed} meshRef={meshRef} />
        </Suspense>
      </mesh>
    </Float>
  );
}

function ProductMaterial({ url, index, count, radius, speed, meshRef }: any) {
  // We use a state to handle texture loading errors gracefully
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => {
        console.warn("Failed to load texture:", url);
        setError(true);
      }
    );
  }, [url]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    const angle = (index / count) * Math.PI * 2 + t * 0.2;

    if (meshRef.current) {
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = Math.sin(t + index) * 0.5;

      meshRef.current.rotation.y = -angle + Math.PI / 2;
      meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <meshStandardMaterial
      map={texture}
      color={error ? "#333" : "#ffffff"}
      metalness={0.6}
      roughness={0.2}
      emissive={error ? "#111" : "#ffffff"}
      emissiveIntensity={0.05}
    />
  );
}

function Scene() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const p = data.products || [];
        // Fill up to 30 items
        const filled = [];
        for (let i = 0; i < 30; i++) {
          filled.push(p[i % p.length]);
        }
        setProducts(filled);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <ambientLight intensity={1.5} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={10} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={5} color="#00f2ff" />

      {products.map((p, i) => (
        p && <ProductSphere key={i} index={i} count={products.length} radius={8 + (i % 3)} speed={0.2 + (i % 5) * 0.05} url={p.image} name={p.name} />
      ))}

      <Environment preset="city" />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={25} blur={2.5} far={10} />
    </>
  );
}

export default function StorefrontHero3D() {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'auto',
      background: 'radial-gradient(circle at center, #101216 0%, #050608 100%)'
    }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 4, 12]} fov={45} />
        <Scene />
      </Canvas>
    </div>
  );
}
