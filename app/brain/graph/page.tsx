'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function GraphPage() {
  const [nodes, setNodes] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching knowledge connections
    const mockNodes = [
      { id: 'Brain', x: 500, y: 300, size: 40, color: 'var(--accent)' },
      { id: 'Obsidian', x: 300, y: 150, size: 30, color: 'var(--accent2)' },
      { id: 'Products', x: 700, y: 150, size: 30, color: '#ff47d1' },
      { id: 'Tools', x: 300, y: 450, size: 25, color: '#0f0' },
      { id: 'Logs', x: 700, y: 450, size: 25, color: '#fff' }
    ];
    setNodes(mockNodes);
  }, []);

  return (
    <div style={{
      padding: '100px 24px 40px',
      maxWidth: 1200,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800 }}>Knowledge <span style={{ color: 'var(--accent)' }}>Graph</span></h1>
        <p style={{ opacity: 0.6 }}>Visualizing the connections in your second brain.</p>
      </div>

      <div style={{
        width: '100%',
        height: 600,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        position: 'relative'
      }}>
        <svg width="100%" height="100%">
          {/* Mock edges */}
          <line x1="500" y1="300" x2="300" y2="150" stroke="var(--border)" strokeWidth="1" />
          <line x1="500" y1="300" x2="700" y2="150" stroke="var(--border)" strokeWidth="1" />
          <line x1="500" y1="300" x2="300" y2="450" stroke="var(--border)" strokeWidth="1" />
          <line x1="500" y1="300" x2="700" y2="450" stroke="var(--border)" strokeWidth="1" />

          {nodes.map(node => (
            <motion.g
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={node.color}
                style={{ filter: `blur(0px) drop-shadow(0 0 10px ${node.color})` }}
              />
              <text
                x={node.x}
                y={node.y + node.size + 20}
                textAnchor="middle"
                fill="white"
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                {node.id}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    </div>
  );
}
