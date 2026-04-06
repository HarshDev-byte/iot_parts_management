'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { SmartSearch, SmartSearchTrigger } from '@/components/features/smart-search'
import { NotificationCenter } from '@/components/features/notification-center'
import { UserProfileDropdown } from '@/components/layout/user-profile-dropdown'

interface HeaderProps {
  title?: string
  subtitle?: string
  rightContent?: React.ReactNode
}

export function Header({ title, subtitle, rightContent }: HeaderProps) {
  const { data: session } = useSession()
  const [searchOpen, setSearchOpen] = useState(false)

  // Redirect to signin if no session
  if (!session?.user) {
    return null
  }

  const currentUser = session.user

  const handleSelectComponent = (componentId: string) => {
    // Navigate to component or handle selection
    console.log('Selected component:', componentId)
    // You could navigate to the component page or add to cart, etc.
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Component Search */}
          <SmartSearchTrigger onClick={() => setSearchOpen(true)} />
          
          <SmartSearch
            open={searchOpen}
            onOpenChange={setSearchOpen}
            onSelectComponent={handleSelectComponent}
            userId={currentUser.id}
          />

          {/* Custom Right Content (e.g., Return Notifications) */}
          {rightContent}

          {/* Notifications */}
          <NotificationCenter />

          {/* User Profile Dropdown */}
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  )
}