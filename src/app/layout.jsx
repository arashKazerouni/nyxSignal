import './globals.css';

export const metadata = {
  title: 'NyxSignal — Crypto Market Intelligence',
  description: 'Live market radar, structured research, risk-aware allocation, and prediction tracking.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
