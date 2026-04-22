import './globals.css';
import './assessment.css';
import Navbar from '../components/Navbar';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

export const metadata = {
  title: 'Career For Everyone',
  description: 'Your career path starts here',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <I18nProvider>
          <Navbar />
          <main>{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}