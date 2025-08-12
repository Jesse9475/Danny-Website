import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const cars = await db.car.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.make || !body.model || !body.year || !body.price || !body.mileage) {
      return NextResponse.json(
        { error: 'Missing required fields: make, model, year, price, and mileage are required' },
        { status: 400 }
      );
    }
    
    // Validate data types
    if (isNaN(parseFloat(body.price)) || isNaN(parseInt(body.mileage))) {
      return NextResponse.json(
        { error: 'Invalid data types: price and mileage must be valid numbers' },
        { status: 400 }
      );
    }
    
    // Check if VIN already exists
    if (body.vin) {
      const existingCar = await db.car.findUnique({
        where: { vin: body.vin }
      });
      
      if (existingCar) {
        return NextResponse.json(
          { error: 'A car with this VIN already exists. Please use a different VIN.' },
          { status: 409 }
        );
      }
    }
    
    // Auto-fetch car specifications if VIN is provided
    let specifications = {};
    if (body.vin && body.vin.length === 17) {
      try {
        const specsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cars/specifications?vin=${encodeURIComponent(body.vin)}`
        );
        
        if (specsResponse.ok) {
          const specsData = await specsResponse.json();
          if (specsData.specs) {
            specifications = specsData.specs;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch car specifications:', error);
      }
    }
    
    const car = await db.car.create({
      data: {
        make: body.make,
        model: body.model,
        year: typeof body.year === 'string' ? parseInt(body.year) : body.year,
        price: parseFloat(body.price),
        mileage: parseInt(body.mileage),
        vin: body.vin || null,
        stockNumber: body.stockNumber || null,
        description: body.description || null,
        exteriorColor: body.exteriorColor || null,
        interiorColor: body.interiorColor || null,
        transmission: body.transmission || specifications.transmission || null,
        fuelType: body.fuelType || specifications.fuelType || null,
        engine: body.engine || specifications.engine || null,
        bodyStyle: body.bodyStyle || specifications.bodyStyle || null,
        driveType: body.driveType || specifications.driveType || null,
        doors: body.doors ? parseInt(body.doors) : null,
        passengers: body.passengers ? parseInt(body.passengers) : null,
        features: body.features ? JSON.stringify(body.features.split(',').map(f => f.trim())) : null,
        
        // Auto-fetched specifications from VIN decode
        horsepower: specifications.horsepower || null,
        torque: specifications.torque || null,
        mpgCity: specifications.mpgCity || null,
        mpgHighway: specifications.mpgHighway || null,
        mpgCombined: specifications.mpgCombined || null,
        acceleration: specifications.acceleration || null,
        topSpeed: specifications.topSpeed || null,
        fuelCapacity: specifications.fuelCapacity || null,
        weight: specifications.weight || null,
        length: specifications.length || null,
        width: specifications.width || null,
        height: specifications.height || null,
        wheelbase: specifications.wheelbase || null,
        groundClearance: specifications.groundClearance || null,
        cargoVolume: specifications.cargoVolume || null,
        towingCapacity: specifications.towingCapacity || null,
        
        isFeatured: body.isFeatured || false,
        isNewArrival: body.isNewArrival || false,
        isSpecialOffer: body.isSpecialOffer || false,
        isSold: false,
        status: 'available'
      }
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const field = error.meta?.target?.[0] || 'field';
        return NextResponse.json(
          { error: `A car with this ${field} already exists. Please use a different ${field}.` },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: `Failed to create car: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}