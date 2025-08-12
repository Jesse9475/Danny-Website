import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const carId = formData.get('carId') as string;
    const imageFile = formData.get('image') as File;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!carId || !imageFile) {
      return NextResponse.json(
        { error: 'Car ID and image file are required' },
        { status: 400 }
      );
    }

    // Check if car exists
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: { images: true }
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Check image limit (max 50 images per car)
    if (car.images.length >= 50) {
      return NextResponse.json(
        { error: 'Maximum 50 images allowed per car' },
        { status: 400 }
      );
    }

    // For now, we'll store the image as a base64 string
    // In production, you'd want to use a cloud storage service like AWS S3
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${imageFile.type};base64,${base64String}`;

    // If this is the primary image, unset other primary images
    if (isPrimary) {
      await prisma.carImage.updateMany({
        where: { carId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    // Create the image record
    const image = await prisma.carImage.create({
      data: {
        carId,
        imageUrl,
        imageName: imageFile.name,
        isPrimary,
        order: car.images.length
      }
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error uploading car image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    await prisma.carImage.delete({
      where: { id: imageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting car image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
