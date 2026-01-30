import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { prn, studentId } = await request.json()
    
    if (!prn && !studentId) {
      return NextResponse.json(
        { error: 'PRN or student ID is required' },
        { status: 400 }
      )
    }

    const student = await prisma.user.findFirst({
      where: {
        AND: [
          { role: 'STUDENT' },
          {
            OR: [
              { prn: prn },
              { id: studentId }
            ]
          }
        ]
      },
      include: {
        _count: {
          select: {
            requests: {
              where: {
                status: { in: ['APPROVED', 'ISSUED'] }
              }
            }
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Update last activity timestamp
    await prisma.user.update({
      where: { id: student.id },
      data: { lastActivity: new Date() }
    })

    return NextResponse.json({ 
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        prn: student.prn,
        department: student.department,
        year: student.year,
        activeIssues: student._count.requests,
        lastActivity: student.lastActivity
      }
    })
  } catch (error) {
    console.error('Scanner student lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup student' },
      { status: 500 }
    )
  }
}