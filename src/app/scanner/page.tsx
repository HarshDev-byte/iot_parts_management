'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { useScanner } from '@/lib/hooks/use-scanner'
import {
  Camera,
  QrCode,
  Package,
  User,
  CheckCircle,
  XCircle,
  Scan,
  Upload,
  Activity,
  Clock,
  Target,
  Zap,
  RefreshCw,
  History,
  TrendingUp,
  Award,
  BarChart3,
  Send,
  ArrowRight,
} from 'lucide-react'

interface ScannedComponent {
  id: string
  name: string
  serialNumber: string
  category: string
  condition: string
  availableQuantity: number
  totalQuantity: number
  storageLocation: string
  manufacturer: string
  lastScanned: string
  issuedTo?: string
}

interface ScannedStudent {
  id: string
  name: string
  prn: string
  email: string
  department: string
  year: string
  activeIssues: number
  lastActivity: string
}

interface ScanHistory {
  id: string
  type: 'component' | 'student' | 'issue' | 'return'
  timestamp: string
  data: string
  success: boolean
  action?: string
}

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scanMode, setScanMode] = useState<'component' | 'student'>('component')
  const [componentData, setComponentData] = useState<ScannedComponent | null>(null)
  const [studentData, setStudentData] = useState<ScannedStudent | null>(null)
  const [error, setError] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  const { scanComponent, scanStudent, isLoading: scannerLoading } = useScanner()
  
  // Enhanced statistics
  const [stats, setStats] = useState({
    todayScans: 0,
    successRate: 100,
    avgScanTime: 1.2,
    totalOperations: 0,
    componentsScanned: 0,
    studentsProcessed: 0,
    issuesCompleted: 0,
    returnsProcessed: 0,
    trends: {
      scans: 0,
      success: 0,
      speed: 0,
    }
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)

  // Simulate loading
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const startScanning = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.')
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsScanning(false)
  }

  const handleScan = async (data: string) => {
    if (!data || isProcessing) return
    
    setIsProcessing(true)
    setError('')
    
    try {
      if (scanMode === 'component') {
        const component = await scanComponent(data)
        if (component) {
          setComponentData(component)
          
          // Add to scan history
          const historyEntry: ScanHistory = {
            id: Date.now().toString(),
            type: 'component',
            timestamp: new Date().toISOString(),
            data: data,
            success: true,
          }
          setScanHistory(prev => [historyEntry, ...prev.slice(0, 9)])
          
          // Update stats
          setStats(prev => ({
            ...prev,
            todayScans: prev.todayScans + 1,
            componentsScanned: prev.componentsScanned + 1,
            totalOperations: prev.totalOperations + 1,
          }))
        } else {
          throw new Error('Component not found')
        }
        
      } else {
        const student = await scanStudent(data)
        if (student) {
          setStudentData(student)
          
          // Add to scan history
          const historyEntry: ScanHistory = {
            id: Date.now().toString(),
            type: 'student',
            timestamp: new Date().toISOString(),
            data: data,
            success: true,
          }
          setScanHistory(prev => [historyEntry, ...prev.slice(0, 9)])
          
          // Update stats
          setStats(prev => ({
            ...prev,
            todayScans: prev.todayScans + 1,
            studentsProcessed: prev.studentsProcessed + 1,
            totalOperations: prev.totalOperations + 1,
          }))
        } else {
          throw new Error('Student not found')
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Scan failed'
      setError(errorMessage)
      
      // Add failed scan to history
      const historyEntry: ScanHistory = {
        id: Date.now().toString(),
        type: scanMode,
        timestamp: new Date().toISOString(),
        data: data,
        success: false,
      }
      setScanHistory(prev => [historyEntry, ...prev.slice(0, 9)])
    } finally {
      setIsProcessing(false)
      stopScanning()
    }
  }

  const handleManualInput = () => {
    const input = prompt(`Enter ${scanMode === 'component' ? 'Serial Number' : 'PRN'}:`)
    if (input) {
      handleScan(input)
    }
  }

  const handleIssueComponent = () => {
    if (componentData && studentData) {
      // Implement issue logic
      const historyEntry: ScanHistory = {
        id: Date.now().toString(),
        type: 'issue',
        timestamp: new Date().toISOString(),
        data: `${componentData.name} → ${studentData.name}`,
        success: true,
        action: 'Component Issued',
      }
      setScanHistory(prev => [historyEntry, ...prev.slice(0, 9)])
      setStats(prev => ({ ...prev, issuesCompleted: prev.issuesCompleted + 1 }))
      console.log('Issuing component:', componentData.id, 'to student:', studentData.id)
    }
  }

  const handleReturnComponent = () => {
    if (componentData && studentData) {
      // Implement return logic
      const historyEntry: ScanHistory = {
        id: Date.now().toString(),
        type: 'return',
        timestamp: new Date().toISOString(),
        data: `${componentData.name} ← ${studentData.name}`,
        success: true,
        action: 'Component Returned',
      }
      setScanHistory(prev => [historyEntry, ...prev.slice(0, 9)])
      setStats(prev => ({ ...prev, returnsProcessed: prev.returnsProcessed + 1 }))
      console.log('Returning component:', componentData.id, 'from student:', studentData.id)
    }
  }

  const resetScanner = () => {
    setComponentData(null)
    setStudentData(null)
    setError('')
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="QR Scanner" subtitle="Loading scanning system..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-300">Preparing QR scanning interface...</p>
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
          title="QR Scanner"
          subtitle="Advanced scanning system for components and student IDs"
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
                  <CardTitle className="text-sm font-medium">Today's Scans</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Scan className="h-4 w-4 text-blue-500" />
                    {stats.trends.scans > 0 && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.todayScans}</div>
                  <p className="text-xs text-muted-foreground">
                    QR codes processed
                  </p>
                  {stats.trends.scans !== 0 && (
                    <div className="flex items-center mt-2">
                      <span className={`text-xs ${stats.trends.scans > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.trends.scans > 0 ? '+' : ''}{stats.trends.scans}% from yesterday
                      </span>
                    </div>
                  )}
                  <div className="mt-2">
                    <Progress value={(stats.todayScans / 50) * 100} className="h-2" />
                    <span className="text-xs text-muted-foreground">Daily target: 50 scans</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4 text-green-500" />
                    <Award className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Successful scans
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{stats.trends.success}% improvement</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={stats.successRate} className="h-2" />
                    <span className="text-xs text-green-600">Excellent accuracy!</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Scan Time</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <Zap className="h-3 w-3 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.avgScanTime}s</div>
                  <p className="text-xs text-muted-foreground">
                    Processing speed
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-green-600">-{stats.trends.speed}% faster</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={85} className="h-2" />
                    <span className="text-xs text-muted-foreground">Optimal performance</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Operations</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <BarChart3 className="h-3 w-3 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.totalOperations}</div>
                  <p className="text-xs text-muted-foreground">
                    Total transactions
                  </p>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-muted-foreground">Issues: {stats.issuesCompleted}</span>
                    <span className="text-muted-foreground">Returns: {stats.returnsProcessed}</span>
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
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">Scanning Performance</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      Components: {stats.componentsScanned} • Students: {stats.studentsProcessed} • Success rate: {stats.successRate}%
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <QrCode className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced Scanner Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      QR/Barcode Scanner
                      <Badge variant={isScanning ? 'default' : 'secondary'} className="ml-2">
                        {isScanning ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={scanMode === 'component' ? 'default' : 'outline'}
                        onClick={() => setScanMode('component')}
                        size="sm"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Component
                      </Button>
                      <Button
                        variant={scanMode === 'student' ? 'default' : 'outline'}
                        onClick={() => setScanMode('student')}
                        size="sm"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Student ID
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Point camera at QR code or barcode to scan {scanMode === 'component' ? 'components' : 'student IDs'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced Camera View */}
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                    {isScanning ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-white">
                          <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium opacity-75">Camera Ready</p>
                          <p className="text-sm opacity-50">Click "Start Scanning" to begin</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Scanning overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="w-64 h-64 border-4 border-white border-dashed rounded-lg animate-pulse" />
                          <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-blue-500"></div>
                          <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-blue-500"></div>
                          <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-blue-500"></div>
                          <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-blue-500"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                              Scanning for {scanMode}...
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Scanner Controls */}
                  <div className="flex gap-3">
                    {!isScanning ? (
                      <Button onClick={startScanning} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Scan className="h-4 w-4 mr-2" />
                        Start Scanning
                      </Button>
                    ) : (
                      <Button onClick={stopScanning} variant="outline" className="flex-1">
                        <XCircle className="h-4 w-4 mr-2" />
                        Stop Scanning
                      </Button>
                    )}
                    <Button onClick={handleManualInput} variant="outline" className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Manual Input
                    </Button>
                  </div>

                  {/* Enhanced Status Display */}
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Processing scan data...</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Scan Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Scan Results
                    {(componentData || studentData) && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Information about scanned items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced Component Data */}
                  {componentData && (
                    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-green-900 dark:text-green-100">Component Found</h3>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-green-700 dark:text-green-300 font-medium">Name:</span>
                            <p className="font-medium text-green-900 dark:text-green-100">{componentData.name}</p>
                          </div>
                          <div>
                            <span className="text-green-700 dark:text-green-300 font-medium">Category:</span>
                            <p>{componentData.category}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-green-700 dark:text-green-300 font-medium">Serial:</span>
                            <p className="font-mono text-xs bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                              {componentData.serialNumber}
                            </p>
                          </div>
                          <div>
                            <span className="text-green-700 dark:text-green-300 font-medium">Condition:</span>
                            <Badge variant="outline" className="ml-1">{componentData.condition}</Badge>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-medium">Stock:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-medium">{componentData.availableQuantity}/{componentData.totalQuantity}</span>
                            <div className="flex-1">
                              <Progress 
                                value={(componentData.availableQuantity / componentData.totalQuantity) * 100} 
                                className="h-2" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-medium">Location:</span>
                          <p className="text-green-900 dark:text-green-100">{componentData.storageLocation}</p>
                        </div>
                        
                        <div>
                          <span className="text-green-700 dark:text-green-300 font-medium">Manufacturer:</span>
                          <p className="text-green-900 dark:text-green-100">{componentData.manufacturer}</p>
                        </div>
                        
                        {componentData.issuedTo && (
                          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                            <span className="text-yellow-700 dark:text-yellow-300 font-medium">Currently issued to:</span>
                            <p className="text-yellow-900 dark:text-yellow-100">{componentData.issuedTo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Student Data */}
                  {studentData && (
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">Student Found</h3>
                        <Badge variant="default" className="bg-blue-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-blue-700 dark:text-blue-300 font-medium">Name:</span>
                            <p className="font-medium text-blue-900 dark:text-blue-100">{studentData.name}</p>
                          </div>
                          <div>
                            <span className="text-blue-700 dark:text-blue-300 font-medium">Year:</span>
                            <p>{studentData.year}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-blue-700 dark:text-blue-300 font-medium">PRN:</span>
                            <p className="font-mono text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                              {studentData.prn}
                            </p>
                          </div>
                          <div>
                            <span className="text-blue-700 dark:text-blue-300 font-medium">Active Issues:</span>
                            <Badge variant={studentData.activeIssues > 0 ? 'default' : 'secondary'} className="ml-1">
                              {studentData.activeIssues}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-blue-700 dark:text-blue-300 font-medium">Department:</span>
                          <p className="text-blue-900 dark:text-blue-100">{studentData.department}</p>
                        </div>
                        
                        <div>
                          <span className="text-blue-700 dark:text-blue-300 font-medium">Email:</span>
                          <p className="text-xs text-blue-900 dark:text-blue-100">{studentData.email}</p>
                        </div>
                        
                        <div>
                          <span className="text-blue-700 dark:text-blue-300 font-medium">Last Activity:</span>
                          <p className="text-xs text-blue-900 dark:text-blue-100">
                            {new Date(studentData.lastActivity).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Data State */}
                  {!componentData && !studentData && !isProcessing && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Ready to Scan</p>
                      <p className="text-sm">
                        Scan a {scanMode === 'component' ? 'component QR code' : 'student ID'} to see details
                      </p>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  {componentData && studentData && (
                    <div className="pt-4 border-t space-y-3">
                      <Button onClick={handleIssueComponent} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Send className="h-4 w-4 mr-2" />
                        Issue Component
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <Button onClick={handleReturnComponent} variant="outline" className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Return Component
                      </Button>
                    </div>
                  )}

                  {/* Reset Button */}
                  {(componentData || studentData) && (
                    <Button onClick={resetScanner} variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Scanner
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Scans */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      Recent Scan History
                      <Badge variant="secondary" className="ml-2">
                        {scanHistory.length} entries
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Recently scanned items and operations with success tracking
                    </CardDescription>
                  </div>
                  <History className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {scanHistory.length > 0 ? (
                  <div className="space-y-3">
                    {scanHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 border rounded-lg ${
                          entry.success 
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              entry.success ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <p className="font-medium text-sm">
                                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Scan
                                {entry.action && ` - ${entry.action}`}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{entry.data}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={entry.success ? 'default' : 'destructive'} className="text-xs">
                              {entry.success ? 'Success' : 'Failed'}
                            </Badge>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No scan history</p>
                    <p className="text-sm">Start scanning to see your activity history</p>
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