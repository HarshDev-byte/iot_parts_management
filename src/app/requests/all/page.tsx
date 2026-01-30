'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Search,
  Filter,
  User,
  Package,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  RotateCcw,
} from 'lucide-react'
import { useRequests } from '@/lib/hooks/use-requests'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useSession } from 'next-auth/react'

export default function AllRequestsPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const currentUser = session?.user || { role: 'GUEST' }

  const { data, isLoading, refetch } = useRequests({
    limit: 100,
  })

  const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'ISSUED', 'RETURNED']

  const filteredRequests = data?.requests?.filter(request => {
    const matchesSearch = request.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.student.prn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.component.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'ALL' || request.status === selectedStatus
    return matchesSearch && matchesStatus
  }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      case 'ISSUED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RETURNED': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />
      case 'APPROVED': return <CheckCircle className="h-3 w-3" />
      case 'REJECTED': return <XCircle className="h-3 w-3" />
      case 'ISSUED': return <Send className="h-3 w-3" />
      case 'RETURNED': return <RotateCcw className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getPriorityLevel = (request: any) => {
    const daysSinceRequest = Math.floor(
      (new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (request.status === 'PENDING' && daysSinceRequest >= 3) return 'high'
    if (request.status === 'APPROVED' && daysSinceRequest >= 2) return 'high'
    if (daysSinceRequest >= 1) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  // Group requests by status for stats
  const requestsByStatus = filteredRequests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="All Requests" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading requests...</p>
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
          title="All Requests"
          subtitle={`${filteredRequests.length} requests • ${currentUser.role === 'HOD' ? 'HOD View' : 'Lab Assistant View'}`}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
                    </div>
                    <Package className="h-6 w-6 text-gray-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{requestsByStatus.PENDING || 0}</p>
                    </div>
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{requestsByStatus.APPROVED || 0}</p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Issued</p>
                      <p className="text-2xl font-bold text-blue-600">{requestsByStatus.ISSUED || 0}</p>
                    </div>
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{requestsByStatus.REJECTED || 0}</p>
                    </div>
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {new Set(filteredRequests.map(r => r.studentId)).size}
                      </p>
                    </div>
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by student name, PRN, or component..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {statusOptions.map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus(status)}
                        className="text-xs"
                      >
                        {status === 'ALL' ? 'All Status' : status}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests Table */}
            <Card>
              <CardHeader>
                <CardTitle>Component Requests</CardTitle>
                <CardDescription>
                  {currentUser.role === 'HOD' 
                    ? 'All component requests for approval and monitoring'
                    : 'All component requests for processing and tracking'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Component</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => {
                        const priority = getPriorityLevel(request)
                        return (
                          <TableRow key={request.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.student.name}</p>
                                <p className="text-sm text-gray-500">{request.student.prn}</p>
                                <p className="text-xs text-gray-400">{request.student.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{request.component.name}</p>
                                <p className="text-sm text-gray-500">{request.component.category}</p>
                                <p className="text-xs text-gray-400">
                                  Available: {request.component.availableQuantity}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{request.quantity}</span>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm line-clamp-2" title={request.purpose}>
                                  {request.purpose}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(request.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(request.status)}
                                  {request.status}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(priority)}>
                                {priority.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{formatDate(request.createdAt)}</p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(request.createdAt)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(request)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500">
                      {searchTerm || selectedStatus !== 'ALL'
                        ? 'No requests match your current filters'
                        : 'No component requests have been made yet'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Request Details
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Student Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedRequest.student.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">PRN</p>
                    <p className="font-medium">{selectedRequest.student.prn}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Department</p>
                    <p className="font-medium">{selectedRequest.student.department}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedRequest.student.email}</p>
                  </div>
                </div>
              </div>

              {/* Component Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Component Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Component</p>
                    <p className="font-medium">{selectedRequest.component.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Category</p>
                    <p className="font-medium">{selectedRequest.component.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Requested Quantity</p>
                    <p className="font-medium">{selectedRequest.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Available Stock</p>
                    <p className="font-medium">{selectedRequest.component.availableQuantity}</p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Request Details</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Purpose</p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Expected Duration</p>
                      <p className="font-medium">{selectedRequest.expectedDuration} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <Badge className={getStatusColor(selectedRequest.status)}>
                        {selectedRequest.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Requested On</p>
                      <p className="font-medium">{formatDateTime(selectedRequest.createdAt)}</p>
                    </div>
                    {selectedRequest.approvedAt && (
                      <div>
                        <p className="text-gray-500">Approved On</p>
                        <p className="font-medium">{formatDateTime(selectedRequest.approvedAt)}</p>
                      </div>
                    )}
                  </div>
                  {selectedRequest.rejectionReason && (
                    <div>
                      <p className="text-gray-500">Rejection Reason</p>
                      <p className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}