import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RAJ AI APP BUILDER | AI-Powered React Generator',
  description: 'Transform natural language into production-ready React applications with real-time AI streaming.',
  keywords: ['AI', 'React', 'code generation', 'Cerebras', 'app builder'],
  authors: [{ name: 'Raj Shah', url: 'https://github.com/rajshah9305' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
