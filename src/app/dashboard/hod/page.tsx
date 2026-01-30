'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AnalyticsDashboard } from '@/components/features/analytics-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeatureErrorBoundary } from '@/components/error-boundaries/feature-error-boundary'
import Link from 'next/link'
import {
  Users,
  ClipboardList,
  Package,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Activity,
  Zap,
  Bell,
  Eye,
  Shield,
  FileText,
} from 'lucide-react'
import { useHODDashboard, useApproveRequest, useBulkApproval } from '@/lib/hooks/use-hod-dashboard'
import { toast } from 'sonner'

export default function HODDashboard() {
  const { data: session } = useSession()
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  
  const { 
    data: dashboardData, 
    isLoading, 
    error, 
    refetch 
  } = useHODDashboard()
  
  const approveRequestMutation = useApproveRequest()
  const bulkApprovalMutation = useBulkApproval()

  // Redirect to signin if no session
  if (!session?.user) {
    return null
  }
  
  const currentUser = session.user

  const handleRefresh = async () => {
    await refetch()
  }

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequestMutation.mutateAsync({
        requestId,
        data: { status: 'APPROVED' }
      })
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleReject = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (!reason) return

    try {
      await approveRequestMutation.mutateAsync({
        requestId,
        data: { 
          status: 'REJECTED',
          rejectionReason: reason
        }
      })
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      toast.error('Please select requests to approve')
      return
    }

    try {
      await bulkApprovalMutation.mutateAsync(selectedRequests)
      setSelectedRequests([])
    } catch (error) {
      console.error('Failed to bulk approve:', error)
    }
  }

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
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
        return 'bg-gray-50 dark:bg-gray-900/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      case 'NORMAL':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      case 'LOW':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'APPROVED':
        return 'bg-green-500'
      case 'REJECTED':
        return 'bg-red-500'
      case 'PENDING':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="HOD Dashboard" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="HOD Dashboard" subtitle="Error loading data" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load dashboard data</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const { stats, recentActivity, pendingApprovals } = dashboardData!

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="HOD Dashboard"
          subtitle={`Welcome back, ${currentUser.name || 'HOD'}`}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <div className="flex items-center space-x-1">
                    <ClipboardList className="h-4 w-4 text-orange-500" />
                    {stats.pendingApprovals > 0 && <Bell className="h-3 w-3 text-red-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting your decision
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs ${stats.trends.approvals >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.trends.approvals > 0 ? '+' : ''}{stats.trends.approvals}% this week
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={Math.max(0, 100 - (stats.pendingApprovals * 10))} className="h-2" />
                    <span className="text-xs text-muted-foreground">Processing efficiency</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Department Efficiency</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-green-500" />
                    {stats.trends.efficiency > 0 && <TrendingUp className="h-3 w-3 text-green-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.departmentEfficiency}%</div>
                  <p className="text-xs text-muted-foreground">
                    Overall performance
                  </p>
                  <div className="flex items-center mt-2">
                    {stats.trends.efficiency >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${stats.trends.efficiency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.trends.efficiency > 0 ? '+' : ''}{stats.trends.efficiency}% improvement
                    </span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <Activity className="h-3 w-3 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently enrolled
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-muted-foreground">Active: {stats.activeRequests}</span>
                    <span className="text-muted-foreground">Monthly: {stats.monthlyRequests}</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4 text-purple-500" />
                    <Award className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.budgetUtilization}%</div>
                  <p className="text-xs text-muted-foreground">
                    Of allocated budget
                  </p>
                  <div className="mt-2">
                    <Progress value={stats.budgetUtilization} className="h-2" />
                    <span className="text-xs text-purple-600">
                      {stats.budgetUtilization > 80 ? 'High utilization' : 'Optimal utilization'}
                    </span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Department Performance</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Approval Rate: {stats.approvalRate}% • Avg. Time: {stats.avgApprovalTime}h • Satisfaction: +{stats.trends.satisfaction}%
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="approvals">
                  Pending Approvals
                  {stats.pendingApprovals > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                      {stats.pendingApprovals}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          Recent Activity
                          <Badge variant="secondary" className="ml-2">
                            {recentActivity.length}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Your recent approval decisions and their impact
                        </CardDescription>
                      </div>
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                            <Activity className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No recent activity</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            No approval decisions have been made recently
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Your approval history will appear here
                          </p>
                        </div>
                      ) : (
                        recentActivity.map((activity, index) => (
                          <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800/50">
                            <div className="flex items-start space-x-3">
                              <div className={`w-3 h-3 rounded-full mt-2 ${getActivityColor(activity.type)}`} />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">
                                    {activity.action} for <span className="text-blue-600 dark:text-blue-400">{activity.student}</span>
                                  </p>
                                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Component: {activity.component}
                                </p>
                                {activity.value && (
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    Value: ₹{activity.value}
                                  </p>
                                )}
                                {activity.reason && (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    Reason: {activity.reason}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <Badge variant="outline" className={
                                    activity.impact === 'HIGH' ? 'border-red-200 text-red-700 dark:border-red-800 dark:text-red-300' :
                                    activity.impact === 'MEDIUM' ? 'border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300' :
                                    'border-green-200 text-green-700 dark:border-green-800 dark:text-green-300'
                                  }>
                                    {activity.impact} Impact
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="approvals" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          Pending Approvals
                          <Badge variant="destructive" className="ml-2">
                            {pendingApprovals.length}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Review and approve student component requests
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link href="/requests/all">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View All
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingApprovals.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            No pending approvals at the moment
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            New requests will appear here for your review
                          </p>
                        </div>
                      ) : (
                        pendingApprovals.map((request) => (
                          <div key={request.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800/50">
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedRequests.includes(request.id)}
                                      onChange={() => toggleRequestSelection(request.id)}
                                      className="rounded border-gray-300"
                                    />
                                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                                      {request.studentName}
                                    </h4>
                                    <Badge variant="outline" className="text-xs">
                                      PRN: {request.prn}
                                    </Badge>
                                    <Badge className={getPriorityColor(request.priority)}>
                                      {request.priority} Priority
                                    </Badge>
                                    <Badge className={getUrgencyColor(request.urgency)}>
                                      {request.urgency}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Component:</span>
                                      <span className="ml-2 font-medium">{request.component} (Qty: {request.quantity})</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Est. Cost:</span>
                                      <span className="ml-2 font-medium text-green-600">₹{request.estimatedCost}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Duration:</span>
                                      <span className="ml-2 font-medium">{request.duration}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Supervisor:</span>
                                      <span className="ml-2 font-medium">{request.supervisor}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(request.id)}
                                      disabled={approveRequestMutation.isPending}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleReject(request.id)}
                                      disabled={approveRequestMutation.isPending}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                              <div className="pt-3 border-t">
                                <div className="flex items-center justify-between text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Purpose:</span>
                                    <span className="ml-2">{request.purpose}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Requested: {request.requestDate}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {pendingApprovals.length > 0 && (
                      <div className="mt-6 flex space-x-2">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleBulkApprove}
                          disabled={selectedRequests.length === 0 || bulkApprovalMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Bulk Approve Selected ({selectedRequests.length})
                        </Button>
                        <Link href="/requests/all" className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View All Requests
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <FeatureErrorBoundary featureName="Analytics Dashboard">
                  <AnalyticsDashboard />
                </FeatureErrorBoundary>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}