import { NextRequest, NextResponse } from 'next/server';

// Mock data for testing - replace with actual database queries later
const mockCars = [
  {
    id: '1',
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    price: 25990,
    mileage: 15000,
    description: 'Reliable compact sedan with excellent fuel economy',
    exteriorColor: 'Crystal Black Pearl',
    interiorColor: 'Black',
    transmission: 'CVT',
    fuelType: 'Gasoline',
    engine: '2.0L I4',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['Apple CarPlay', 'Android Auto', 'Honda Sensing', 'Blind Spot Monitor'],
    images: ['/api/placeholder/400/300'],
    isFeatured: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'available',
    stockNumber: 'H001',
    vin: '1HGCV1F30PA123456'
  },
  {
    id: '2',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 28990,
    mileage: 22000,
    description: 'Comfortable midsize sedan with Toyota reliability',
    exteriorColor: 'Celestial Silver Metallic',
    interiorColor: 'Black',
    transmission: '8-Speed Automatic',
    fuelType: 'Gasoline',
    engine: '2.5L I4',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['Toyota Safety Sense', 'Entune Audio', 'Smart Key System', 'Backup Camera'],
    images: ['/api/placeholder/400/300'],
    isFeatured: false,
    isNewArrival: false,
    isSpecialOffer: true,
    status: 'available',
    stockNumber: 'T001',
    vin: '4T1B11HK5JU123456'
  },
  {
    id: '3',
    make: 'BMW',
    model: '3 Series',
    year: 2023,
    price: 45990,
    mileage: 12000,
    description: 'Luxury compact sedan with sporty performance',
    exteriorColor: 'Alpine White',
    interiorColor: 'Black',
    transmission: '8-Speed Automatic',
    fuelType: 'Gasoline',
    engine: '2.0L I4 Turbo',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['iDrive 7.0', 'Live Cockpit Professional', 'Parking Assistant', 'Driving Assistant'],
    images: ['/api/placeholder/400/300'],
    isFeatured: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'available',
    stockNumber: 'B001',
    vin: 'WBA8E9G50JNT12345'
  },
  {
    id: '4',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2023,
    price: 48990,
    mileage: 18000,
    description: 'Premium compact luxury sedan with elegant styling',
    exteriorColor: 'Obsidian Black Metallic',
    interiorColor: 'Black',
    transmission: '9-Speed Automatic',
    fuelType: 'Gasoline',
    engine: '2.0L I4 Turbo',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['MBUX', 'Burmester Surround Sound', 'Parking Pilot', 'Active Distance Assist'],
    images: ['/api/placeholder/400/300'],
    isFeatured: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'available',
    stockNumber: 'M001',
    vin: 'WDDWF4HB0FR123456'
  },
  {
    id: '5',
    make: 'Audi',
    model: 'A4',
    year: 2022,
    price: 42990,
    mileage: 25000,
    description: 'Sophisticated compact luxury sedan with quattro all-wheel drive',
    exteriorColor: 'Glacier White Metallic',
    interiorColor: 'Black',
    transmission: '7-Speed S tronic',
    fuelType: 'Gasoline',
    engine: '2.0L I4 Turbo',
    bodyStyle: 'Sedan',
    doors: 4,
    passengers: 5,
    features: ['Virtual Cockpit', 'MMI Navigation Plus', 'Audi Pre Sense', 'Adaptive Cruise Control'],
    images: ['/api/placeholder/400/300'],
    isFeatured: false,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'available',
    stockNumber: 'A001',
    vin: 'WAUZZZ8V2KA123456'
  },
  {
    id: '6',
    make: 'Honda',
    model: 'CR-V',
    year: 2023,
    price: 32990,
    mileage: 8000,
    description: 'Versatile compact SUV with excellent cargo space',
    exteriorColor: 'Platinum White Pearl',
    interiorColor: 'Black',
    transmission: 'CVT',
    fuelType: 'Gasoline',
    engine: '1.5L I4 Turbo',
    bodyStyle: 'SUV',
    doors: 5,
    passengers: 5,
    features: ['Honda Sensing', 'HondaLink', 'Power Tailgate', 'All-Wheel Drive'],
    images: ['/api/placeholder/400/300'],
    isFeatured: false,
    isNewArrival: true,
    isSpecialOffer: false,
    status: 'available',
    stockNumber: 'H002',
    vin: '5FNRL38489B123456'
  },
  {
    id: '7',
    make: 'Toyota',
    model: 'RAV4',
    year: 2023,
    price: 34990,
    mileage: 15000,
    description: 'Popular compact SUV with hybrid option available',
    exteriorColor: 'Midnight Black Metallic',
    interiorColor: 'Black',
    transmission: '8-Speed Automatic',
    fuelType: 'Gasoline',
    engine: '2.5L I4',
    bodyStyle: 'SUV',
    doors: 5,
    passengers: 5,
    features: ['Toyota Safety Sense 2.0', 'Entune Audio', 'All-Wheel Drive', 'Power Liftgate'],
    images: ['/api/placeholder/400/300'],
    isFeatured: false,
    isNewArrival: true,
    isSpecialOffer: false,
    status: 'available',
    stockNumber: 'T002',
    vin: '4T3M1RFV1JU123456'
  },
  {
    id: '8',
    make: 'BMW',
    model: 'X3',
    year: 2023,
    price: 52990,
    mileage: 10000,
    description: 'Compact luxury SUV with sporty driving dynamics',
    exteriorColor: 'Tanzanite Blue Metallic',
    interiorColor: 'Cognac',
    transmission: '8-Speed Automatic',
    fuelType: 'Gasoline',
    engine: '2.0L I4 Turbo',
    bodyStyle: 'SUV',
    doors: 5,
    passengers: 5,
    features: ['iDrive 7.0', 'Live Cockpit Professional', 'xDrive All-Wheel Drive', 'Parking Assistant'],
    images: ['/api/placeholder/400/300'],
    isFeatured: true,
    isNewArrival: false,
    isSpecialOffer: false,
    status: 'available',
    stockNumber: 'B002',
    vin: '5UXCR6C50LL123456'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query.trim()) {
      return NextResponse.json({
        cars: [],
        totalCount: 0,
        hasMore: false,
        query: '',
        keywords: []
      });
    }

    // Split query into keywords and clean them
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(keyword => keyword.length > 0);

    if (keywords.length === 0) {
      return NextResponse.json({
        cars: [],
        totalCount: 0,
        hasMore: false,
        query: '',
        keywords: []
      });
    }

    // Process keywords to group price-related terms
    const processedKeywords: string[] = [];
    let i = 0;
    while (i < keywords.length) {
      if (keywords[i] === 'under' && i + 1 < keywords.length) {
        // Handle "under X" pattern
        const nextKeyword = keywords[i + 1];
        if (/^\d+(k|000)?$/i.test(nextKeyword)) {
          processedKeywords.push(`under ${nextKeyword}`);
          i += 2; // Skip both words
        } else {
          processedKeywords.push(keywords[i]);
          i++;
        }
      } else if (keywords[i] === 'over' && i + 1 < keywords.length) {
        // Handle "over X" pattern
        const nextKeyword = keywords[i + 1];
        if (/^\d+(k|000)?$/i.test(nextKeyword)) {
          processedKeywords.push(`over ${nextKeyword}`);
          i += 2; // Skip both words
        } else {
          processedKeywords.push(keywords[i]);
          i++;
        }
      } else {
        processedKeywords.push(keywords[i]);
        i++;
      }
    }

    // Handle special queries for featured, new arrivals, and special offers
    let filteredCars;
    
    if (query.toLowerCase().includes('featured vehicles') || query.toLowerCase().includes('featured')) {
      filteredCars = mockCars.filter(car => car.isFeatured);
    } else if (query.toLowerCase().includes('new arrivals') || query.toLowerCase().includes('new arrival')) {
      filteredCars = mockCars.filter(car => car.isNewArrival);
    } else if (query.toLowerCase().includes('special offers') || query.toLowerCase().includes('special offer')) {
      filteredCars = mockCars.filter(car => car.isSpecialOffer);
    } else {
      // Filter cars based on search keywords
      filteredCars = mockCars.filter(car => {
        const carText = `${car.make} ${car.model} ${car.year} ${car.description} ${car.features.join(' ')} ${car.bodyStyle} ${car.transmission} ${car.fuelType}`.toLowerCase();

        // Check if all processed keywords match
        return processedKeywords.every(keyword => {
          // Check for year matches
          if (/^\d{4}$/.test(keyword) && car.year.toString().includes(keyword)) {
            return true;
          }

          // Check for price range matches
          if (keyword.startsWith('under ') || keyword.startsWith('over ')) {
            const priceMatch = keyword.match(/(under|over)\s+(\d+)(k|000)?/i);
            if (priceMatch) {
              const amount = parseInt(priceMatch[2]) * (priceMatch[3] === 'k' ? 1000 : 1);
              if (priceMatch[1].toLowerCase() === 'under') {
                return car.price <= amount;
              } else {
                return car.price >= amount;
              }
            }
          }

          // Check for standalone price keywords (e.g., "30k", "under 30k")
          if (/^\d+k$/i.test(keyword)) {
            const amount = parseInt(keyword) * 1000;
            return car.price <= amount;
          }

          // Check for mileage matches
          if (keyword.includes('miles') || keyword.includes('k miles')) {
            const mileageMatch = keyword.match(/(\d+)(k)?\s*miles?/i);
            if (mileageMatch) {
              const mileage = parseInt(mileageMatch[1]) * (mileageMatch[2] === 'k' ? 1000 : 1);
              return car.mileage <= mileage;
            }
          }

          // Check for text matches
          return carText.includes(keyword);
        });
      });
    }

    // Sort cars by relevance (featured first, then by year, then by price)
    const sortedCars = filteredCars.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return b.isFeatured ? 1 : -1;
      }
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      return b.price - a.price;
    });

    // Apply pagination
    const paginatedCars = sortedCars.slice(offset, offset + limit);
    const totalCount = filteredCars.length;
    const hasMore = offset + limit < totalCount;

    return NextResponse.json({
      cars: paginatedCars,
      totalCount,
      hasMore,
      query,
      keywords
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 