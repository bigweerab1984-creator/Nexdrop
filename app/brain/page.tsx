'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrainPage() {
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
      // Optional: auto-send after voice?
    };

    recognition.start();
    // @ts-ignore
    window.recognition = recognition;
  };

  return (
    <div style={{
      padding: '100px 24px 40px',
      maxWidth: 1000,
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      background: 'var(--bg)',
      color: 'var(--text)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: 12
        }}>
          Second <span style={{ color: 'var(--accent)' }}>Brain</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: 18 }}>Chat, listen, solve problems, and sync with Obsidian.</p>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          minHeight: 500,
          maxHeight: '70vh',
          overflowY: 'auto'
        }}
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.3,
                flexDirection: 'column',
                gap: 16
              }}
            >
               <div style={{ fontSize: 48 }}>🧠</div>
               <p>Your brain is ready. Ask me anything.</p>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                background: msg.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                padding: '16px 24px',
                borderRadius: 20,
                color: msg.role === 'user' ? '#fff' : 'var(--text)',
                position: 'relative',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.5 }}>
                {msg.content}
              </div>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => saveToObsidian(msg.content)}
                  style={{
                    marginTop: 12,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'var(--text)',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  📥 Save to Obsidian
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ alignSelf: 'flex-start', opacity: 0.5, marginLeft: 24 }}
          >
            Thinking...
          </motion.div>
        )}
      </div>

      <div style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        padding: '8px 8px 8px 24px',
        borderRadius: 50,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
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
          placeholder="What's on your mind?"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            fontSize: 16,
            outline: 'none',
            padding: '12px 0'
          }}
        />
        <button
          onClick={toggleListen}
          title={isListening ? "Stop listening" : "Start listening"}
          style={{
            background: isListening ? 'var(--accent)' : 'transparent',
            border: 'none',
            color: isListening ? '#fff' : 'var(--text)',
            width: 44,
            height: 44,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            transition: 'all 0.2s ease'
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
            padding: '12px 32px',
            borderRadius: 50,
            fontWeight: 800,
            cursor: 'pointer',
            opacity: (isLoading || !input.trim()) ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
