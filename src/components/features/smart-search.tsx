'use client'

import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Package, 
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Eye,
  Zap,
  X
} from 'lucide-react'
import { useComponentSearch, useComponentRecommendations } from '@/lib/hooks/use-component-search'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface SmartSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectComponent: (componentId: string) => void
  userId?: string // Made optional since we don't use it anymore
}

interface Component {
  id: string
  name: string
  category: string
  manufacturer: string
  model: string
  specifications: string
  imageUrl?: string
  purchaseDate: Date
  cost: number
  storageLocation: string
  qrCode: string
  availableQuantity: number
  totalQuantity: number
  condition: string
  description?: string
}

export function SmartSearch({ open, onOpenChange, onSelectComponent, userId }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 300)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const { data: searchResults, isLoading: isSearching } = useComponentSearch(debouncedQuery)
  const { data: recommendations, isLoading: isLoadingRecommendations } = useComponentRecommendations()

  const handleSelect = (componentId: string) => {
    const component = searchResults?.components?.find(c => c.id === componentId) || 
                     recommendations?.find(c => c.id === componentId)
    if (component) {
      setSelectedComponent(component)
      setShowDetailModal(true)
    }
  }

  const handleCloseSearch = () => {
    onOpenChange(false)
    setQuery('')
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'bg-green-100 text-green-800 border-green-200'
      case 'GOOD': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'WORN': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'DAMAGED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage > 50) return 'text-green-600'
    if (percentage > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  return (
    <>
      {/* Main Search Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-3xl border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Smart Component Search</DialogTitle>
            <DialogDescription>Search and discover components with smart recommendations</DialogDescription>
          </DialogHeader>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <div className="flex items-center px-6 py-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Smart Component Search</h3>
                  <p className="text-sm text-gray-600">Component discovery and recommendations</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseSearch}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b px-6 py-2">
              <Search className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
              <input
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search components..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="ml-3 flex items-center gap-2">
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-gray-100 px-2 font-mono text-xs font-medium text-gray-600">
                  <span>⌘</span>K
                </kbd>
              </div>
            </div>

            <CommandList className="max-h-[500px] overflow-y-auto p-2">
              {query.length === 0 && (
                <CommandGroup heading="📋 Recommendations">
                  {isLoadingRecommendations ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : recommendations && recommendations.length > 0 ? (
                    recommendations.map((component) => (
                      <CommandItem
                        key={component.id}
                        value={component.id}
                        onSelect={() => handleSelect(component.id)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg border border-transparent hover:border-blue-200 transition-all duration-200 mb-2"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-base">{component.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{component.description}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {component.category}
                              </Badge>
                              <Badge className={getConditionColor(component.condition)}>
                                {component.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
                              <Sparkles className="w-3 h-3 mr-1" />
                              92%
                            </Badge>
                            <span className="text-xs text-gray-500 font-medium">Available</span>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${getAvailabilityColor(component.availableQuantity, component.totalQuantity)}`}>
                              {component.availableQuantity}/{component.totalQuantity}
                            </p>
                            <p className="text-xs text-gray-500">₹{component.cost}</p>
                          </div>
                        </div>
                      </CommandItem>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">No components available</h3>
                      <p className="text-sm text-gray-600">
                        No components are currently in inventory
                      </p>
                    </div>
                  )}
                </CommandGroup>
              )}

              {query.length > 0 && (
                <>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <>
                      {searchResults?.components && searchResults.components.length > 0 ? (
                        <CommandGroup heading="🔍 Search Results">
                          {searchResults.components.map((component) => (
                            <CommandItem
                              key={component.id}
                              value={component.id}
                              onSelect={() => handleSelect(component.id)}
                              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-lg border border-transparent hover:border-green-200 transition-all duration-200 mb-2"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-md">
                                  <Package className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-base">{component.name}</div>
                                  <div className="text-sm text-gray-600 mt-1">{component.description}</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {component.category}
                                    </Badge>
                                    <Badge className={getConditionColor(component.condition)}>
                                      {component.condition}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border-green-200">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    Match
                                  </Badge>
                                  <span className="text-xs text-gray-500 font-medium">Available</span>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-semibold ${getAvailabilityColor(component.availableQuantity, component.totalQuantity)}`}>
                                    {component.availableQuantity}/{component.totalQuantity}
                                  </p>
                                  <p className="text-xs text-gray-500">₹{component.cost}</p>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                              <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">No components found</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              No components match "{query}"
                            </p>
                            <p className="text-xs text-gray-500">
                              Try different keywords or check the recommendations above
                            </p>
                          </div>
                        </CommandEmpty>
                      )}
                    </>
                  )}
                </>
              )}
            </CommandList>

            {query.length === 0 && (
              <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-4">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Smart recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Press</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium shadow-sm">
                      ↵
                    </kbd>
                    <span>to select</span>
                  </div>
                </div>
              </div>
            )}
          </Command>
        </DialogContent>
      </Dialog>

      {/* Component Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              Component Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected component
            </DialogDescription>
          </DialogHeader>
          
          {selectedComponent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              {/* Component Image and Basic Info */}
              <div className="space-y-6">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                  {selectedComponent.imageUrl ? (
                    <img 
                      src={selectedComponent.imageUrl} 
                      alt={selectedComponent.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        if (target.nextSibling) {
                          (target.nextSibling as HTMLElement).style.display = 'flex'
                        }
                      }}
                    />
                  ) : null}
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Package className="h-24 w-24 mb-4" />
                    <p className="text-sm font-medium">Component Image</p>
                    <p className="text-xs">No image available</p>
                  </div>
                </div>
                
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Component Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-900 mb-1">Component Name</p>
                        <p className="text-xl font-bold text-blue-800">{selectedComponent.name}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Serial/Model</p>
                          <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border">
                            {selectedComponent.model}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                          <Badge variant="outline" className="text-sm px-3 py-1">
                            {selectedComponent.category}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Manufacturer</p>
                          <p className="font-semibold">{selectedComponent.manufacturer}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">QR Code</p>
                          <p className="font-mono text-sm">{selectedComponent.qrCode}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Technical Specifications</p>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedComponent.specifications}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Availability and Details */}
              <div className="space-y-6">
                <Card className="shadow-sm border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                      <Package className="h-5 w-5" />
                      Availability Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-700 mb-1">Available</p>
                        <p className="text-3xl font-bold text-green-600">{selectedComponent.availableQuantity}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-700 mb-1">Total Stock</p>
                        <p className="text-3xl font-bold text-green-600">{selectedComponent.totalQuantity}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-green-700">Condition</span>
                      <Badge className={getConditionColor(selectedComponent.condition)}>
                        {selectedComponent.condition}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Purchase Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-700 mb-1">Purchase Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <p className="font-semibold text-blue-800">{formatDate(selectedComponent.purchaseDate)}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm font-medium text-green-700 mb-1">Unit Cost</p>
                        <p className="text-xl font-bold text-green-600">₹{selectedComponent.cost}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Storage Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <p className="font-medium">{selectedComponent.storageLocation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Description & Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-sm text-purple-800 leading-relaxed">
                        {selectedComponent.description || 'No description available for this component.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => {
                      setShowDetailModal(false)
                      handleCloseSearch()
                      window.location.href = `/requests/new?component=${selectedComponent.id}`
                    }}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Request Component
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetailModal(false)}
                    className="border-gray-300"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SmartSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      onClick={onClick}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Search components...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}