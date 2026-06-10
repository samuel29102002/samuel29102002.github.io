import type { Metadata, Viewport } from 'next';
import { Oswald, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import Nav from '@/components/nav';
import CrosshairCursor from '@/components/cursor';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://samuel29102002.github.io'),
  title: {
    default: 'SAMUEL HEINRICH — QDS / DATA ENGINEER',
    template: '%s · Samuel Heinrich',
  },
  description:
    'Quantitative Data Science MSc. Data engineering, audit analytics, roguelikes.',
  authors: [{ name: 'Samuel Heinrich' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://samuel29102002.github.io/',
    siteName: 'Samuel Heinrich',
    title: 'SAMUEL HEINRICH — QDS / DATA ENGINEER',
    description:
      'Quantitative Data Science MSc. Data engineering, audit analytics, roguelikes.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAMUEL HEINRICH — QDS / DATA ENGINEER',
    description:
      'Quantitative Data Science MSc. Data engineering, audit analytics, roguelikes.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-bg font-body text-text antialiased">
        <CrosshairCursor />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
