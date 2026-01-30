import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/requests/[id]/issue - Issue approved component to student
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    // Only lab assistants can issue components
    if (!session || session.user.role !== 'LAB_ASSISTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notes } = body

    // Get the approved request
    const componentRequest = await prisma.componentRequest.findUnique({
      where: { id },
      include: {
        component: true,
        student: true,
        issuedItem: true,
      },
    })

    if (!componentRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Check if request is approved and not already issued
    if (componentRequest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Request must be approved before issuing' },
        { status: 400 }
      )
    }

    if (componentRequest.issuedItem) {
      return NextResponse.json(
        { error: 'Component already issued for this request' },
        { status: 400 }
      )
    }

    // Check if sufficient quantity is available
    if (componentRequest.component.availableQuantity < componentRequest.quantity) {
      return NextResponse.json(
        { error: 'Insufficient quantity available' },
        { status: 400 }
      )
    }

    // Calculate expected return date
    const expectedReturnDate = new Date()
    expectedReturnDate.setDate(expectedReturnDate.getDate() + componentRequest.expectedDuration)

    // Start transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create issued component record
      const issuedComponent = await tx.issuedComponent.create({
        data: {
          requestId: componentRequest.id,
          studentId: componentRequest.studentId,
          componentId: componentRequest.componentId,
          quantity: componentRequest.quantity,
          issuedBy: session.user.id,
          expectedReturnDate: expectedReturnDate,
          conditionOnIssue: componentRequest.component.condition,
          notes: notes || null,
          purpose: componentRequest.purpose,
          condition: componentRequest.component.condition,
          status: 'ISSUED',
        },
      })

      // 2. Update component inventory (decrement available quantity)
      await tx.component.update({
        where: { id: componentRequest.componentId },
        data: {
          availableQuantity: {
            decrement: componentRequest.quantity
          }
        }
      })

      // 3. Update request status to ISSUED
      await tx.componentRequest.update({
        where: { id: componentRequest.id },
        data: {
          status: 'ISSUED'
        }
      })

      // 4. Create stock movement record
      await tx.stockMovement.create({
        data: {
          componentId: componentRequest.componentId,
          type: 'OUT',
          quantity: componentRequest.quantity,
          reason: `Issued to ${componentRequest.student.name} (${componentRequest.student.prn})`,
          performedBy: session.user.id,
        },
      })

      // 5. Create audit log
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'ISSUE_COMPONENT',
          resource: 'ISSUED_COMPONENT',
          details: JSON.stringify({
            requestId: componentRequest.id,
            componentId: componentRequest.componentId,
            componentName: componentRequest.component.name,
            studentId: componentRequest.studentId,
            studentName: componentRequest.student.name,
            quantity: componentRequest.quantity,
            expectedReturnDate: expectedReturnDate.toISOString(),
          }),
        },
      })

      // 6. Create notification for student
      await tx.notification.create({
        data: {
          userId: componentRequest.studentId,
          title: 'Component Issued',
          message: `Your ${componentRequest.component.name} (Qty: ${componentRequest.quantity}) has been issued. Please return by ${expectedReturnDate.toLocaleDateString()}.`,
          type: 'SUCCESS',
        },
      })

      return issuedComponent
    })

    return NextResponse.json({
      success: true,
      message: 'Component issued successfully',
      issuedComponent: result,
    })

  } catch (error) {
    console.error('Error issuing component:', error)
    return NextResponse.json(
      { error: 'Failed to issue component' },
      { status: 500 }
    )
  }
}