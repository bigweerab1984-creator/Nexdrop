// app/layout.tsx
import Navbar from '@/components/Navbar';
import StorefrontHero3D from '@/components/StorefrontHero3D';
import './globals.css';

export const metadata = {
  title: 'NexDrop',
  description: 'Dropship store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StorefrontHero3D />
        <Navbar />
        <main style={{ paddingTop: 72, position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
