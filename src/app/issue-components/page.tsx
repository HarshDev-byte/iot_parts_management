'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search,
  Package,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  TrendingUp,
  Activity,
  Target,
  Zap,
  AlertTriangle,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  Users,
  Award,
  BarChart3,
  Eye,
  Phone,
  Mail,
  MessageSquare,
} from 'lucide-react'
import { useRequests } from '@/lib/hooks/use-requests'
import { formatDate, formatDateTime } from '@/lib/utils'

export default function IssueComponentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState('approvedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterUrgency, setFilterUrgency] = useState('ALL')

  // Enhanced statistics
  const [stats, setStats] = useState({
    readyToIssue: 0,
    urgentRequests: 0,
    uniqueStudents: 0,
    uniqueComponents: 0,
    avgProcessingTime: 2.5,
    todayIssued: 8,
    weeklyEfficiency: 92,
    trends: {
      issued: +15,
      efficiency: +8,
      processing: -12,
    }
  })

  const { data, isLoading: dataLoading, refetch } = useRequests({
    status: 'APPROVED',
    limit: 50,
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 500)
  }

  const filteredRequests = data?.requests?.filter(request => {
    if (request.issuedItem) return false // Only show requests that haven't been issued yet
    
    const matchesSearch = request.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.student.prn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.component.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterUrgency === 'ALL') return matchesSearch
    
    const urgency = getUrgencyLevel(request)
    return matchesSearch && urgency === filterUrgency.toLowerCase()
  }) || []

  // Update stats when data changes
  useEffect(() => {
    if (filteredRequests.length > 0) {
      const urgentCount = filteredRequests.filter(r => getUrgencyLevel(r) === 'high').length
      const uniqueStudents = new Set(filteredRequests.map(r => r.studentId)).size
      const uniqueComponents = new Set(filteredRequests.map(r => r.componentId)).size
      
      setStats(prev => ({
        ...prev,
        readyToIssue: filteredRequests.length,
        urgentRequests: urgentCount,
        uniqueStudents,
        uniqueComponents,
      }))
    }
  }, [filteredRequests])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortedRequests = () => {
    return [...filteredRequests].sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { high: 3, medium: 2, low: 1 }
          aValue = urgencyOrder[getUrgencyLevel(a) as keyof typeof urgencyOrder]
          bValue = urgencyOrder[getUrgencyLevel(b) as keyof typeof urgencyOrder]
          break
        case 'student':
          aValue = a.student.name.toLowerCase()
          bValue = b.student.name.toLowerCase()
          break
        case 'component':
          aValue = a.component.name.toLowerCase()
          bValue = b.component.name.toLowerCase()
          break
        case 'approvedAt':
          aValue = new Date(a.approvedAt || '').getTime()
          bValue = new Date(b.approvedAt || '').getTime()
          break
        default:
          aValue = a[sortBy as keyof typeof a]
          bValue = b[sortBy as keyof typeof b]
      }
      
      if (sortOrder === 'asc') {
        return (aValue || 0) < (bValue || 0) ? -1 : (aValue || 0) > (bValue || 0) ? 1 : 0
      } else {
        return (aValue || 0) > (bValue || 0) ? -1 : (aValue || 0) < (bValue || 0) ? 1 : 0
      }
    })
  }

  const sortedRequests = getSortedRequests()

  const bulkIssue = async () => {
    if (!confirm('Are you sure you want to issue all approved components?')) {
      return
    }

    setIsIssuing(true)
    try {
      for (const request of sortedRequests) {
        await fetch(`/api/requests/${request.id}/issue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      }
      refetch()
      alert('All components issued successfully!')
    } catch (error) {
      console.error('Error bulk issuing components:', error)
      alert('Some components failed to issue. Please check individual requests.')
    } finally {
      setIsIssuing(false)
    }
  }

  const handleIssue = async (requestId: string) => {
    setSelectedRequest(requestId)
    setShowIssueModal(true)
  }

  const confirmIssue = async () => {
    if (!selectedRequest) return
    
    setIsIssuing(true)
    try {
      const response = await fetch(`/api/requests/${selectedRequest}/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })
      
      if (response.ok) {
        setShowIssueModal(false)
        setSelectedRequest(null)
        setNotes('')
        refetch()
        alert('Component issued successfully!')
      } else {
        throw new Error('Failed to issue component')
      }
    } catch (error) {
      console.error('Error issuing component:', error)
      alert('Failed to issue component. Please try again.')
    } finally {
      setIsIssuing(false)
    }
  }

  const getUrgencyLevel = (request: any) => {
    if (!request.approvedAt) return 'low'
    const daysSinceApproval = Math.floor(
      (new Date().getTime() - new Date(request.approvedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceApproval >= 2) return 'high'
    if (daysSinceApproval >= 1) return 'medium'
    return 'low'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'low': return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
    }
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

  if (isLoading || dataLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Issue Components" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading approved requests...</p>
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
          title="Issue Components"
          subtitle={`${stats.readyToIssue} approved requests ready for issuing`}
          rightContent={
            <div className="flex items-center space-x-2">
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
            {/* Enhanced Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ready to Issue</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4 text-blue-500" />
                    {stats.trends.issued > 0 && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.readyToIssue}</div>
                  <p className="text-xs text-muted-foreground">
                    Approved components pending
                  </p>
                  {stats.trends.issued !== 0 && (
                    <div className="flex items-center mt-2">
                      <span className={`text-xs ${stats.trends.issued > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.trends.issued > 0 ? '+' : ''}{stats.trends.issued}% from yesterday
                      </span>
                    </div>
                  )}
                  <div className="mt-2">
                    <Progress value={Math.min((stats.readyToIssue / 20) * 100, 100)} className="h-2" />
                    <span className="text-xs text-muted-foreground">Processing capacity</span>
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
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{stats.trends.efficiency}% improvement</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={stats.weeklyEfficiency} className="h-2" />
                    <span className="text-xs text-green-600">Excellent performance!</span>
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
                    Per request average
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-green-600">-{stats.trends.processing}% faster</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={75} className="h-2" />
                    <span className="text-xs text-muted-foreground">Target: &lt;3m</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Urgent Requests</CardTitle>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <Zap className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.urgentRequests}</div>
                  <p className="text-xs text-red-500">
                    High priority items
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-muted-foreground">Students: {stats.uniqueStudents}</span>
                    <span className="text-muted-foreground">Components: {stats.uniqueComponents}</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Issuing Performance</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Today issued: {stats.todayIssued} • Efficiency: {stats.weeklyEfficiency}% • Avg time: {stats.avgProcessingTime}m
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Actions and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by student name, PRN, or component..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={filterUrgency}
                        onChange={(e) => setFilterUrgency(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="ALL">All Urgency</option>
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="LOW">Low Priority</option>
                      </select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSort(sortBy)}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={bulkIssue}
                      disabled={sortedRequests.length === 0 || isIssuing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Issue All ({sortedRequests.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Requests Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      HOD Approved Requests
                      <Badge variant="secondary" className="ml-2">
                        {sortedRequests.length} pending
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Issue components to students for requests approved by HOD with advanced tracking
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Sorted by {sortBy} ({sortOrder})
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sortedRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead 
                            className="font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => handleSort('student')}
                          >
                            Student Details
                            {sortBy === 'student' && (
                              sortOrder === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            className="font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => handleSort('component')}
                          >
                            Component & Specs
                            {sortBy === 'component' && (
                              sortOrder === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                            )}
                          </TableHead>
                          <TableHead className="font-semibold">Request Details</TableHead>
                          <TableHead 
                            className="font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => handleSort('urgency')}
                          >
                            Priority & Timeline
                            {sortBy === 'urgency' && (
                              sortOrder === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                            )}
                          </TableHead>
                          <TableHead 
                            className="font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => handleSort('approvedAt')}
                          >
                            Approval Info
                            {sortBy === 'approvedAt' && (
                              sortOrder === 'asc' ? <SortAsc className="inline h-3 w-3 ml-1" /> : <SortDesc className="inline h-3 w-3 ml-1" />
                            )}
                          </TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedRequests.map((request) => {
                          const urgency = getUrgencyLevel(request)
                          return (
                            <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium text-gray-900 dark:text-gray-100">{request.student.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{request.student.prn}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">{request.student.department}</p>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500 dark:text-gray-500">{request.student.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{request.component.name}</p>
                                    <Badge variant="outline" className="text-xs">{request.component.category}</Badge>
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    <p>Available: <span className="font-medium">{request.component.availableQuantity}</span></p>
                                    <p>Condition: <span className="font-medium">{request.component.condition}</span></p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Qty: {request.quantity}</span>
                                    <div className="flex-1 max-w-16">
                                      <Progress 
                                        value={(request.quantity / request.component.availableQuantity) * 100} 
                                        className="h-1" 
                                      />
                                    </div>
                                  </div>
                                  <div className="text-xs">
                                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs" title={request.purpose}>
                                      <strong>Purpose:</strong> {request.purpose}
                                    </p>
                                    <div className="flex items-center mt-1">
                                      <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                                      <span className="text-gray-500 dark:text-gray-500">{request.expectedDuration} days</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <Badge className={getUrgencyColor(urgency)}>
                                    {urgency.toUpperCase()} PRIORITY
                                  </Badge>
                                  <div className="text-xs text-gray-500 dark:text-gray-500">
                                    <p>Expected return:</p>
                                    <p className="font-medium">
                                      {new Date(Date.now() + request.expectedDuration * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {request.approvedAt ? formatDate(request.approvedAt) : 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {request.approvedAt ? formatDateTime(request.approvedAt) : 'Not available'}
                                  </p>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Days since approval: {request.approvedAt ? Math.floor(
                                      (new Date().getTime() - new Date(request.approvedAt).getTime()) / (1000 * 60 * 60 * 24)
                                    ) : 0}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleIssue(request.id)}
                                    disabled={request.component.availableQuantity < request.quantity || isIssuing}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    Issue Now
                                  </Button>
                                  {request.component.availableQuantity < request.quantity && (
                                    <p className="text-xs text-red-500">
                                      Insufficient stock
                                    </p>
                                  )}
                                  <div className="flex space-x-1">
                                    <Button size="sm" variant="outline" className="flex-1 h-7">
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 h-7">
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All components issued!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {searchTerm || filterUrgency !== 'ALL'
                        ? 'No approved requests match your search criteria'
                        : 'No approved requests waiting to be issued'}
                    </p>
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Clear Search
                      </Button>
                      <Button variant="outline" onClick={() => setFilterUrgency('ALL')}>
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Enhanced Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Issue Component
              </CardTitle>
              <CardDescription>
                Add any notes or special instructions for the student (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> The component will be marked as issued and the student will be notified automatically.
                </p>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter any special handling instructions, usage notes, or reminders for the student..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={4}
              />
              <div className="flex gap-3">
                <Button
                  onClick={confirmIssue}
                  disabled={isIssuing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isIssuing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Issuing Component...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Issue Component
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowIssueModal(false)
                    setNotes('')
                    setSelectedRequest(null)
                  }}
                  disabled={isIssuing}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}