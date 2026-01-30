import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AIAssistant } from '@/components/features/ai-assistant'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}
