import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const type = searchParams.get('type') || 'components'

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'components':
        data = await prisma.component.findMany({
          where: { organizationId: user.organizationId },
          orderBy: { name: 'asc' },
        })
        filename = `components-${Date.now()}.${format}`
        break

      case 'requests':
        data = await prisma.componentRequest.findMany({
          where: {
            student: { organizationId: user.organizationId },
          },
          include: {
            student: true,
            component: true,
          },
          orderBy: { createdAt: 'desc' },
        })
        filename = `requests-${Date.now()}.${format}`
        break

      case 'issued':
        data = await prisma.issuedComponent.findMany({
          where: {
            student: { organizationId: user.organizationId },
          },
          include: {
            student: true,
            component: true,
          },
          orderBy: { issuedAt: 'desc' },
        })
        filename = `issued-components-${Date.now()}.${format}`
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    if (format === 'csv') {
      const csv = convertToCSV(data)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } else if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header]
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value)
      }
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}
