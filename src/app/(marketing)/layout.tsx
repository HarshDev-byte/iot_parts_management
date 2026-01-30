import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <span className="text-xl font-bold">LabInventory</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="text-sm font-medium hover:text-blue-600">
              Features
            </Link>
            <Link href="/#pricing" className="text-sm font-medium hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-blue-600">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-blue-600">
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-gray-50 dark:bg-gray-900">
        <div className="container px-6 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600" />
                <span className="text-xl font-bold">LabInventory</span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                Modern inventory management for educational institutions
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/#features" className="text-gray-600 hover:text-blue-600">Features</Link></li>
                <li><Link href="/#pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link></li>
                <li><Link href="/docs" className="text-gray-600 hover:text-blue-600">Documentation</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-blue-600">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-blue-600">Terms of Service</Link></li>
                <li><Link href="/security" className="text-gray-600 hover:text-blue-600">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} LabInventory. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
