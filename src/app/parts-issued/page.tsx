'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { logError } from '@/lib/logger'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  MapPin,
  User,
  FileText,
  QrCode,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react'
import { useIssuedParts, useScheduleReturn } from '@/lib/hooks/use-issued-parts'
import { formatDate, formatDateTime } from '@/lib/utils'

export default function PartsIssuedPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [viewMode, setViewMode] = useState('table')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const { 
    data: issuedPartsData, 
    isLoading, 
    error, 
    refetch 
  } = useIssuedParts({ 
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    limit: 50 
  })

  const scheduleReturnMutation = useScheduleReturn()

  // Redirect to signin if no session
  if (!session?.user) {
    return null
  }

  const currentUser = session.user
  const issuedParts = issuedPartsData?.issuedParts || []

  const handleRefresh = async () => {
    await refetch()
  }

  const handleScheduleReturn = async (partId: string, returnDate: Date) => {
    try {
      await scheduleReturnMutation.mutateAsync({ partId, returnDate })
      setShowDetailModal(false)
    } catch (error) {
      logError('Failed to schedule return', error as Error, { partId })
    }
  }

  const handleReturnPart = async (part: any) => {
    if (!confirm(`Are you sure you want to return "${part.component.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/returns/mark-returned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          partId: part.id,
          condition: 'GOOD'
        }),
      })

      if (response.ok) {
        await refetch() // Refresh the data
        alert('Part returned successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to return part')
      }
    } catch (error) {
      logError('Failed to return part', error as Error, { partId: part.id })
      alert(`Failed to return part: ${(error as Error).message}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'DUE_SOON':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'RETURNED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return <Package className="h-4 w-4" />
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />
      case 'DUE_SOON':
        return <Clock className="h-4 w-4" />
      case 'RETURNED':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const filteredParts = issuedParts.filter(part =>
    part.component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.component.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: issuedParts.length,
    issued: issuedParts.filter(p => p.status === 'ISSUED').length,
    overdue: issuedParts.filter(p => p.status === 'OVERDUE').length,
    dueSoon: issuedParts.filter(p => p.status === 'DUE_SOON').length,
    returned: issuedParts.filter(p => p.status === 'RETURNED').length,
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Parts Issued" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading issued parts...</p>
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
          <Header title="Parts Issued" subtitle="Error loading data" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load issued parts</p>
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Parts Issued"
          subtitle={`Track and manage your issued components (${stats.total} items)`}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Currently Issued</CardTitle>
                  <Zap className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.issued}</div>
                  <p className="text-xs text-muted-foreground">Active items</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</div>
                  <p className="text-xs text-muted-foreground">Within 3 days</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                  <p className="text-xs text-muted-foreground">Need attention</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Returned</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.returned}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by component name, serial number, or purpose..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="ALL">All Status</option>
                        <option value="ISSUED">Currently Issued</option>
                        <option value="DUE_SOON">Due Soon</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="RETURNED">Returned</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                    >
                      {viewMode === 'table' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parts List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      Issued Components
                      <Badge variant="secondary" className="ml-2">
                        {filteredParts.length} items
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Track your issued components and return schedules
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredParts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Issued Date</TableHead>
                          <TableHead>Return Date</TableHead>
                          <TableHead>Purpose</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParts.map((part) => (
                          <TableRow key={part.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{part.component.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {part.component.serialNumber} • Qty: {part.quantity}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {part.component.manufacturer}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(part.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(part.status)}
                                  {part.status.replace('_', ' ')}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{formatDate(part.issuedAt)}</p>
                                <p className="text-muted-foreground">
                                  by {part.issuedBy}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className={part.status === 'OVERDUE' ? 'text-red-600 font-medium' : ''}>
                                  {formatDate(part.expectedReturnDate)}
                                </p>
                                {part.actualReturnDate && (
                                  <p className="text-green-600">
                                    Returned: {formatDate(part.actualReturnDate)}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm max-w-xs truncate" title={part.purpose}>
                                {part.purpose}
                              </p>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPart(part)
                                    setShowDetailModal(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {part.status === 'ISSUED' && !part.isReturned && (
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleReturnPart(part)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Return
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {searchTerm || statusFilter !== 'ALL' ? 'No matching parts found' : 'No parts issued yet'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {searchTerm || statusFilter !== 'ALL'
                        ? 'Try adjusting your search criteria or filters'
                        : 'Parts you request and get approved will appear here'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Component Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the issued component
            </DialogDescription>
          </DialogHeader>

          {selectedPart && (
            <div className="space-y-6 mt-4">
              {/* Component Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Component Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-semibold">{selectedPart.component.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Serial Number</p>
                      <p className="font-semibold font-mono">{selectedPart.component.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</p>
                      <p className="font-semibold">{selectedPart.component.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manufacturer</p>
                      <p className="font-semibold">{selectedPart.component.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</p>
                      <p className="font-semibold">{selectedPart.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Location</p>
                      <p className="font-semibold flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedPart.component.storageLocation}
                      </p>
                    </div>
                  </div>
                  {selectedPart.component.specifications && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Specifications</p>
                      <p className="text-sm">{selectedPart.component.specifications}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Issue Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Issue Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                      <Badge className={getStatusColor(selectedPart.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(selectedPart.status)}
                          {selectedPart.status.replace('_', ' ')}
                        </div>
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued By</p>
                      <p className="font-semibold">{selectedPart.issuedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issue Date</p>
                      <p className="font-semibold">{formatDateTime(selectedPart.issuedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Return</p>
                      <p className={`font-semibold ${selectedPart.status === 'OVERDUE' ? 'text-red-600' : ''}`}>
                        {formatDateTime(selectedPart.expectedReturnDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Purpose</p>
                    <p className="text-sm">{selectedPart.purpose}</p>
                  </div>
                  {selectedPart.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</p>
                      <p className="text-sm">{selectedPart.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                {selectedPart.status === 'ISSUED' && !selectedPart.isReturned && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setShowDetailModal(false)
                      handleReturnPart(selectedPart)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Return Part
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}