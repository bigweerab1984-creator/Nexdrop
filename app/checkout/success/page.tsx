// app/checkout/success/page.tsx
//
// This page only shows a confirmation message. It does NOT trigger the
// supplier order — that already happened server-side via the Stripe
// webhook the moment payment was confirmed. This separation matters:
// a customer could land here from a stale link or hit refresh, and
// nothing bad should happen if they do.
export default function SuccessPage() {
  return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Thank you for your order! 🎉</h1>
      <p style={{ color: 'var(--muted)' }}>
        Your payment was successful. We&apos;ve sent your order to our supplier for fulfillment
        and you&apos;ll receive tracking details by email once it ships.
      </p>
    </div>
  );
}
