import './globals.css';
import type { Metadata } from 'next';
import { Inter, Nunito_Sans, Playfair_Display } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const nunitoSans = Nunito_Sans({ subsets: ['latin'], weight: ['400', '700'] });
const playfairDisplay = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'Disputare',
  description: 'AI chat app that plays devil\'s advocate',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${nunitoSans.className}`}>{children}</body>
    </html>
  );
}