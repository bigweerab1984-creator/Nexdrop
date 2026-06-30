'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecondBrainWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.content) {
        setMessages([...newMessages, { role: 'assistant', content: data.content }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToObsidian = async (content: string) => {
    const title = prompt('Enter a title for the Obsidian note:', 'Brain Note ' + new Date().toLocaleDateString());
    if (!title) return;

    try {
      const res = await fetch('/api/obsidian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${title}.md`,
          content: content,
          mode: 'overwrite'
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Saved to Obsidian!');
      } else {
        alert('Failed to save: ' + data.error);
      }
    } catch (err) {
      alert('Error connecting to Obsidian API bridge');
    }
  };

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      // @ts-ignore
      window.recognition?.stop();
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
    // @ts-ignore
    window.recognition = recognition;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--accent)',
          border: 'none',
          color: '#fff',
          fontSize: 32,
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(108, 71, 255, 0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen ? '✕' : '🧠'}
      </button>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: 100,
              right: 24,
              width: 'min(400px, calc(100vw - 48px))',
              height: 'min(600px, calc(100vh - 140px))',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 24,
              boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
              zIndex: 9998,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(16px)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Second Brain</h3>
                <div style={{ fontSize: 12, opacity: 0.5, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e5a0' }}></div>
                  Ready to help
                </div>
              </div>
              <button
                onClick={() => setMessages([])}
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', opacity: 0.4, cursor: 'pointer', fontSize: 12 }}
              >
                Clear
              </button>
            </div>

            {/* Chat Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                padding: 20,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16
              }}
            >
              {messages.length === 0 && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.3,
                  flexDirection: 'column',
                  gap: 12,
                  textAlign: 'center'
                }}>
                   <div style={{ fontSize: 32 }}>🧠</div>
                   <p style={{ fontSize: 14 }}>I&apos;m working in the background. How can I assist you today?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  padding: '12px 16px',
                  borderRadius: 16,
                  color: msg.role === 'user' ? '#fff' : 'var(--text)',
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => saveToObsidian(msg.content)}
                      style={{
                        marginTop: 8,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text)',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      📥 Obsidian
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', opacity: 0.5, fontSize: 12, marginLeft: 8 }}>Thinking...</div>
              )}
            </div>

            {/* Input Area */}
            <div style={{
              padding: 16,
              borderTop: '1px solid var(--border)',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                padding: '4px 4px 4px 16px',
                borderRadius: 24
              }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: 14,
                    outline: 'none',
                    padding: '8px 0'
                  }}
                />
                <button
                  onClick={toggleListen}
                  style={{
                    background: isListening ? 'var(--accent)' : 'transparent',
                    border: 'none',
                    color: isListening ? '#fff' : 'var(--text)',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16
                  }}
                >
                  {isListening ? '🛑' : '🎤'}
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  style={{
                    background: 'var(--accent2)',
                    color: '#000',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    opacity: (isLoading || !input.trim()) ? 0.5 : 1
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
