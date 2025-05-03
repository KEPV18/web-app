
import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from '@/contexts/LanguageContext'; // Import LanguageProvider

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

// Metadata can be dynamic based on language later if needed
export const metadata: Metadata = {
  title: 'Video Analytics Pro',
  description: 'Productivity tracking app for video content creators',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: The lang and dir attributes on <html> will be managed by LanguageProvider effect
  return (
    <html lang="en" dir="ltr" className="dark"> {/* Initial values, will be updated by context */}
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans antialiased`}>
        <LanguageProvider> {/* Wrap children with LanguageProvider */}
          {children}
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              // Default style (used for info/loading)
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#28a745',
                  color: '#fff',
                },
              },
              error: {
                style: {
                  background: '#dc3545',
                  color: '#fff',
                },
              },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  );
}

