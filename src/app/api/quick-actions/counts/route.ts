import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Use raw SQL queries to avoid Prisma type issues
    const featuredCount = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM Car 
      WHERE isFeatured = 1 AND isSold = 0 AND status = 'available'
    `;

    const newArrivalsCount = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM Car 
      WHERE isNewArrival = 1 AND isSold = 0 AND status = 'available'
    `;

    const specialOffersCount = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM Car 
      WHERE isSpecialOffer = 1 AND isSold = 0 AND status = 'available'
    `;

    // Calculate recently viewed based on cars created/updated in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyViewedCount = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM Car 
      WHERE (createdAt >= ${sevenDaysAgo} OR updatedAt >= ${sevenDaysAgo})
      AND isSold = 0 AND status = 'available'
    `;

    // Get total available cars count
    const totalAvailableCars = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM Car 
      WHERE isSold = 0 AND status = 'available'
    `;

    // Get sold cars count
    const soldCarsCount = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM Car 
      WHERE isSold = 1 AND status = 'sold'
    `;

    // Get pending cars count
    const pendingCarsCount = await db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM Car 
      WHERE status = 'pending'
    `;

    return NextResponse.json({
      featured: Number(featuredCount[0]?.count || 0),
      newArrivals: Number(newArrivalsCount[0]?.count || 0),
      specialOffers: Number(specialOffersCount[0]?.count || 0),
      recentlyViewed: Number(recentlyViewedCount[0]?.count || 0),
      totalAvailable: Number(totalAvailableCars[0]?.count || 0),
      sold: Number(soldCarsCount[0]?.count || 0),
      pending: Number(pendingCarsCount[0]?.count || 0)
    });
  } catch (error) {
    console.error('Error fetching quick action counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick action counts' },
      { status: 500 }
    );
  }
}
