import type { Metadata } from 'next'
import { Inter } from "next/font/google"
import './globals.css'
import { LanguageProvider } from '@/context/language-provider'
import { AuthProvider } from '@/context/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { ConditionalNavbar } from '@/components/conditional-navbar'
const inter = Inter({ subsets: ["latin"] })
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: 'Chinny CRM',
  description: 'by LinkLark',
  generator: 'LinkLark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
       <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <AuthProvider>
              <div className="relative flex min-h-screen flex-col">
                <ConditionalNavbar />
                <main className="flex-1">{children}</main>
                {/* <Footer /> */}
              </div>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
