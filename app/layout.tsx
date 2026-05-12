import './globals.css'

export const metadata = {
  title: 'Street Market',
  description: 'Buy & sell in your hood',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
}