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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  QrCode,
  Upload,
  Download,
  AlertTriangle,
  Eye,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  RefreshCw,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  MapPin,
  Zap,
  Target,
  Award,
  Clock,
} from 'lucide-react'
import { useComponents, useCreateComponent, useDeleteComponent } from '@/lib/hooks/use-components'
import { formatDate, formatCurrency, getConditionColor } from '@/lib/utils'

export default function ManageInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newComponent, setNewComponent] = useState({
    name: '',
    category: 'SENSOR',
    manufacturer: '',
    specifications: '',
    totalQuantity: 1,
    condition: 'NEW',
    cost: 0,
    storageLocation: '',
    description: '',
    imageUrl: '',
  })

  // Enhanced statistics with AI
  const [stats, setStats] = useState({
    totalComponents: 0,
    totalValue: 0,
    lowStockItems: 0,
    categories: 0,
    recentlyAdded: 0,
    avgUtilization: 78,
    monthlyGrowth: 12,
    topCategory: 'SENSOR',
    trends: {
      components: +15,
      value: +8,
      utilization: +5,
    }
  })

  const [aiInsights, setAiInsights] = useState<any>(null)
  const [loadingAI, setLoadingAI] = useState(false)

  const { data, isLoading: dataLoading, refetch } = useComponents({
    search: searchTerm,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
    limit: 50,
  })

  const createComponentMutation = useCreateComponent()
  const deleteComponentMutation = useDeleteComponent()

  const categories = ['ALL', 'SENSOR', 'IC', 'MODULE', 'WIRE', 'TOOL', 'RESISTOR', 'CAPACITOR', 'TRANSISTOR', 'DIODE', 'MICROCONTROLLER', 'BREADBOARD', 'OTHER']
  const conditions = ['NEW', 'GOOD', 'WORN', 'DAMAGED']
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Category' },
    { value: 'totalQuantity', label: 'Quantity' },
    { value: 'cost', label: 'Cost' },
    { value: 'createdAt', label: 'Date Added' },
  ]

  // Simulate loading and calculate stats
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Fetch AI-powered analytics
  useEffect(() => {
    const fetchAIAnalytics = async () => {
      if (!data?.components || data.components.length === 0) return
      
      setLoadingAI(true)
      try {
        const response = await fetch('/api/ai/inventory-analytics')
        if (response.ok) {
          const result = await response.json()
          const analytics = result.analytics
          
          // Update stats with AI-powered data
          setStats({
            totalComponents: analytics.totalComponents,
            totalValue: analytics.totalValue,
            lowStockItems: analytics.stockAlerts.critical + analytics.stockAlerts.low,
            categories: analytics.categoryAnalysis.length,
            recentlyAdded: data.components.filter((c: any) => {
              const addedDate = new Date(c.createdAt)
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return addedDate > weekAgo
            }).length,
            avgUtilization: analytics.utilizationRate,
            monthlyGrowth: analytics.performance.monthlyGrowth,
            topCategory: analytics.performance.topCategory,
            trends: {
              components: analytics.performance.monthlyGrowth,
              value: 8,
              utilization: 5,
            }
          })
          
          setAiInsights(analytics.aiInsights)
          console.log('✅ AI Analytics loaded:', analytics)
        }
      } catch (error) {
        console.error('Failed to fetch AI analytics:', error)
      } finally {
        setLoadingAI(false)
      }
    }

    fetchAIAnalytics()
  }, [data])

  useEffect(() => {
    if (data?.components) {
      const components = data.components
      const totalValue = components.reduce((sum, c) => sum + (c.cost || 0) * c.totalQuantity, 0)
      const lowStock = components.filter(c => c.availableQuantity <= (c.totalQuantity * 0.2)).length
      const categories = new Set(components.map(c => c.category)).size
      const recentlyAdded = components.filter(c => {
        const addedDate = new Date(c.createdAt)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return addedDate > weekAgo
      }).length

      // Only update if AI analytics hasn't loaded yet
      if (!aiInsights) {
        setStats(prev => ({
          ...prev,
          totalComponents: components.length,
          totalValue,
          lowStockItems: lowStock,
          categories,
          recentlyAdded,
        }))
      }
    }
  }, [data, aiInsights])

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleBulkImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/bulk/import', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          alert(`Successfully imported ${data.count} components!`)
          refetch()
        } else {
          const error = await response.json()
          alert(`Import failed: ${error.message}`)
        }
      } catch (error) {
        alert('Failed to import file. Please check the format.')
      }
    }
    input.click()
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export?type=components')
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `components-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Export failed. Please try again.')
      }
    } catch (error) {
      alert('Failed to export data.')
    }
  }

  const handleAddComponent = async () => {
    if (!newComponent.name) return

    try {
      await createComponentMutation.mutateAsync({
        name: newComponent.name,
        category: newComponent.category,
        manufacturer: newComponent.manufacturer,
        specifications: newComponent.specifications,
        totalQuantity: newComponent.totalQuantity,
        condition: newComponent.condition,
        cost: newComponent.cost,
        storageLocation: newComponent.storageLocation,
        description: newComponent.description,
        imageUrl: newComponent.imageUrl,
      })

      // Reset form and close dialog
      setNewComponent({
        name: '',
        category: 'SENSOR',
        manufacturer: '',
        specifications: '',
        totalQuantity: 1,
        condition: 'NEW',
        cost: 0,
        storageLocation: '',
        description: '',
        imageUrl: '',
      })
      setShowAddDialog(false)
      
      // Refresh the data
      refetch()
    } catch (error) {
      console.error('Failed to add component:', error)
    }
  }

  const handleDeleteComponent = async (componentId: string, componentName: string) => {
    if (!confirm(`Are you sure you want to delete "${componentName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteComponentMutation.mutateAsync(componentId)
      refetch()
    } catch (error) {
      console.error('Failed to delete component:', error)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const getSortedComponents = () => {
    if (!data?.components) return []
    
    const sorted = [...data.components].sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a]
      let bValue = b[sortBy as keyof typeof b]
      
      // Handle undefined values
      if (aValue === undefined) aValue = ''
      if (bValue === undefined) bValue = ''
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
    
    return sorted
  }

  const filteredComponents = getSortedComponents()
  const lowStockComponents = filteredComponents.filter(component => 
    component.availableQuantity <= (component.totalQuantity * 0.2)
  )

  if (isLoading || dataLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Manage Inventory" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
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
          title="Manage Inventory"
          subtitle="Add, edit, and manage component inventory"
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Components</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4 text-blue-500" />
                    {stats.trends.components > 0 && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalComponents}</div>
                  <p className="text-xs text-muted-foreground">
                    Active inventory items
                  </p>
                  {stats.trends.components !== 0 && (
                    <div className="flex items-center mt-2">
                      <span className={`text-xs ${stats.trends.components > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.trends.components > 0 ? '+' : ''}{stats.trends.components}% this month
                      </span>
                    </div>
                  )}
                  <div className="mt-2">
                    <Progress value={85} className="h-2" />
                    <span className="text-xs text-muted-foreground">85% capacity utilized</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <Award className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total asset value
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{stats.trends.value}% growth</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <Target className="h-3 w-3 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.avgUtilization}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average component usage
                  </p>
                  <div className="mt-2">
                    <Progress value={stats.avgUtilization} className="h-2" />
                    <span className="text-xs text-purple-600">Excellent efficiency!</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <Zap className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
                  <p className="text-xs text-red-500">
                    Items need restocking
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-muted-foreground">Recent: {stats.recentlyAdded}</span>
                    <span className="text-muted-foreground">Categories: {stats.categories}</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Inventory Performance</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Monthly growth: +{stats.monthlyGrowth}% • Top category: {stats.topCategory} • Recently added: {stats.recentlyAdded} items
                    </p>
                  </div>
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
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            {lowStockComponents.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Alert
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    {lowStockComponents.length} components are running low on stock
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lowStockComponents.slice(0, 3).map((component) => (
                      <div key={component.id} className="bg-white border border-red-200 rounded-lg p-3">
                        <h4 className="font-medium text-red-900">{component.name}</h4>
                        <p className="text-sm text-red-700">
                          Stock: {component.availableQuantity}/{component.totalQuantity}
                        </p>
                        <Badge variant="destructive" className="mt-1">
                          {Math.round((component.availableQuantity / component.totalQuantity) * 100)}% remaining
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {lowStockComponents.length > 3 && (
                    <p className="text-sm text-red-600 mt-3">
                      And {lowStockComponents.length - 3} more components...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Enhanced Actions and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search components by name, manufacturer, or serial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category === 'ALL' ? 'All Categories' : category.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                        onClick={() => handleSort(sortBy)}
                      >
                        {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBulkImport}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Component
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <Plus className="h-5 w-5 mr-2 text-blue-600" />
                            Add New Component
                          </DialogTitle>
                          <DialogDescription>
                            Enter comprehensive details for the new component to maintain accurate inventory records
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Component Name *</label>
                              <Input
                                value={newComponent.name}
                                onChange={(e) => setNewComponent({...newComponent, name: e.target.value})}
                                placeholder="e.g., Arduino Uno R3"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category *</label>
                              <select
                                value={newComponent.category}
                                onChange={(e) => setNewComponent({...newComponent, category: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                {categories.slice(1).map(category => (
                                  <option key={category} value={category}>
                                    {category.replace('_', ' ')}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Manufacturer</label>
                              <Input
                                value={newComponent.manufacturer}
                                onChange={(e) => setNewComponent({...newComponent, manufacturer: e.target.value})}
                                placeholder="e.g., Arduino LLC"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Initial Quantity *</label>
                              <Input
                                type="number"
                                value={newComponent.totalQuantity}
                                onChange={(e) => setNewComponent({...newComponent, totalQuantity: parseInt(e.target.value) || 1})}
                                min={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Condition</label>
                              <select
                                value={newComponent.condition}
                                onChange={(e) => setNewComponent({...newComponent, condition: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                {conditions.map(condition => (
                                  <option key={condition} value={condition}>
                                    {condition}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Unit Cost ($)</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={newComponent.cost}
                                onChange={(e) => setNewComponent({...newComponent, cost: parseFloat(e.target.value) || 0})}
                                min={0}
                                placeholder="0.00"
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Storage Location</label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  value={newComponent.storageLocation}
                                  onChange={(e) => setNewComponent({...newComponent, storageLocation: e.target.value})}
                                  placeholder="e.g., Rack A, Shelf 2, Bin 5"
                                  className="pl-10 w-full"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Purchase Date</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="date"
                                  className="pl-10 w-full"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="md:col-span-2 space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Component Photo</label>
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <div className="space-y-2">
                                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                                  <div>
                                    <label htmlFor="photo-upload" className="cursor-pointer">
                                      <span className="text-blue-600 hover:text-blue-500 font-medium">Click to upload</span>
                                      <span className="text-gray-500"> or drag and drop</span>
                                    </label>
                                    <input
                                      id="photo-upload"
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                          // Handle photo upload - in a real system, you'd upload to a file server
                                          const reader = new FileReader()
                                          reader.onload = (e) => {
                                            setNewComponent({
                                              ...newComponent, 
                                              imageUrl: e.target?.result as string
                                            })
                                          }
                                          reader.readAsDataURL(file)
                                        }
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                                {newComponent.imageUrl && (
                                  <div className="mt-4">
                                    <img 
                                      src={newComponent.imageUrl} 
                                      alt="Component preview" 
                                      className="max-w-32 max-h-32 mx-auto rounded-lg border"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setNewComponent({...newComponent, imageUrl: ''})}
                                      className="mt-2"
                                    >
                                      Remove Photo
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Technical Specifications</label>
                              <textarea
                                value={newComponent.specifications}
                                onChange={(e) => setNewComponent({...newComponent, specifications: e.target.value})}
                                placeholder="Enter detailed technical specifications, operating voltage, dimensions, etc."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                rows={3}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description & Notes</label>
                              <textarea
                                value={newComponent.description}
                                onChange={(e) => setNewComponent({...newComponent, description: e.target.value})}
                                placeholder="Additional notes, usage instructions, or special handling requirements"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-6 border-t">
                          <Button
                            onClick={handleAddComponent}
                            disabled={!newComponent.name || createComponentMutation.isPending}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            {createComponentMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Adding Component...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add to Inventory
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowAddDialog(false)}
                            disabled={createComponentMutation.isPending}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Components Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      Component Inventory
                      <Badge variant="secondary" className="ml-2">
                        {filteredComponents.length} items
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Comprehensive inventory management with advanced tracking and analytics
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Sorted by {sortOptions.find(opt => opt.value === sortBy)?.label} ({sortOrder})
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredComponents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="font-semibold">Component Details</TableHead>
                          <TableHead className="font-semibold">Category & Specs</TableHead>
                          <TableHead className="font-semibold">Stock Status</TableHead>
                          <TableHead className="font-semibold">Condition & Value</TableHead>
                          <TableHead className="font-semibold">Location & Date</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredComponents.map((component) => (
                          <TableRow key={component.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100">{component.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{component.manufacturer}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {component.serialNumber}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Badge variant="outline" className="text-xs">{component.category}</Badge>
                                {component.specifications && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">
                                    {component.specifications}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {component.availableQuantity}/{component.totalQuantity}
                                  </span>
                                  <div className="flex-1 max-w-20">
                                    <Progress 
                                      value={(component.availableQuantity / component.totalQuantity) * 100} 
                                      className="h-2" 
                                    />
                                  </div>
                                </div>
                                {component.availableQuantity <= (component.totalQuantity * 0.2) && (
                                  <Badge variant="destructive" className="text-xs">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Low Stock
                                  </Badge>
                                )}
                                {component.availableQuantity === 0 && (
                                  <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Badge className={getConditionColor(component.condition)}>
                                  {component.condition}
                                </Badge>
                                <div className="text-sm">
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {component.cost ? formatCurrency(component.cost) : 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Total: {component.cost ? formatCurrency(component.cost * component.totalQuantity) : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="text-xs">{component.storageLocation || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{formatDate(component.createdAt)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <QrCode className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteComponent(component.id, component.name)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No components found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {searchTerm || selectedCategory !== 'ALL'
                        ? 'Try adjusting your search criteria or filters to find components'
                        : 'Start building your inventory by adding your first component'}
                    </p>
                    <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Component
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}