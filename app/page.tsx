// app/page.tsx
// Landing page — replaces the old redirect-to-/shop behavior.
// Bold, warm-toned storefront intro with a trust-building reviews section.
// Fonts (Space Grotesk for display, Inter for body, Space Mono for labels)
// are loaded via <link> tags in app/layout.tsx — see that file.

export default function Home() {
  const reviews = [
    {
      name: 'Priya S.',
      rating: 5,
      text: "Found a desk lamp here I couldn't find anywhere else for under £20. Showed up in 6 days, exactly as pictured.",
      rotate: -3,
    },
    {
      name: 'Marcus T.',
      rating: 5,
      text: 'Genuinely surprised by the checkout — fast, no weird upsells, and tracking updated the whole way.',
      rotate: 2,
    },
    {
      name: 'Aisha K.',
      rating: 5,
      text: "Ordered three things in one go. All arrived separately but all arrived, and the prices beat every site I'd checked.",
      rotate: -2,
    },
    {
      name: 'Daniel R.',
      rating: 5,
      text: 'Customer support actually replied within a day when I had a sizing question. Did not expect that.',
      rotate: 3,
    },
  ];

  return (
    <div
      style={{
        background: '#FFF8EE',
        color: '#1A1A2E',
        minHeight: '100vh',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* ---------- HERO ---------- */}
      <section
        style={{
          position: 'relative',
          padding: '72px 24px 56px',
          maxWidth: 720,
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            transform: 'rotate(-8deg)',
            background: '#FFC857',
            color: '#1A1A2E',
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            padding: '6px 14px',
            borderRadius: 4,
            marginBottom: 28,
            boxShadow: '2px 3px 0 rgba(26,26,46,0.15)',
            letterSpacing: '0.02em',
          }}
        >
          NEW FINDS DAILY ✂
        </div>

        <h1
          style={{
            fontFamily: "'Space Grotesk', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(40px, 9vw, 64px)',
            lineHeight: 1.04,
            margin: '0 0 20px',
            letterSpacing: '-0.02em',
          }}
        >
          Good stuff.
          <br />
          <span style={{ color: '#FF4D6D' }}>Stupid good prices.</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.5,
            color: '#1A1A2E',
            opacity: 0.75,
            maxWidth: 460,
            margin: '0 auto 32px',
          }}
        >
          NexDrop hunts down genuinely useful, slightly unexpected things —
          and gets them to your door without the markup.
        </p>

        <a
          href="/shop"
          style={{
            display: 'inline-block',
            background: '#FF4D6D',
            color: '#FFF8EE',
            fontWeight: 700,
            fontSize: 17,
            padding: '16px 36px',
            borderRadius: 10,
            textDecoration: 'none',
            boxShadow: '0 6px 0 #C7384F',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          Start browsing →
        </a>
      </section>

      {/* ---------- TRUST TICKER ---------- */}
      <div
        style={{
          background: '#1A1A2E',
          color: '#FFF8EE',
          padding: '14px 0',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            gap: 48,
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.04em',
            paddingLeft: 24,
          }}
        >
          {Array(3)
            .fill([
              '⚡ FAST SHIPPING',
              '🔒 SECURE CHECKOUT',
              '⭐ REAL REVIEWS',
              '↩ EASY RETURNS',
            ])
            .flat()
            .map((item, i) => (
              <span key={i} style={{ color: '#06D6A0' }}>
                {item}
              </span>
            ))}
        </div>
      </div>

      {/* ---------- REVIEWS ---------- */}
      <section
        style={{
          padding: '64px 24px 80px',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontFamily: "'Space Grotesk', Inter, sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(28px, 5vw, 38px)',
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          People keep coming back
        </h2>
        <p
          style={{
            textAlign: 'center',
            opacity: 0.65,
            fontSize: 15,
            marginBottom: 48,
          }}
        >
          A few words from people who've actually ordered.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 24,
          }}
        >
          {reviews.map((r, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(26,26,46,0.08)',
                borderRadius: 14,
                padding: '24px 22px',
                transform: `rotate(${r.rotate}deg)`,
                boxShadow: '0 4px 14px rgba(26,26,46,0.06)',
              }}
            >
              <div style={{ marginBottom: 10, letterSpacing: '2px' }}>
                {'★'.repeat(r.rating)}
                <span style={{ color: 'rgba(26,26,46,0.15)' }}>
