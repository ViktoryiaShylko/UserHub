import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dashboard App',
  description: 'Admin dashboard application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-full`}>
        <header className="bg-neutral-800 text-white p-4">
          <h1 className="text-2xl font-bold">UserHub</h1>
        </header>
        
        <main className="flex-grow">
          {children}
        </main>
        
        <footer className="bg-neutral-300 p-4 mt-auto">
          <p>© 2025 Viktoryia Shylko Company</p>
        </footer>
      </body>
    </html>
  )
}