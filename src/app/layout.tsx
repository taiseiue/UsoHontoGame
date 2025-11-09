import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ウソホントゲーム - Two Truths and a Lie',
  description: '2つの本当と1つの嘘を見抜くパーティーゲーム',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
