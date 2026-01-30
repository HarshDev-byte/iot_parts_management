import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/parts-issued - Get issued parts for current user
export async function GET(request: NextRequest) {
  try {
    // Skip auth check in development mode
    let session = null
    if (process.env.NODE_ENV !== 'development') {
      session = await auth()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Demo user for development
      const demoStudent = await prisma.user.findUnique({
        where: { email: 'demo.student@sies.edu' }
      })
      if (!demoStudent) {
        return NextResponse.json({ error: 'Demo user not found' }, { status: 404 })
      }
      session = {
        user: {
          id: demoStudent.id,
          role: 'STUDENT',
          department: 'Computer Engineering'
        }
      }
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let where: any = {}

    // Filter based on user role
    if (session.user.role === 'STUDENT') {
      where.studentId = session.user.id
    } else if (session.user.role === 'HOD') {
      // HOD can see all issued parts in their department
      where.student = {
        department: session.user.department,
      }
    }
    // LAB_ASSISTANT and ADMIN can see all issued parts

    if (status && status !== 'ALL') {
      if (status === 'OVERDUE') {
        where.isReturned = false
        where.expectedReturnDate = {
          lt: new Date()
        }
      } else if (status === 'DUE_SOON') {
        where.isReturned = false
        where.expectedReturnDate = {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Due within 7 days
        }
      } else if (status === 'RETURNED') {
        where.isReturned = true
      } else if (status === 'ISSUED') {
        where.isReturned = false
      }
    }

    const [issuedParts, total] = await Promise.all([
      prisma.issuedComponent.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              prn: true,
              department: true,
            },
          },
          component: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
              category: true,
              manufacturer: true,
              specifications: true,
              cost: true,
              storageLocation: true,
              qrCode: true,
            },
          },
          request: {
            select: {
              id: true,
              purpose: true,
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.issuedComponent.count({ where }),
    ])

    // Transform the data to match the expected format
    const transformedParts = issuedParts.map(part => {
      const now = new Date()
      const isOverdue = !part.isReturned && part.expectedReturnDate < now
      const daysDiff = Math.ceil((part.expectedReturnDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      let status = 'ISSUED'
      if (part.isReturned) {
        status = 'RETURNED'
      } else if (isOverdue) {
        status = 'OVERDUE'
      } else if (daysDiff <= 3) {
        status = 'DUE_SOON'
      }

      return {
        id: part.id,
        component: {
          name: part.component.name,
          serialNumber: part.component.serialNumber,
          category: part.component.category,
          manufacturer: part.component.manufacturer || 'Unknown',
          specifications: part.component.specifications || '',
          cost: part.component.cost || 0,
          storageLocation: part.component.storageLocation || 'Not specified',
          qrCode: part.component.qrCode || '',
        },
        quantity: part.quantity,
        issuedAt: part.issuedAt,
        expectedReturnDate: part.expectedReturnDate,
        actualReturnDate: part.actualReturnDate,
        purpose: part.request?.purpose || 'Not specified',
        status,
        condition: 'GOOD', // This would come from actual data
        issuedBy: part.issuedBy || 'Unknown',
        notes: part.notes || '',
        isReturned: part.isReturned,
        student: session.user.role !== 'STUDENT' ? part.student : undefined,
      }
    })

    return NextResponse.json({
      issuedParts: transformedParts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching issued parts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}