'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/contexts/sidebar-context'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  BarChart3,
  Menu,
  ChevronLeft,
  QrCode,
  Shield,
  PackageCheck,
  Plus,
  Eye,
  Target,
  Sparkles,
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isCollapsed, toggleSidebar } = useSidebar()

  // Redirect to signin if no session
  if (!session?.user) {
    return null
  }

  const currentUser = session.user

  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        href: `/dashboard/${currentUser.role?.toLowerCase().replace('_', '-')}`,
        icon: LayoutDashboard,
      },
    ]

    switch (currentUser.role) {
      case 'STUDENT':
        return [
          ...baseItems,
          {
            title: 'My Projects',
            href: '/projects',
            icon: Target,
          },
          {
            title: 'Inventory',
            href: '/inventory/browse',
            icon: Package,
          },
          {
            title: 'Requests',
            href: '/requests/my-requests',
            icon: ClipboardList,
          },
          {
            title: 'New Request',
            href: '/requests/new',
            icon: Plus,
          },
          {
            title: 'Special Requests',
            href: '/requests/special-list',
            icon: Sparkles,
          },
          {
            title: 'Parts Issued',
            href: '/parts-issued',
            icon: PackageCheck,
          },
        ]

      case 'LAB_ASSISTANT':
        return [
          ...baseItems,
          {
            title: 'Browse Inventory',
            href: '/inventory/browse',
            icon: Eye,
          },
          {
            title: 'Manage Inventory',
            href: '/inventory/manage',
            icon: Package,
          },
          {
            title: 'Issue Components',
            href: '/issue-components',
            icon: PackageCheck,
          },
          {
            title: 'QR Scanner',
            href: '/scanner',
            icon: QrCode,
          },
          {
            title: 'All Requests',
            href: '/requests/all',
            icon: ClipboardList,
          },
        ]

      case 'HOD':
        return [
          ...baseItems,
          {
            title: 'Pending Approvals',
            href: '/approvals',
            icon: Shield,
          },
          {
            title: 'Browse Inventory',
            href: '/inventory/browse',
            icon: Eye,
          },
          {
            title: 'Manage Inventory',
            href: '/inventory/manage',
            icon: Package,
          },
          {
            title: 'All Requests',
            href: '/requests/all',
            icon: ClipboardList,
          },
          {
            title: 'User Management',
            href: '/users',
            icon: Users,
          },
        ]

      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute top-2 right-2 h-6 w-6 z-10 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
        {!isCollapsed && (
          <div className="flex flex-col items-center space-y-4 pt-2">
            <img 
              src="/sies_logo_footer-D-Lnp3GI.png" 
              alt="SIES Logo" 
              className="w-32 h-24 object-contain"
            />
            <span className="text-base font-bold text-gray-900 dark:text-white text-center w-full px-1 tracking-wide leading-tight">
              SIES GST IoT Lab
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center pt-2">
            <img 
              src="/sies_logo_footer-D-Lnp3GI.png" 
              alt="SIES Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
        )}
      </div>



      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.title}
                </div>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}