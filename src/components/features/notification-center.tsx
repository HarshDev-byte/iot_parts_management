'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  Package,
  Users,
  TrendingUp
} from 'lucide-react'
import { useNotifications } from '@/lib/websocket'
import { useWebSocketContext } from '@/components/providers'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Arduino Uno R3 is running low (5 units remaining)',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      actionUrl: '/inventory/manage',
      metadata: { componentId: '1', currentStock: 5 }
    },
    {
      id: '2',
      type: 'success',
      title: 'Request Approved',
      message: 'Your request for ESP32 DevKit has been approved by Dr. Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      actionUrl: '/requests/my-requests',
      metadata: { requestId: '123', approver: 'Dr. Smith' }
    },
    {
      id: '3',
      type: 'info',
      title: 'New Component Added',
      message: 'Raspberry Pi 5 has been added to the inventory',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      actionUrl: '/inventory/browse',
      metadata: { componentId: '456' }
    },
    {
      id: '4',
      type: 'error',
      title: 'Overdue Return',
      message: 'Ultrasonic Sensor HC-SR04 return is 3 days overdue',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
      actionUrl: '/dashboard/student',
      metadata: { componentId: '789', daysOverdue: 3 }
    }
  ])

  const [open, setOpen] = useState(false)
  const { isConnected, lastMessage } = useWebSocketContext()

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (lastMessage) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: getNotificationType(lastMessage.type),
        title: lastMessage.payload.title || 'New Notification',
        message: lastMessage.payload.message || 'You have a new notification',
        timestamp: new Date(lastMessage.timestamp),
        read: false,
        metadata: lastMessage.payload
      }
      
      setNotifications(prev => [newNotification, ...prev])
    }
  }, [lastMessage])

  const getNotificationType = (type: string): Notification['type'] => {
    switch (type) {
      case 'LOW_STOCK_ALERT': return 'warning'
      case 'REQUEST_UPDATE': return 'success'
      case 'INVENTORY_UPDATE': return 'info'
      case 'OVERDUE_ALERT': return 'error'
      default: return 'info'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <X className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationsByType = (type: string) => {
    switch (type) {
      case 'all': return notifications
      case 'unread': return notifications.filter(n => !n.read)
      case 'alerts': return notifications.filter(n => n.type === 'warning' || n.type === 'error')
      case 'updates': return notifications.filter(n => n.type === 'success' || n.type === 'info')
      default: return notifications
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {isConnected && (
                <Badge variant="secondary" className="gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <DialogDescription>
            Stay updated with real-time notifications about your inventory and requests
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>

          {(['all', 'unread', 'alerts', 'updates'] as const).map(type => (
            <TabsContent key={type} value={type}>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-2">
                  {getNotificationsByType(type).map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-accent/50",
                        !notification.read && "border-l-4 border-l-primary bg-accent/20"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            {getIcon(notification.type)}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {notification.actionUrl && (
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                deleteNotification(notification.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {getNotificationsByType(type).length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No notifications in this category
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export function NotificationStats() {
  const notifications = [
    { type: 'Low Stock', count: 3, icon: Package, color: 'text-yellow-600' },
    { type: 'Pending Approvals', count: 8, icon: Users, color: 'text-blue-600' },
    { type: 'Overdue Returns', count: 2, icon: AlertTriangle, color: 'text-red-600' },
    { type: 'System Updates', count: 1, icon: TrendingUp, color: 'text-green-600' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {notifications.map((item) => (
        <Card key={item.type}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.type}</CardTitle>
            <item.icon className={cn("h-4 w-4", item.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.count}</div>
            <p className="text-xs text-muted-foreground">
              {item.count === 1 ? 'notification' : 'notifications'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}