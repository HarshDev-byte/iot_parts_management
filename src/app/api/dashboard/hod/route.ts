import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/hod - Get HOD dashboard data
export async function GET(request: NextRequest) {
  try {
    // Skip auth check in development mode
    let session = null
    if (process.env.NODE_ENV !== 'development') {
      session = await auth()
      if (!session || session.user.role !== 'HOD') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Demo user for development
      session = {
        user: {
          id: 'demo-hod-id',
          role: 'HOD',
          department: 'Computer Engineering'
        }
      }
    }

    const userDepartment = session.user.department || 'Computer Engineering'

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))

    // Base where clause for department filtering
    const departmentWhere = {
      student: {
        department: userDepartment
      }
    }

    // Get statistics
    const [
      pendingApprovals,
      totalStudents,
      activeRequests,
      overdueItems,
      monthlyRequests,
      approvedRequests,
      rejectedRequests,
      totalRequests,
      recentActivity,
      pendingApprovalsList
    ] = await Promise.all([
      // Pending approvals count
      prisma.componentRequest.count({
        where: {
          ...departmentWhere,
          status: 'PENDING'
        }
      }),

      // Total students in department
      prisma.user.count({
        where: {
          role: 'STUDENT',
          department: userDepartment
        }
      }),

      // Active requests (approved but not yet issued)
      prisma.componentRequest.count({
        where: {
          ...departmentWhere,
          status: 'APPROVED'
        }
      }),

      // Overdue items
      prisma.issuedComponent.count({
        where: {
          student: {
            department: userDepartment
          },
          isReturned: false,
          expectedReturnDate: {
            lt: new Date()
          }
        }
      }),

      // Monthly requests
      prisma.componentRequest.count({
        where: {
          ...departmentWhere,
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Approved requests this month
      prisma.componentRequest.count({
        where: {
          ...departmentWhere,
          status: 'APPROVED',
          updatedAt: {
            gte: startOfMonth
          }
        }
      }),

      // Rejected requests this month
      prisma.componentRequest.count({
        where: {
          ...departmentWhere,
          status: 'REJECTED',
          updatedAt: {
            gte: startOfMonth
          }
        }
      }),

      // Total requests this month
      prisma.componentRequest.count({
        where: {
          ...departmentWhere,
          updatedAt: {
            gte: startOfMonth
          }
        }
      }),

      // Recent activity (last 10 approval decisions)
      prisma.componentRequest.findMany({
        where: {
          ...departmentWhere,
          status: {
            in: ['APPROVED', 'REJECTED']
          },
          updatedAt: {
            gte: thirtyDaysAgo
          }
        },
        include: {
          student: {
            select: {
              name: true,
              prn: true
            }
          },
          component: {
            select: {
              name: true,
              cost: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: 10
      }),

      // Pending approvals list (first 5 for quick view)
      prisma.componentRequest.findMany({
        where: {
          ...departmentWhere,
          status: 'PENDING'
        },
        include: {
          student: {
            select: {
              name: true,
              prn: true,
              email: true
            }
          },
          component: {
            select: {
              name: true,
              cost: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: 5
      })
    ])

    // Calculate metrics
    const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0
    const avgApprovalTime = 24 // This would need more complex calculation in real implementation
    const departmentEfficiency = Math.min(95, Math.max(60, approvalRate + Math.random() * 10))
    const budgetUtilization = Math.round(Math.random() * 30 + 60) // This would come from actual budget data

    // Calculate trends (simplified - would need historical data for real trends)
    const trends = {
      approvals: Math.round((Math.random() - 0.5) * 20),
      efficiency: Math.round((Math.random() - 0.3) * 15),
      satisfaction: Math.round(Math.random() * 10 + 5)
    }

    // Format recent activity
    const formattedActivity = recentActivity.map(request => ({
      type: request.status,
      action: request.status === 'APPROVED' ? 'Approved request' : 'Rejected request',
      student: request.student.name,
      time: formatTimeAgo(request.updatedAt),
      component: request.component.name,
      value: request.component.cost ? request.component.cost * request.quantity : undefined,
      reason: request.rejectionReason || undefined,
      impact: determineImpact(request.component.cost ? request.component.cost * request.quantity : 0)
    }))

    // Format pending approvals
    const formattedPendingApprovals = pendingApprovalsList.map(request => ({
      id: request.id,
      studentName: request.student.name,
      prn: request.student.prn || 'N/A',
      priority: determinePriority(request.createdAt),
      urgency: determineUrgency(request.expectedDuration),
      component: request.component.name,
      quantity: request.quantity,
      estimatedCost: request.component.cost ? request.component.cost * request.quantity : 0,
      duration: `${request.expectedDuration} days`,
      supervisor: 'Dr. Smith', // This would come from actual data
      purpose: request.purpose,
      requestDate: formatDate(request.createdAt)
    }))

    const stats = {
      pendingApprovals,
      totalStudents,
      activeRequests,
      overdueItems,
      monthlyRequests,
      approvalRate,
      avgApprovalTime,
      departmentEfficiency,
      budgetUtilization,
      trends
    }

    return NextResponse.json({
      stats,
      recentActivity: formattedActivity,
      pendingApprovals: formattedPendingApprovals
    })

  } catch (error) {
    console.error('Error fetching HOD dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  return date.toLocaleDateString()
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function determinePriority(createdAt: Date): 'HIGH' | 'MEDIUM' | 'LOW' {
  const hoursOld = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  
  if (hoursOld > 48) return 'HIGH'
  if (hoursOld > 24) return 'MEDIUM'
  return 'LOW'
}

function determineUrgency(duration: number): 'URGENT' | 'NORMAL' | 'LOW' {
  if (duration <= 7) return 'URGENT'
  if (duration <= 30) return 'NORMAL'
  return 'LOW'
}

function determineImpact(cost: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (cost > 5000) return 'HIGH'
  if (cost > 1000) return 'MEDIUM'
  return 'LOW'
}