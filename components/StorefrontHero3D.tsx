'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Float, PerspectiveCamera, Environment, ContactShadows, useTexture, Html, Sparkles } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

function ProductSphere({ index, count, radius, speed, url, name }: { index: number, count: number, radius: number, speed: number, url: string, name: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    // Open Quick View instead of redirect
    (window as any).showQuickView?.({ name, url });
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

        {hovered && (
          <Html distanceFactor={10} position={[0, 1.5, 0]}>
            <div style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              border: '1px solid var(--accent)',
              boxShadow: '0 0 10px var(--accent)',
              fontFamily: 'inherit',
              fontWeight: 600
            }}>
              {name}
            </div>
          </Html>
        )}
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
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const p = data.products || [];
        const filled = [];
        for (let i = 0; i < 30; i++) {
          filled.push(p[i % p.length]);
        }
        setProducts(filled);
      })
      .catch(() => {});

    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={20} castShadow color="#00f2ff" />
      <pointLight position={[-10, -10, -10]} intensity={10} color="#ff00d4" />

      <Sparkles count={100} scale={20} size={2} speed={0.4} color="#00f2ff" />

      {products.map((p, i) => (
        p && <ProductSphere key={i} index={i} count={products.length} radius={8 + (i % 3)} speed={0.2 + (i % 5) * 0.05} url={p.image} name={p.name} />
      ))}

      <Environment preset="night" />
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={25} blur={2.5} far={10} />
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
      background: 'radial-gradient(circle at center, #101216 0%, #050608 100%)'
    }}>
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 4, 12]} fov={45} />
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
            <img src={quickView.url} style={{ width: '100%', borderRadius: 12, marginBottom: 20 }} alt={quickView.name} />
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
