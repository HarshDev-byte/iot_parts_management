'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { ReturnNotificationCenter } from '@/components/features/return-notification'
import { FeatureErrorBoundary } from '@/components/error-boundaries/feature-error-boundary'
import Link from 'next/link'
import {
  Package,
  QrCode,
  ArrowUpDown,
  AlertTriangle,
  Scan,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Activity,
  Target,
  Zap,
  Award,
  Bell,
  Eye,
  Plus,
  BarChart3,
} from 'lucide-react'

export default function LabAssistantDashboard() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Enhanced stats with trends and performance metrics
  const [stats, setStats] = useState({
    todayIssued: 0,
    todayReturned: 0,
    pendingReturns: 0,
    lowStockItems: 0,
    totalComponents: 0,
    activeStudents: 0,
    weeklyEfficiency: 0,
    avgProcessingTime: 0,
    overdueReturns: 0,
    trends: {
      issued: 0,
      returned: 0,
      efficiency: 0,
    }
  })

  // Enhanced transaction data with more details
  const [todayTransactions, setTodayTransactions] = useState([])

  // Enhanced overdue returns with risk assessment
  const [overdueReturns, setOverdueReturns] = useState([])

  // Enhanced low stock alerts with supplier info
  const [lowStockAlerts, setLowStockAlerts] = useState([])

  // Simulate loading and data refresh
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Redirect to signin if no session
  if (!session?.user) {
    return null
  }
  
  const currentUser = session.user

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const getTransactionColor = (type: string) => {
    return type === 'ISSUE' 
      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
      case 'MEDIUM':
        return 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
      case 'LOW':
        return 'bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'LOW':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Lab Assistant Dashboard" subtitle="Loading your management console..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Preparing your lab management dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Lab Assistant Dashboard"
          subtitle={`Inventory Management - ${currentUser.name}`}
          rightContent={
            <div className="flex items-center space-x-2">
              <FeatureErrorBoundary featureName="Return Notifications">
                <ReturnNotificationCenter 
                  userRole="LAB_ASSISTANT" 
                  userId={currentUser.id} 
                />
              </FeatureErrorBoundary>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Stats Cards with Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today Issued</CardTitle>
                  <div className="flex items-center space-x-1">
                    <ArrowUpDown className="h-4 w-4 text-blue-500" />
                    {stats.trends.issued > 0 && (
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.todayIssued}</div>
                  <p className="text-xs text-muted-foreground">
                    Components issued today
                  </p>
                  {stats.trends.issued !== 0 && (
                    <div className="flex items-center mt-2">
                      <span className={`text-xs ${stats.trends.issued > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.trends.issued > 0 ? '+' : ''}{stats.trends.issued}% from yesterday
                      </span>
                    </div>
                  )}
                  <div className="mt-2">
                    <Progress value={stats.todayIssued > 0 ? 75 : 0} className="h-2" />
                    <span className="text-xs text-muted-foreground">
                      {stats.todayIssued > 0 ? '75% of daily target' : 'No items issued today'}
                    </span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing Efficiency</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-green-500" />
                    <Award className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.weeklyEfficiency}%</div>
                  <p className="text-xs text-muted-foreground">
                    Weekly efficiency rate
                  </p>
                  <div className="mt-2">
                    <Progress value={stats.weeklyEfficiency} className="h-2" />
                    <span className="text-xs text-muted-foreground">
                      {stats.weeklyEfficiency > 0 ? 'Excellent performance!' : 'Start processing requests'}
                    </span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <Activity className="h-3 w-3 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.avgProcessingTime}m</div>
                  <p className="text-xs text-muted-foreground">
                    Per transaction average
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {stats.avgProcessingTime > 0 ? 'Efficient processing' : 'No transactions yet'}
                    </span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <Bell className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.lowStockItems + stats.overdueReturns}</div>
                  <p className="text-xs text-red-500">
                    Items need attention
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-muted-foreground">Stock: {stats.lowStockItems}</span>
                    <span className="text-muted-foreground">Overdue: {stats.overdueReturns}</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Today's Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        Today's Transactions
                        <Badge variant="secondary" className="ml-2">
                          {todayTransactions.length}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Recent issue and return activities with detailed tracking
                      </CardDescription>
                    </div>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayTransactions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                          <Activity className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No transactions today</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          No components have been issued or returned today
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Transactions will appear here as they occur
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Transaction history will appear here when components are issued or returned.
                        </p>
                      </div>
                    )}
                  </div>
                  {todayTransactions.length > 0 && (
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        View All Transactions
                        <ArrowUpRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Overdue Returns */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        Overdue Returns
                        <Badge variant="destructive" className="ml-2">{overdueReturns.length} overdue</Badge>
                      </CardTitle>
                      <CardDescription>
                        Items that should have been returned with risk assessment
                      </CardDescription>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {overdueReturns.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">All items returned on time!</h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                          No overdue returns at the moment
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Great job managing the inventory
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Overdue items will appear here when students don't return components on time.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Low Stock Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      Inventory Alerts
                      <Badge variant="warning" className="ml-2">{lowStockAlerts.length} items</Badge>
                    </CardTitle>
                    <CardDescription>
                      Components that need restocking with supplier information
                    </CardDescription>
                  </div>
                  <Package className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lowStockAlerts.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">All stock levels healthy!</h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                        No components need restocking at the moment
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Stock alerts will appear here when inventory runs low
                      </p>
                    </div>
                  ) : (
                    <div className="col-span-full">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Low stock alerts will appear here when components need restocking.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}