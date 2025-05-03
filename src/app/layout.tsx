
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
  // NOTE: The lang, dir, and dark/light class on <html> will be managed by providers/effects
  return (
    // REMOVED hardcoded className="dark"
    // LanguageProvider or a theme provider should handle adding/removing the 'dark' class
    <html lang="en" dir="ltr"> 
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans antialiased bg-background text-foreground transition-colors duration-300`}>
        {/* Added bg-background, text-foreground, transition-colors here for default body styling */}
        <LanguageProvider> {/* Wrap children with LanguageProvider */}
          {children}
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              // Default style (used for info/loading)
              style: {
                // Use CSS variables for theme-aware toasts if possible, or adjust based on dark mode state
                // background: 'var(--toast-background)', 
                // color: 'var(--toast-foreground)',
                background: '#333', // Default dark background
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

