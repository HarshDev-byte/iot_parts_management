'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  Search, 
  Grid, 
  List, 
  Filter, 
  SortAsc, 
  SortDesc, 
  MapPin, 
  Calendar, 
  Zap,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Layers,
  Info,
  Edit2,
  Check,
  X,
} from 'lucide-react'

// Component Card with AI Analysis and Quick View
function ComponentCard({ 
  component, 
  availability, 
  getCategoryColor, 
  getConditionColor, 
  handleViewDetails 
}: any) {
  return (
    <div 
      className="relative group cursor-pointer"
      onClick={() => handleViewDetails(component)}
    >
      <Card className="hover:shadow-xl transition-all duration-300 relative overflow-hidden hover:border-blue-400 dark:hover:border-blue-600">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {component.name}
              </CardTitle>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span>{component.manufacturer}</span>
                <Badge variant="outline" className={getCategoryColor(component.category)}>
                  {component.category}
                </Badge>
              </div>
            </div>
            <Badge variant="outline" className={getConditionColor(component.condition)}>
              {component.condition}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={`p-3 rounded-lg ${availability.bgColor}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Availability</span>
              <Badge variant="outline" className={availability.color}>
                {availability.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-300">Available:</span>
              <span className="font-bold">{component.availableQuantity}</span>
            </div>
            <Progress 
              value={(component.availableQuantity / component.totalQuantity) * 100} 
              className="h-2" 
            />
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-500 dark:text-gray-400">Total: {component.totalQuantity}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {Math.round((component.availableQuantity / component.totalQuantity) * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {component.storageLocation && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Location:</span>
                </div>
                <span className="font-medium">{component.storageLocation}</span>
              </div>
            )}
            {component.purchaseDate && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Purchased:</span>
                </div>
                <span className="font-medium">{new Date(component.purchaseDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </Card>
    </div>
  )
}

export default function BrowseInventoryPage() {
  const { data: session } = useSession()
  const [components, setComponents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState(false)
  const [newLocation, setNewLocation] = useState('')
  const [savingLocation, setSavingLocation] = useState(false)

  const categories = [
    'ALL', 'MICROCONTROLLER', 'SENSOR', 'MODULE', 'DISPLAY', 
    'COMMUNICATION', 'POWER', 'BREADBOARD', 'RESISTOR', 'CAPACITOR'
  ]

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Category' },
    { value: 'availableQuantity', label: 'Available Quantity' },
    { value: 'purchaseDate', label: 'Purchase Date' },
    { value: 'condition', label: 'Condition' },
  ]

  useEffect(() => {
    fetchComponents()
  }, [])

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/components')
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || [])
      } else {
        console.error('Failed to fetch components')
        setComponents([])
      }
    } catch (error) {
      console.error('Error fetching components:', error)
      setComponents([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchComponents()
    setRefreshing(false)
  }

  const filteredAndSortedComponents = components
    .filter((component: any) => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.specifications?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'ALL' || component.category === selectedCategory
      return matchesSearch && matchesCategory && component.availableQuantity > 0
    })
    .sort((a: any, b: any) => {
      const aValue = a[sortBy] || ''
      const bValue = b[sortBy] || ''
      
      if (sortBy === 'availableQuantity') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      if (sortBy === 'purchaseDate') {
        const aDate = new Date(aValue)
        const bDate = new Date(bValue)
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime()
      }
      
      const comparison = aValue.toString().localeCompare(bValue.toString())
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'bg-green-100 text-green-800 dark:bg-green-900/20 text-green-200 border-green-200 dark:border-green-800'
      case 'GOOD': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 text-blue-200 border-blue-200 dark:border-blue-800'
      case 'WORN': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 text-yellow-200 border-yellow-200 dark:border-yellow-800'
      case 'DAMAGED': return 'bg-red-100 text-red-800 dark:bg-red-900/20 text-red-200 border-red-200 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 text-gray-200 border-gray-200 dark:border-gray-700'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'MICROCONTROLLER': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      'SENSOR': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      'DISPLAY': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      'COMMUNICATION': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
      'POWER': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      'BREADBOARD': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  const getAvailabilityStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage >= 80) return { status: 'High', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' }
    if (percentage >= 50) return { status: 'Medium', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' }
    if (percentage >= 20) return { status: 'Low', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20' }
    return { status: 'Critical', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' }
  }

  // Calculate statistics
  const stats = {
    totalComponents: components.length,
    availableComponents: components.filter((c: any) => c.availableQuantity > 0).length,
    totalItems: components.reduce((sum: number, c: any) => sum + c.totalQuantity, 0),
    availableItems: components.reduce((sum: number, c: any) => sum + c.availableQuantity, 0),
    categories: Array.from(new Set(components.map((c: any) => c.category))).length,
    utilizationRate: components.length > 0 ? 
      Math.round(((components.reduce((sum: number, c: any) => sum + (c.totalQuantity - c.availableQuantity), 0) / 
      components.reduce((sum: number, c: any) => sum + c.totalQuantity, 0)) * 100)) : 0
  }

  const handleViewDetails = (component: any) => {
    setSelectedComponent(component)
    setNewLocation(component.storageLocation || '')
    setEditingLocation(false)
    setShowDetailModal(true)
  }

  const handleUpdateLocation = async () => {
    if (!selectedComponent || !newLocation.trim()) {
      toast.error('Storage location cannot be empty')
      return
    }
    
    // Validate storage location format (alphanumeric, spaces, hyphens, and common symbols)
    const locationRegex = /^[a-zA-Z0-9\s\-_.,#()]+$/
    if (!locationRegex.test(newLocation.trim())) {
      toast.error('Storage location contains invalid characters')
      return
    }
    
    if (newLocation.trim().length > 100) {
      toast.error('Storage location is too long (max 100 characters)')
      return
    }
    
    setSavingLocation(true)
    try {
      const response = await fetch(`/api/components/${selectedComponent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageLocation: newLocation.trim() }),
      })

      if (response.ok) {
        // Update local state
        setSelectedComponent({ ...selectedComponent, storageLocation: newLocation.trim() })
        setComponents(components.map((c: any) => 
          c.id === selectedComponent.id ? { ...c, storageLocation: newLocation.trim() } : c
        ))
        setEditingLocation(false)
        toast.success('Storage location updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update storage location')
      }
    } catch (error) {
      console.error('Error updating location:', error)
      toast.error('Failed to update storage location. Please try again.')
    } finally {
      setSavingLocation(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Browse Inventory" subtitle="Loading components..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading inventory catalog...</p>
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
          title="Browse Inventory" 
          subtitle={`${filteredAndSortedComponents.length} components available • ${stats.categories} categories`}
          rightContent={
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Components</CardTitle>
                  <Package className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalComponents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.availableComponents} currently available
                  </p>
                  <div className="mt-2">
                    <Progress value={(stats.availableComponents / stats.totalComponents) * 100} className="h-2" />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                  <Layers className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.availableItems}</div>
                  <p className="text-xs text-muted-foreground">
                    of {stats.totalItems} total items
                  </p>
                  <div className="mt-2">
                    <Progress value={(stats.availableItems / stats.totalItems) * 100} className="h-2" />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.utilizationRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Components in active use
                  </p>
                  <div className="mt-2">
                    <Progress value={stats.utilizationRate} className="h-2" />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.categories}</div>
                  <p className="text-xs text-muted-foreground">
                    Different component types
                  </p>
                  <div className="flex items-center mt-2">
                    <Zap className="h-3 w-3 text-orange-500 mr-1" />
                    <span className="text-xs text-orange-600">Diverse inventory</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              </Card>
            </div>

            {/* Enhanced Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex-1 w-full lg:max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, manufacturer, or specifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          Sort by {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expandable Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category === 'ALL' ? 'All Categories' : category.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Components Display */}
            {filteredAndSortedComponents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {components.length === 0 ? 'No Components Available' : 'No Matching Components'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {components.length === 0 
                      ? 'The inventory is currently empty. Lab assistants can add components via the Manage Inventory page.'
                      : 'Try adjusting your search terms or category filter to find components.'
                    }
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {filteredAndSortedComponents.map((component: any) => (
                  <ComponentCard 
                    key={component.id}
                    component={component}
                    availability={getAvailabilityStatus(component.availableQuantity, component.totalQuantity)}
                    getCategoryColor={getCategoryColor}
                    getConditionColor={getConditionColor}
                    handleViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Component Detail Modal */}
      {showDetailModal && selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  Component Details
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Component Image and Basic Info */}
                <div className="space-y-6">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                    {selectedComponent.imageUrl ? (
                      <img 
                        src={selectedComponent.imageUrl} 
                        alt={selectedComponent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <Package className="h-24 w-24 mb-4" />
                        <p className="text-sm font-medium">Component Image</p>
                        <p className="text-xs">No image available</p>
                      </div>
                    )}
                  </div>
                  
                  <Card className="shadow-sm border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                        Component Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Component Name</p>
                        <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{selectedComponent.name}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Serial Number</p>
                          <p className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border">
                            {selectedComponent.serialNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</p>
                          <Badge variant="outline" className="text-sm px-3 py-1">
                            {selectedComponent.category}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Manufacturer</p>
                          <p className="font-semibold">{selectedComponent.manufacturer || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">QR Code</p>
                          <p className="font-mono text-sm">{selectedComponent.qrCode || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {selectedComponent.specifications && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Technical Specifications</p>
                          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border">
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {selectedComponent.specifications}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Availability and Details */}
                <div className="space-y-6">
                  <Card className="shadow-sm border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
                        <Package className="h-5 w-5" />
                        Availability Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Available</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedComponent.availableQuantity}</p>
                        </div>
                        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Stock</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedComponent.totalQuantity}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Condition</span>
                        <Badge className={getConditionColor(selectedComponent.condition)}>
                          {selectedComponent.condition}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {(selectedComponent.cost || selectedComponent.purchaseDate || selectedComponent.storageLocation) && (
                    <Card className="shadow-sm border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Info className="h-5 w-5 text-blue-600" />
                          Additional Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {selectedComponent.purchaseDate && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Purchase Date</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                  {new Date(selectedComponent.purchaseDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedComponent.cost && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                              <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Unit Cost</p>
                              <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{selectedComponent.cost}</p>
                            </div>
                          )}
                        </div>
                        
                        {selectedComponent.storageLocation && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Location</p>
                              {session?.user?.role === 'LAB_ASSISTANT' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingLocation(!editingLocation)}
                                  className="h-7 px-2"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {editingLocation && session?.user?.role === 'LAB_ASSISTANT' ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-600">
                                  <MapPin className="h-4 w-4 text-blue-500" />
                                  <Input
                                    value={newLocation}
                                    onChange={(e) => setNewLocation(e.target.value)}
                                    placeholder="Enter storage location"
                                    className="border-0 p-0 h-auto focus-visible:ring-0"
                                    autoFocus
                                  />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={handleUpdateLocation}
                                  disabled={savingLocation || !newLocation.trim()}
                                  className="h-8 px-2 bg-green-600 hover:bg-green-700"
                                >
                                  {savingLocation ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingLocation(false)
                                    setNewLocation(selectedComponent.storageLocation || '')
                                  }}
                                  className="h-8 px-2"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                <p className="font-medium">{selectedComponent.storageLocation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {selectedComponent.description && (
                    <Card className="shadow-sm border-purple-200 dark:border-purple-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Info className="h-5 w-5 text-purple-600" />
                          Description & Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                          <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                            {selectedComponent.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      onClick={() => {
                        setShowDetailModal(false)
                        window.location.href = `/requests/new?component=${selectedComponent.id}`
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Request Component
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowDetailModal(false)}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}