'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Car, 
  Search, 
  Filter, 
  Star, 
  Sparkles, 
  Tag, 
  ArrowRight,
  Gauge,
  Calendar,
  DollarSign,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import FeaturesSidebar from '@/components/layout/features-sidebar';
import { useLeftHover } from '@/hooks/use-left-hover';
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
  bodyStyle?: string;
  transmission?: string;
  fuelType?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isSpecialOffer: boolean;
  status: string;
  images: CarImage[];
}

export default function InventoryPage() {
  const { t } = useLanguage();
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('all');
  const [selectedBodyStyle, setSelectedBodyStyle] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [carImageIndices, setCarImageIndices] = useState<Record<string, number>>({});
  const [touchStart, setTouchStart] = useState<Record<string, number>>({});
  const [touchEnd, setTouchEnd] = useState<Record<string, number>>({});
  
  // Add sidebar state
  const { isHovering, handleMouseEnter, handleMouseLeave } = useLeftHover();

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    filterCars();
  }, [cars, searchQuery, selectedMake, selectedBodyStyle, selectedPriceRange, selectedYear]);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      if (response.ok) {
        const data: Car[] = await response.json();
        setCars(data);
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

  const filterCars = () => {
    let filtered = [...cars];

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.year.toString().includes(query) ||
        car.bodyStyle?.toLowerCase().includes(query) ||
        car.transmission?.toLowerCase().includes(query) ||
        car.fuelType?.toLowerCase().includes(query)
      );
    }

    // Make filter
    if (selectedMake && selectedMake !== 'all') {
      filtered = filtered.filter(car => car.make === selectedMake);
    }

    // Body style filter
    if (selectedBodyStyle && selectedBodyStyle !== 'all') {
      filtered = filtered.filter(car => car.bodyStyle === selectedBodyStyle);
    }

    // Price range filter
    if (selectedPriceRange && selectedPriceRange !== 'all') {
      const [min, max] = selectedPriceRange.split('-').map(Number);
      if (max) {
        filtered = filtered.filter(car => car.price >= min && car.price <= max);
      } else {
        filtered = filtered.filter(car => car.price >= min);
      }
    }

    // Year filter
    if (selectedYear && selectedYear !== 'all') {
      filtered = filtered.filter(car => car.year === parseInt(selectedYear, 10));
    }

    setFilteredCars(filtered);
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
    const badges: Array<{ icon: any; label: string; color: string; emoji: string }> = [];
    if (car.isFeatured) badges.push({ icon: Star, label: t('car.status.featured'), color: 'bg-yellow-500', emoji: '⭐' });
    if (car.isNewArrival) badges.push({ icon: Sparkles, label: t('car.status.newArrival'), color: 'bg-blue-500', emoji: '✨' });
    if (car.isSpecialOffer) badges.push({ icon: Tag, label: t('car.status.specialOffer'), color: 'bg-red-500', emoji: '🏷️' });
    return badges;
  };

  const getUniqueMakes = () => {
    return [...new Set(cars.map(car => car.make))].sort();
  };

  const getUniqueBodyStyles = () => {
    return [...new Set(cars.map(car => car.bodyStyle).filter((style): style is string => Boolean(style)))].sort();
  };

  const getUniqueYears = () => {
    return [...new Set(cars.map(car => car.year))].sort((a, b) => b - a);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMake('all');
    setSelectedBodyStyle('all');
    setSelectedPriceRange('all');
    setSelectedYear('all');
  };

  const renderCarCard = (car: Car) => {
    const statusBadges = getStatusBadges(car);
    const currentImageIndex = carImageIndices[car.id] || 0;
    const currentImage = car.images?.[currentImageIndex] || car.images?.[0];

    const nextImage = () => {
      if (car.images && car.images.length > 1) {
        setCarImageIndices(prev => ({
          ...prev,
          [car.id]: (prev[car.id] || 0) === car.images.length - 1 ? 0 : (prev[car.id] || 0) + 1
        }));
      }
    };

    const prevImage = () => {
      if (car.images && car.images.length > 1) {
        setCarImageIndices(prev => ({
          ...prev,
          [car.id]: (prev[car.id] || 0) === 0 ? car.images.length - 1 : (prev[car.id] || 0) - 1
        }));
      }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(prev => ({
        ...prev,
        [car.id]: e.targetTouches[0].clientX
      }));
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(prev => ({
        ...prev,
        [car.id]: e.targetTouches[0].clientX
      }));
    };

    const handleTouchEnd = () => {
      const start = touchStart[car.id];
      const end = touchEnd[car.id];
      
      if (!start || !end || !car.images || car.images.length <= 1) return;
      
      const distance = start - end;
      const isLeftSwipe = distance > 50;
      const isRightSwipe = distance < -50;

      if (isLeftSwipe) {
        nextImage();
      } else if (isRightSwipe) {
        prevImage();
      }

      setTouchStart(prev => {
        const newState = { ...prev };
        delete newState[car.id];
        return newState;
      });
      setTouchEnd(prev => {
        const newState = { ...prev };
        delete newState[car.id];
        return newState;
      });
    };

    return (
      <Card key={car.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="relative">
          {/* Car Image */}
          <div 
            className="aspect-[4/3] bg-muted overflow-hidden relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentImage ? (
              <>
                <img
                  src={currentImage.imageUrl}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Navigation Arrows for Multiple Images */}
                {car.images && car.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {car.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCarImageIndices(prev => ({
                      ...prev,
                      [car.id]: index
                    }));
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    currentImageIndex === index 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Image Counter */}
          {car.images && car.images.length > 1 && (
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
              {currentImageIndex + 1} / {car.images.length}
            </div>
          )}

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
                <span>{car.mileage.toLocaleString()} miles</span>
              </div>
              {car.bodyStyle && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>{car.bodyStyle}</span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <Link href={`/${car.make}/${car.model}/${car.id}`}>
              <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'featured':
        setSelectedMake('all');
        setSelectedBodyStyle('all');
        setSelectedPriceRange('all');
        setSelectedYear('all');
        setSearchQuery('');
        // Filter to show only featured cars
        setFilteredCars(cars.filter(car => car.isFeatured));
        break;
      case 'newArrivals':
        setSelectedMake('all');
        setSelectedBodyStyle('all');
        setSelectedPriceRange('all');
        setSelectedYear('all');
        setSearchQuery('');
        // Filter to show only new arrivals
        setFilteredCars(cars.filter(car => car.isNewArrival));
        break;
      case 'specialOffers':
        setSelectedMake('all');
        setSelectedBodyStyle('all');
        setSelectedPriceRange('all');
        setSelectedYear('all');
        setSearchQuery('');
        // Filter to show only special offers
        setFilteredCars(cars.filter(car => car.isSpecialOffer));
        break;
      case 'recentlyViewed':
        // This would typically load from localStorage or session
        toast.info('Recently viewed feature coming soon!');
        break;
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    switch (filterType) {
      case 'priceRange':
        const [minPrice, maxPrice] = value;
        setSelectedPriceRange(`${minPrice}-${maxPrice}`);
        break;
      case 'yearRange':
        const [minYear, maxYear] = value;
        setSelectedYear(`${minYear}-${maxYear}`);
        break;
      case 'bodyStyle':
        setSelectedBodyStyle(value);
        break;
      case 'fuelType':
        // Add fuel type filtering logic here
        break;
    }
  };

  const getQuickActionCounts = () => ({
    featured: cars.filter(car => car.isFeatured).length,
    newArrivals: cars.filter(car => car.isNewArrival).length,
    specialOffers: cars.filter(car => car.isSpecialOffer).length,
    recentlyViewed: 0 // This would come from localStorage/session
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading inventory...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Features Sidebar */}
      <FeaturesSidebar
        isVisible={isHovering}
        onQuickAction={handleQuickAction}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        quickActionCounts={getQuickActionCounts()}
      />

      {/* Left Edge Hover Area */}
      <div
        className="fixed left-0 top-0 w-4 h-full z-40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('inventory.ourInventory')}</h1>
          <p className="text-xl opacity-90">
            {t('inventory.browseExtensive')}
          </p>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 border-b mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('inventory.searchCars')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Make Filter */}
            <div>
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.make')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('inventory.allMakes')}</SelectItem>
                  {getUniqueMakes().map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Body Style Filter */}
            <div>
              <Select value={selectedBodyStyle} onValueChange={setSelectedBodyStyle}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.bodyStyle')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('inventory.allBodyStyles')}</SelectItem>
                  {getUniqueBodyStyles().map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.priceRange')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('inventory.allPrices')}</SelectItem>
                  <SelectItem value="0-20000">{t('inventory.under20000')}</SelectItem>
                  <SelectItem value="20000-40000">{t('inventory.price20000to40000')}</SelectItem>
                  <SelectItem value="40000-60000">{t('inventory.price40000to60000')}</SelectItem>
                  <SelectItem value="60000-80000">{t('inventory.price60000to80000')}</SelectItem>
                  <SelectItem value="80000-">{t('inventory.price80000plus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder={t('inventory.year')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('inventory.allYears')}</SelectItem>
                  {getUniqueYears().map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              {t('inventory.showing')} {filteredCars.length} {t('inventory.of')} {cars.length} {t('inventory.vehicles')}
            </div>
            <Button variant="outline" onClick={clearFilters} size="sm">{t('inventory.clearFilters')}</Button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 mt-8">
        <div className="container mx-auto px-4">
          {filteredCars.length === 0 ? (
            <div className="text-center py-16">
              <Car className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{t('inventory.noVehiclesFound')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('inventory.tryAdjustingCriteria')}
              </p>
              <Button onClick={clearFilters} variant="outline">{t('inventory.clearAllFilters')}</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCars.map(renderCarCard)}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('inventory.cantFind')}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('inventory.contactUsHelp')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6">
              <Phone className="mr-2 h-5 w-5" />
              {t('inventory.contactUs')}
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Calendar className="mr-2 h-5 w-5" />
              {t('inventory.scheduleTestDrive')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 