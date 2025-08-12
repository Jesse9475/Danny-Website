'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeLanguageDemo } from '@/components/ui/theme-language-demo';
import { 
  Car, 
  Star, 
  Sparkles, 
  Tag, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Clock,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

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
  bodyStyle?: string;
  transmission?: string;
  fuelType?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isSpecialOffer: boolean;
  status: string;
  images: CarImage[];
  vin?: string;
  stockNumber?: string;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [newArrivals, setNewArrivals] = useState<Car[]>([]);
  const [specialOffers, setSpecialOffers] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchCars();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (featuredCars.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredCars.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredCars.length]);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      if (response.ok) {
        const cars: Car[] = await response.json();
        
        // Filter cars by their status
        setFeaturedCars(cars.filter(car => car.isFeatured));
        setNewArrivals(cars.filter(car => car.isNewArrival));
        setSpecialOffers(cars.filter(car => car.isSpecialOffer));
      } else {
        throw new Error('Failed to fetch cars');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
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
    const badges: Array<{ icon: React.ComponentType<any>; label: string; color: string; emoji: string }> = [];
    if (car.isFeatured) badges.push({ icon: Star, label: t('car.status.featured'), color: 'bg-yellow-500', emoji: '⭐' });
    if (car.isNewArrival) badges.push({ icon: Sparkles, label: t('car.status.newArrival'), color: 'bg-blue-500', emoji: '✨' });
    if (car.isSpecialOffer) badges.push({ icon: Tag, label: t('car.status.specialOffer'), color: 'bg-red-500', emoji: '🏷️' });
    return badges;
  };

  const renderCarCard = (car: Car, layout: 'grid' | 'scroll' = 'grid') => {
    const statusBadges = getStatusBadges(car);
    const primaryImage = car.images?.find(img => img.isPrimary) || car.images?.[0];

    return (
      <Card 
        key={car.id} 
        className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${
          layout === 'scroll' ? 'min-w-[320px] max-w-[320px]' : ''
        }`}
      >
        <div className="relative">
          {/* Car Image */}
          <div className="aspect-[4/3] bg-muted overflow-hidden">
            {primaryImage ? (
              <img
                src={primaryImage.imageUrl}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Car className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {statusBadges.map((badge, index) => (
              <Badge key={index} className={badge.color} variant="default">
                <span className="mr-1">{badge.emoji}</span>
                {badge.label}
              </Badge>
            ))}
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground font-bold text-lg px-3 py-2">
              {formatPrice(car.price)}
            </Badge>
          </div>

          {/* Status Emoji */}
          <div className="absolute bottom-3 right-3 text-3xl">
            {car.isFeatured && '⭐'}
            {car.isNewArrival && '🆕'}
            {car.isSpecialOffer && '🏷️'}
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Car Title */}
            <div>
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                {car.year} {car.make} {car.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                {car.bodyStyle && `${car.bodyStyle} • `}
                {car.transmission && `${car.transmission} • `}
                {car.fuelType}
              </p>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span>{car.mileage.toLocaleString()} {t('car.miles')}</span>
              </div>
              {car.bodyStyle && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>{car.bodyStyle}</span>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="text-xs text-muted-foreground space-y-1">
              {car.vin && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('car.vin')}:</span>
                  <span className="font-mono">{car.vin}</span>
                </div>
              )}
              {car.stockNumber && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t('car.stock')}:</span>
                  <span>{car.stockNumber}</span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <Button 
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={async () => {
                // Simulate async operation
                await new Promise(resolve => setTimeout(resolve, 100));
                window.location.href = `/${car.make}/${car.model}/${car.id}`;
              }}
            >
              {t('car.viewDetails')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const [isNavigating, setIsNavigating] = useState(false);

  const nextSlide = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
      setCurrentSlide((prev) => (prev + 1) % featuredCars.length);
    } finally {
      setIsNavigating(false);
    }
  };

  const prevSlide = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
      setCurrentSlide((prev) => (prev - 1 + featuredCars.length) % featuredCars.length);
    } finally {
      setIsNavigating(false);
    }
  };

  const goToSlide = async (index: number) => {
    if (isNavigating) return;
    setIsNavigating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation
      setCurrentSlide(index);
    } finally {
      setIsNavigating(false);
    }
  };

  const renderHeroSlideshow = () => {
    if (featuredCars.length === 0) {
      // Show gradient background when no featured cars
      return (
        <section className="relative bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 mt-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-gray-100"
                onClick={async () => {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  window.location.href = '/inventory';
                }}
              >
                {t('home.hero.browseInventory')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary"
                onClick={async () => {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  window.location.href = '/about';
                }}
              >
                {t('home.hero.learnMore')}
              </Button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20 overflow-hidden mt-16">
        {/* Slideshow */}
        <div className="relative h-full">
          {featuredCars.map((car, index) => (
            <div
              key={car.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent z-10" />
              <img
                src={car.images?.find(img => img.isPrimary)?.imageUrl || car.images?.[0]?.imageUrl || ''}
                alt={`${car.year} ${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center z-20">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                      {car.year} {car.make} {car.model}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {t('home.featured.vehicle')} - {car.bodyStyle} • {car.transmission} • {car.fuelType}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        size="lg" 
                        variant="secondary" 
                        className="text-lg px-8 py-6"
                        onClick={async () => {
                          await new Promise(resolve => setTimeout(resolve, 100));
                          window.location.href = `/${car.make}/${car.model}/${car.id}`;
                        }}
                      >
                        {t('car.viewDetails')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary"
                        onClick={async () => {
                          await new Promise(resolve => setTimeout(resolve, 100));
                          window.location.href = '/inventory';
                        }}
                      >
                        {t('home.hero.browseInventory')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {featuredCars.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              disabled={isNavigating}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('ui.previousSlide')}
            >
              {isNavigating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={nextSlide}
              disabled={isNavigating}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('ui.nextSlide')}
            >
              {isNavigating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {featuredCars.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
            {featuredCars.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isNavigating}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                } ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={t('ui.goToSlide')}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        {featuredCars.length > 1 && (
          <div className="absolute top-8 right-8 z-30 bg-black/50 text-white px-3 py-2 rounded-full text-sm font-medium">
            {currentSlide + 1} / {featuredCars.length}
          </div>
        )}
      </section>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
                  <div className="flex items-center justify-center h-64">
          <div className="text-lg">{t('ui.loading')}</div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Slideshow */}
      {renderHeroSlideshow()}

      {/* Featured Cars Section - Auto-scrolling */}
      {featuredCars.length > 0 && (
        <section className="py-16 mt-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                {t('home.featured.title')}
                <Star className="h-8 w-8 text-yellow-500" />
              </h2>
              <p className="text-xl text-muted-foreground">
                {t('home.featured.subtitle')}
              </p>
            </div>
            
            {/* Auto-scrolling featured vehicles with fade effect */}
            <div className="relative overflow-hidden">
              <div 
                className="flex gap-8 animate-scroll"
                style={{
                  animation: `scroll ${featuredCars.length * 3}s linear infinite`,
                  width: `${featuredCars.length * 400}px`
                }}
              >
                {/* Duplicate cars for seamless loop */}
                {[...featuredCars, ...featuredCars].map((car, index) => (
                  <div key={`${car.id}-${index}`} className="flex-shrink-0 w-96">
                    {renderCarCard(car, 'scroll')}
                  </div>
                ))}
              </div>
              
              {/* Fade overlay for smooth transitions */}
              <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-background to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-background to-transparent pointer-events-none" />
              
              <div className="text-center mt-6 text-sm text-muted-foreground">
                {t('ui.scrollToSeeMore')}
              </div>
            </div>
          </div>
        </section>
      )}









    </div>
  );
}