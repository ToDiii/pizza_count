import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pizza Count 🍕",
  description: "Trackt jede gemeinsam gegessene Pizza",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pizza Count",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* Block all mobile zoom: pinch, double-tap, keyboard-triggered */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('gesturestart', function(e) { e.preventDefault(); });
          document.addEventListener('gesturechange', function(e) { e.preventDefault(); });
          document.addEventListener('gestureend', function(e) { e.preventDefault(); });
          document.addEventListener('touchmove', function(e) {
            if (e.touches.length > 1) e.preventDefault();
          }, { passive: false });
          var lastTouchEnd = 0;
          document.addEventListener('touchend', function(e) {
            var now = Date.now();
            if (now - lastTouchEnd <= 300) e.preventDefault();
            lastTouchEnd = now;
          }, false);
        `}} />
      </head>
      <body className="min-h-full flex flex-col bg-[#FFF8F0] text-[#1a1a1a]">
        {children}
      </body>
    </html>
  );
}
