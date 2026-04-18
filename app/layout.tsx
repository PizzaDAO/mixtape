import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import localFont from 'next/font/local';
import { Providers } from '@/providers/Providers';
import './globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
});

const naiche = localFont({
  src: '../public/fonts/Naiche-ExtraBlack.otf',
  variable: '--font-naiche',
});

export const metadata: Metadata = {
  title: 'PizzaDAO Mixtape',
  description: 'Buy, own, and stream the PizzaDAO Mixtape NFT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} ${naiche.variable} font-[family-name:var(--font-rubik)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
