import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRequestSchema = z.object({
  componentId: z.string().min(1),
  quantity: z.number().min(1).max(100),
  purpose: z.string().min(10),
  expectedDuration: z.number().min(1).max(36), // Accept any duration from 1 to 36 months
  projectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// GET /api/requests
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    let where: any = {}

    // Filter by role
    if (session.user.role === 'STUDENT') {
      where.studentId = session.user.id
    } else if (session.user.role === 'HOD') {
      where.student = { department: session.user.department }
    }

    if (status) {
      where.status = status
    }

    const [requests, total] = await Promise.all([
      prisma.componentRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              prn: true,
              department: true,
            },
          },
          component: {
            select: {
              id: true,
              name: true,
              category: true,
              manufacturer: true,
              availableQuantity: true,
              storageLocation: true,
            },
          },
          issuedItem: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.componentRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/requests
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createRequestSchema.parse(body)

    // Check component availability
    const component = await prisma.component.findUnique({
      where: { id: data.componentId },
    })

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 })
    }

    if (component.availableQuantity < data.quantity) {
      return NextResponse.json({ error: 'Insufficient quantity' }, { status: 400 })
    }

    // Check for overdue items
    const overdueCount = await prisma.issuedComponent.count({
      where: {
        studentId: session.user.id,
        isReturned: false,
        expectedReturnDate: { lt: new Date() },
      },
    })

    if (overdueCount > 0) {
      return NextResponse.json(
        { error: 'You have overdue items. Please return them first.' },
        { status: 400 }
      )
    }

    // Create request
    const componentRequest = await prisma.componentRequest.create({
      data: {
        studentId: session.user.id,
        componentId: data.componentId,
        quantity: data.quantity,
        purpose: data.purpose,
        expectedDuration: data.expectedDuration,
        projectId: data.projectId || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
            prn: true,
          },
        },
        component: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    })

    // Log audit
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'CREATE_REQUEST',
          resource: 'COMPONENT_REQUEST',
          details: JSON.stringify({
            requestId: componentRequest.id,
            componentId: data.componentId,
            quantity: data.quantity,
          }),
        },
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }

    return NextResponse.json(componentRequest, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
