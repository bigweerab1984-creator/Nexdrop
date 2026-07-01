'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, Suspense, useState, useEffect, useMemo, Component } from 'react';
import * as THREE from 'three';
import { Float, PerspectiveCamera, Environment, ContactShadows, Html, Sparkles, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

// Error boundary for individual spheres to prevent one failure from crashing the whole scene
class TextureErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ProductSphere({ product, index }: { product: any; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  // Try to load texture - if it fails, the ErrorBoundary will catch it
  const texture = useLoader(THREE.TextureLoader, product.image) as THREE.Texture;

  const initialPos = useMemo(() => [
    (Math.random() - 0.5) * 80,
    (Math.random() - 0.5) * 80,
    (Math.random() - 0.5) * 80
  ], []);

  const speed = useMemo(() => 0.1 + Math.random() * 0.3, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed + index;
    meshRef.current.position.x = initialPos[0] + Math.cos(t) * 10;
    meshRef.current.position.y = initialPos[1] + Math.sin(t) * 10;
    meshRef.current.position.z = initialPos[2] + Math.sin(t * 0.5) * 10;

    // Scale oscillation - fix the inversion/flicker
    const s = 1.5 + Math.abs(Math.cos(t)) * 1.5;
    meshRef.current.scale.set(s, s, s);

    meshRef.current.rotation.y += 0.01;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => (window as any).showQuickView?.(product)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? '#fff' : '#00f2ff'}
          metalness={0.5}
          roughness={0.2}
        />
        {hovered && (
          <Html distanceFactor={15}>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              fontSize: 12,
              border: '1px solid var(--accent)'
            }}>
              {product.name}
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

function Scene() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(() => {});
  }, []);

  const displayProducts = useMemo(() => products.slice(0, 30), [products]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={200} color="#00f2ff" />
      <pointLight position={[-50, -50, -50]} intensity={100} color="#ff00d4" />

      <Sparkles count={200} scale={100} size={2} speed={0.2} color="#00f2ff" />

      <Suspense fallback={<Text position={[0, 0, 0]} fontSize={2} color="white">Loading 3D Experience...</Text>}>
        {displayProducts.map((p, i) => (
          <TextureErrorBoundary key={p.id}>
            <ProductSphere product={p} index={i} />
          </TextureErrorBoundary>
        ))}
      </Suspense>

      <Environment preset="night" />
    </>
  );
}

export default function StorefrontHero3D() {
  const [quickView, setQuickView] = useState<any>(null);

  useEffect(() => {
    (window as any).showQuickView = setQuickView;
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'auto',
      background: '#050608'
    }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 100]} fov={50} />
        <Scene />
      </Canvas>

      <AnimatePresence>
        {quickView && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(10, 12, 16, 0.95)',
              border: '1px solid var(--accent)',
              borderRadius: 24,
              padding: 32,
              zIndex: 1000,
              width: 400,
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 80px rgba(0, 242, 255, 0.2)'
            }}
          >
            <img src={quickView.image || quickView.url} style={{ width: '100%', borderRadius: 12, marginBottom: 20 }} alt={quickView.name} />
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{quickView.name}</h2>
            <p style={{ opacity: 0.6, marginBottom: 24 }}>Explore this premium item in our collection.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => window.location.href = `/shop?q=${encodeURIComponent(quickView.name)}`}
                style={{
                  flex: 1,
                  background: 'var(--accent)',
                  color: '#000',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 12,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Shop Now
              </button>
              <button
                onClick={() => setQuickView(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '12px 0',
                  borderRadius: 12,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
