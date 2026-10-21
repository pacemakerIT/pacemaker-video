import type { Metadata } from 'next';
import Providers from './providers';
import './globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/components/features/workshops/calendar-custom.css';

export const metadata: Metadata = {
  title: {
    default: 'PaceUp Career | Career Development',
    template: '%s | PaceUp Career'
  },
  description:
    'Build your career with practical courses, workshops, and resources from PaceUp Career.'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
