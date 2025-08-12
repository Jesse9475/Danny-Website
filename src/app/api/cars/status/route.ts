import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, statusType, value } = body;

    if (!carId || !statusType) {
      return NextResponse.json(
        { error: 'Car ID and status type are required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    switch (statusType) {
      case 'featured':
        updateData.isFeatured = value;
        break;
      case 'newArrival':
        updateData.isNewArrival = value;
        break;
      case 'specialOffer':
        updateData.isSpecialOffer = value;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid status type' },
          { status: 400 }
        );
    }

    const car = await db.car.update({
      where: { id: carId },
      data: updateData
    });

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error updating car status:', error);
    return NextResponse.json(
      { error: 'Failed to update car status' },
      { status: 500 }
    );
  }
}
