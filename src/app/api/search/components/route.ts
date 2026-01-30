import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      // Return empty results for empty query
      return NextResponse.json({
        components: [],
        total: 0
      })
    }

    const components = await prisma.component.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { category: { contains: query } },
          { manufacturer: { contains: query } },
          { model: { contains: query } },
          { specifications: { contains: query } }
        ]
      },
      take: limit,
      orderBy: [
        { availableQuantity: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      components,
      total: components.length
    })
  } catch (error) {
    console.error('Search components error:', error)
    return NextResponse.json(
      { error: 'Failed to search components' },
      { status: 500 }
    )
  }
}