'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Calendar, 
  DollarSign, 
  Gauge, 
  Zap, 
  Fuel, 
  Settings, 
  Users, 
  DoorOpen,
  Palette,
  Star,
  Sparkles,
  Tag,
  Package, 
  Truck,
  RotateCcw,
  Cog,
  Droplets,
  Ruler,
  Scale,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/language-context';

interface CarImage {
  id: string;
  imageUrl: string;
  imageName: string;
  isPrimary: boolean;
  order: number;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  vin?: string;
  stockNumber?: string;
  description?: string;
  exteriorColor?: string;
  interiorColor?: string;
  transmission?: string;
  fuelType?: string;
  engine?: string;
  bodyStyle?: string;
  doors?: number;
  passengers?: number;
  features?: string;
  horsepower?: number;
  torque?: number;
  mpgCity?: number;
  mpgHighway?: number;
  mpgCombined?: number;
  acceleration?: number;
  topSpeed?: number;
  fuelCapacity?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  wheelbase?: number;
  groundClearance?: number;
  cargoVolume?: number;
  towingCapacity?: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isSpecialOffer: boolean;
  status: string;
  images: CarImage[];
}

export default function CarDetailsPage() {
  const params = useParams();
  const { t } = useLanguage();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchCarDetails(params.id as string);
    }
  }, [params.id]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!car?.images || car.images.length <= 1) return;
      
      if (event.key === 'ArrowLeft') {
        setSelectedImageIndex(prev => prev === 0 ? car.images.length - 1 : prev - 1);
      } else if (event.key === 'ArrowRight') {
        setSelectedImageIndex(prev => prev === car.images.length - 1 ? 0 : prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [car?.images]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !car?.images) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedImageIndex < car.images.length - 1) {
      setSelectedImageIndex(prev => prev + 1);
    } else if (isRightSwipe && selectedImageIndex > 0) {
      setSelectedImageIndex(prev => prev - 1);
    } else if (isLeftSwipe && selectedImageIndex === car.images.length - 1) {
      setSelectedImageIndex(0);
    } else if (isRightSwipe && selectedImageIndex === 0) {
      setSelectedImageIndex(car.images.length - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const fetchCarDetails = async (carId: string) => {
    try {
      const response = await fetch(`/api/cars/${carId}`);
      if (response.ok) {
        const data = await response.json();
        setCar(data);
      } else {
        throw new Error('Failed to fetch car details');
      }
    } catch (error) {
      console.error('Error fetching car details:', error);
      toast.error('Failed to load car details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadges = (car: Car) => {
    const badges: Array<{ icon: React.ComponentType<any>; label: string; color: string }> = [];
    if (car.isFeatured) badges.push({ icon: Star, label: t('car.featured'), color: 'bg-yellow-500' });
    if (car.isNewArrival) badges.push({ icon: Sparkles, label: t('car.newArrival'), color: 'bg-blue-500' });
    if (car.isSpecialOffer) badges.push({ icon: Tag, label: t('car.specialOffer'), color: 'bg-red-500' });
    return badges;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('car.loading')}</div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">{t('car.notFound')}</h1>
          <p className="text-muted-foreground mt-2">{t('car.notFound.description')}</p>
        </div>
      </div>
    );
  }

  const statusBadges = getStatusBadges(car);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-4 w-4" />
            <span>{car.make}</span>
            <span>/</span>
            <span>{car.model}</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold">
                {car.year} {car.make} {car.model}
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                {car.bodyStyle && `${car.bodyStyle} • `}
                {car.transmission && `${car.transmission} • `}
                {car.fuelType}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {formatPrice(car.price)}
              </div>
              <div className="text-sm text-muted-foreground">
                {car.mileage.toLocaleString()} {t('car.mileage')}
              </div>
            </div>
          </div>

          {/* Status Badges */}
          {statusBadges.length > 0 && (
            <div className="flex gap-2">
              {statusBadges.map((badge, index) => (
                <Badge key={index} className={badge.color} variant="default">
                  <badge.icon className="h-3 w-3 mr-1" />
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Image */}
            <div 
              className="aspect-[4/3] bg-muted rounded-lg overflow-hidden relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {car.images && car.images.length > 0 ? (
                <>
                  <img
                    src={car.images[selectedImageIndex]?.imageUrl || car.images[0]?.imageUrl}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Counter */}
                  {car.images.length > 1 && (
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedImageIndex + 1} / {car.images.length}
                    </div>
                  )}
                  
                  {/* Navigation Arrows */}
                  {car.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(prev => 
                          prev === 0 ? car.images.length - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                        aria-label="Previous image"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(prev => 
                          prev === car.images.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                        aria-label="Next image"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Car className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Image Navigation Dots */}
            {car.images && car.images.length > 1 && (
              <div className="flex justify-center gap-2">
                {car.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'bg-primary scale-125' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Thumbnail Images */}
            {car.images && car.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {car.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-primary scale-105' 
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${car.year} ${car.make} ${car.model} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('car.vehicleInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('car.year')}:</span>
                  <span className="font-medium">{car.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('car.make')}:</span>
                  <span className="font-medium">{car.make}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('car.model')}:</span>
                  <span className="font-medium">{car.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('car.bodyStyle')}:</span>
                  <span className="font-medium">{car.bodyStyle || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('car.transmission')}:</span>
                  <span className="font-medium">{car.transmission || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('car.fuelType')}:</span>
                  <span className="font-medium">{car.fuelType || 'N/A'}</span>
                </div>
                {car.exteriorColor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('car.exteriorColor')}:</span>
                    <span className="font-medium">{car.exteriorColor}</span>
                  </div>
                )}
                {car.interiorColor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('car.interiorColor')}:</span>
                    <span className="font-medium">{car.interiorColor}</span>
                  </div>
                )}
                {car.vin && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('car.vin')}:</span>
                    <span className="font-medium font-mono text-sm">{car.vin}</span>
                  </div>
                )}
                {car.stockNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('car.stockNumber')}:</span>
                    <span className="font-medium">{car.stockNumber}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact/Inquiry */}
            <Card>
              <CardHeader>
                <CardTitle>{t('car.interested')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  {t('car.contactDealer')}
                </Button>
                <Button variant="outline" className="w-full">
                  {t('car.scheduleTestDrive')}
                </Button>
                <Button variant="outline" className="w-full">
                  {t('car.getFinancing')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Specifications Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">{t('car.performance')}</TabsTrigger>
            <TabsTrigger value="efficiency">{t('car.efficiency')}</TabsTrigger>
            <TabsTrigger value="dimensions">{t('car.dimensions')}</TabsTrigger>
            <TabsTrigger value="features">{t('car.features')}</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  {t('car.performanceSpecs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {car.horsepower && (
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                      <div className="text-3xl font-bold text-red-600">{car.horsepower}</div>
                      <div className="text-sm text-red-700 font-medium">{t('car.horsepower')}</div>
                      <div className="text-xs text-red-600">{t('car.atRpm')}</div>
                    </div>
                  )}
                  
                  {car.torque && (
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">{car.torque}</div>
                      <div className="text-sm text-blue-700 font-medium">{t('car.torque')}</div>
                      <div className="text-xs text-blue-600">{t('car.lbFt')}</div>
                    </div>
                  )}
                  
                  {car.acceleration && (
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600">{car.acceleration}s</div>
                      <div className="text-sm text-green-700 font-medium">{t('car.acceleration')}</div>
                      <div className="text-xs text-green-600">{t('car.seconds')}</div>
                    </div>
                  )}
                  
                  {car.topSpeed && (
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">{car.topSpeed}</div>
                      <div className="text-sm text-purple-700 font-medium">{t('car.topSpeed')}</div>
                      <div className="text-xs text-purple-600">{t('car.mph')}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-green-500" />
                  {t('car.fuelEfficiency')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {car.mpgCity && (
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600">{car.mpgCity}</div>
                      <div className="text-sm text-green-700 font-medium">{t('car.cityMpg')}</div>
                      <div className="text-xs text-green-600">{t('car.urbanDriving')}</div>
                    </div>
                  )}
                  
                  {car.mpgHighway && (
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">{car.mpgHighway}</div>
                      <div className="text-sm text-blue-700 font-medium">{t('car.highwayMpg')}</div>
                      <div className="text-xs text-blue-600">{t('car.highwayDriving')}</div>
                    </div>
                  )}
                  
                  {car.mpgCombined && (
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">{car.mpgCombined}</div>
                      <div className="text-sm text-purple-700 font-medium">{t('car.combinedMpg')}</div>
                      <div className="text-xs text-purple-600">{t('car.overallAverage')}</div>
                    </div>
                  )}
                </div>
                
                {car.fuelCapacity && (
                  <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{car.fuelCapacity} {t('car.gallons')}</div>
                      <div className="text-sm text-orange-700 font-medium">{t('car.fuelCapacity')}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dimensions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  {t('car.physicalDimensions')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {car.length && (
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600">{car.length}"</div>
                      <div className="text-sm text-gray-700 font-medium">{t('car.length')}</div>
                      <div className="text-xs text-gray-600">{t('car.inches')}</div>
                    </div>
                  )}
                  
                  {car.width && (
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600">{car.width}"</div>
                      <div className="text-sm text-gray-700 font-medium">{t('car.width')}</div>
                      <div className="text-xs text-gray-600">{t('car.inches')}</div>
                    </div>
                  )}
                  
                  {car.height && (
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600">{car.height}"</div>
                      <div className="text-sm text-gray-700 font-medium">{t('car.height')}</div>
                      <div className="text-xs text-gray-600">{t('car.inches')}</div>
                    </div>
                  )}
                  
                  {car.wheelbase && (
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600">{car.wheelbase}"</div>
                      <div className="text-sm text-gray-700 font-medium">{t('car.wheelbase')}</div>
                      <div className="text-xs text-gray-600">{t('car.inches')}</div>
                    </div>
                  )}
                  
                  {car.weight && (
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600">{car.weight.toLocaleString()}</div>
                      <div className="text-sm text-gray-700 font-medium">{t('car.weight')}</div>
                      <div className="text-xs text-gray-600">{t('car.lbs')}</div>
                    </div>
                  )}
                  
                  {car.groundClearance && (
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <div className="text-3xl font-bold text-gray-600">{car.groundClearance}"</div>
                      <div className="text-sm text-gray-700 font-medium">{t('car.groundClearance')}</div>
                      <div className="text-xs text-gray-600">{t('car.inches')}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  {t('car.featuresCapacity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {car.doors && (
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">{car.doors}</div>
                      <div className="text-sm text-blue-700 font-medium">{t('car.doors')}</div>
                      <DoorOpen className="h-8 w-8 text-blue-600 mx-auto mt-2" />
                    </div>
                  )}
                  
                  {car.passengers && (
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-3xl font-bold text-green-600">{car.passengers}</div>
                      <div className="text-sm text-green-700 font-medium">{t('car.passengers')}</div>
                      <Users className="h-8 w-8 text-green-600 mx-auto mt-2" />
                    </div>
                  )}
                  
                  {car.cargoVolume && (
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">{car.cargoVolume}</div>
                      <div className="text-sm text-purple-700 font-medium">{t('car.cargoVolume')}</div>
                      <div className="text-xs text-purple-600">{t('car.cubicFeet')}</div>
                    </div>
                  )}
                  
                  {car.towingCapacity && (
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600">{car.towingCapacity.toLocaleString()}</div>
                      <div className="text-sm text-orange-700 font-medium">{t('car.towingCapacity')}</div>
                      <div className="text-xs text-orange-600">{t('car.lbs')}</div>
                    </div>
                  )}
                </div>
                
                {car.features && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">{t('car.additionalFeatures')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(() => {
                        try {
                          const features = typeof car.features === 'string' ? JSON.parse(car.features) : car.features;
                          if (Array.isArray(features)) {
                            return features.map((feature: string, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                {feature}
                              </div>
                            ));
                          }
                          return null;
                        } catch (error) {
                          // If features is not valid JSON, treat it as a comma-separated string
                          const features = car.features.split(',').map(f => f.trim());
                          return features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              {feature}
                            </div>
                          ));
                        }
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Description */}
        {car.description && (
          <Card>
            <CardHeader>
              <CardTitle>{t('car.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </CardContent>
          </Card>
        )}
          </div>
    </div>
  );
}