import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { qrCode, serialNumber } = await request.json()
    
    if (!qrCode && !serialNumber) {
      return NextResponse.json(
        { error: 'QR code or serial number is required' },
        { status: 400 }
      )
    }

    const component = await prisma.component.findFirst({
      where: {
        OR: [
          { qrCode: qrCode },
          { serialNumber: serialNumber }
        ]
      }
    })

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      )
    }

    // Update last scanned timestamp
    await prisma.component.update({
      where: { id: component.id },
      data: { lastScanned: new Date() }
    })

    return NextResponse.json({ component })
  } catch (error) {
    console.error('Scanner component lookup error:', error)
    return NextResponse.json(
      { error: 'Failed to lookup component' },
      { status: 500 }
    )
  }
}