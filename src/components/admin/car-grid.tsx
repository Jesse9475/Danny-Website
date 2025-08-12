'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Edit, Trash2, Star, Sparkles, Tag, Car, Settings, Fuel, X, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  vin?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isSpecialOffer: boolean;
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  status: string;
  bodyStyle?: string;
  transmission?: string;
  fuelType?: string;
}

interface CarSpecs {
  make?: string;
  model?: string;
  year?: number;
  bodyStyle?: string;
  transmission?: string;
  fuelType?: string;
}

interface CarGridProps {
  onCarUpdated?: () => void;
}

export function CarGrid({ onCarUpdated }: CarGridProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingCar, setUpdatingCar] = useState<string | null>(null);
  const [editingCar, setEditingCar] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Car>>({});
  const [editSpecs, setEditSpecs] = useState<CarSpecs>({});
  const [isFetchingSpecs, setIsFetchingSpecs] = useState(false);
  const [carImageIndices, setCarImageIndices] = useState<Record<string, number>>({});
  const [touchStart, setTouchStart] = useState<Record<string, number>>({});
  const [touchEnd, setTouchEnd] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    filterCars();
  }, [cars, searchTerm, statusFilter]);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      if (response.ok) {
        const data = await response.json();
        setCars(data);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to fetch cars');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = cars;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(car =>
        `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'featured':
          filtered = filtered.filter(car => car.isFeatured);
          break;
        case 'newArrival':
          filtered = filtered.filter(car => car.isNewArrival);
          break;
        case 'specialOffer':
          filtered = filtered.filter(car => car.isSpecialOffer);
          break;
        case 'available':
          filtered = filtered.filter(car => car.status === 'available');
          break;
        case 'sold':
          filtered = filtered.filter(car => car.status === 'sold');
          break;
      }
    }

    setFilteredCars(filtered);
  };

  const startEditing = (car: Car) => {
    setEditingCar(car.id);
    setEditFormData({
      vin: car.vin || '',
      price: car.price,
      mileage: car.mileage,
    });
    setEditSpecs({
      make: car.make,
      model: car.model,
      year: car.year,
      bodyStyle: car.bodyStyle,
      transmission: car.transmission,
      fuelType: car.fuelType,
    });
  };

  const cancelEditing = () => {
    setEditingCar(null);
    setEditFormData({});
    setEditSpecs({});
  };

  const fetchSpecsForEdit = async (vin: string) => {
    if (!vin || vin.length !== 17) {
      toast.error('Please enter a valid 17-character VIN first');
      return;
    }
    
    try {
      setIsFetchingSpecs(true);
      toast.info('Fetching updated car specifications from NHTSA database...');
      
      const response = await fetch(`/api/cars/specifications?vin=${encodeURIComponent(vin)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch specifications');
      }
      
      const data = await response.json();
      
      if (!data.specs || Object.keys(data.specs).length === 0) {
        throw new Error('No specifications found for this VIN');
      }

      const fetchedSpecs = data.specs;
      setEditSpecs(fetchedSpecs);
      
      toast.success(`Successfully fetched updated specs for ${fetchedSpecs.year} ${fetchedSpecs.make} ${fetchedSpecs.model}!`);
    } catch (error) {
      console.error('Failed to fetch specifications:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch specifications';
      toast.error(`Specs lookup failed: ${errorMessage}`);
    } finally {
      setIsFetchingSpecs(false);
    }
  };

  const saveEdit = async (carId: string) => {
    if (!editSpecs.make || !editSpecs.model || !editSpecs.year) {
      toast.error('Please fetch car specifications from VIN before saving');
      return;
    }

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          make: editSpecs.make,
          model: editSpecs.model,
          year: editSpecs.year,
          bodyStyle: editSpecs.bodyStyle,
          transmission: editSpecs.transmission,
          fuelType: editSpecs.fuelType,
        }),
      });

      if (response.ok) {
        toast.success('Car updated successfully!');
        setEditingCar(null);
        setEditFormData({});
        setEditSpecs({});
        fetchCars();
        if (onCarUpdated) {
          onCarUpdated();
        }
      } else {
        throw new Error('Failed to update car');
      }
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Failed to update car');
    }
  };

  const updateCarStatus = async (carId: string, statusType: string, value: boolean) => {
    setUpdatingCar(carId);
    
    try {
      const response = await fetch('/api/cars/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          statusType,
          value,
        }),
      });

      if (response.ok) {
        toast.success(`Car ${statusType} status updated!`);
        fetchCars();
        if (onCarUpdated) {
          onCarUpdated();
        }
      } else {
        throw new Error('Failed to update car status');
      }
    } catch (error) {
      console.error('Error updating car status:', error);
      toast.error('Failed to update car status');
    } finally {
      setUpdatingCar(null);
    }
  };

  const deleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Car deleted successfully!');
        fetchCars();
        if (onCarUpdated) {
          onCarUpdated();
        }
      } else {
        throw new Error('Failed to delete car');
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  const getStatusEmoji = (car: Car) => {
    if (car.isFeatured) return '⭐';
    if (car.isNewArrival) return '🆕';
    if (car.isSpecialOffer) return '🏷️';
    return '';
  };

  const getStatusBadge = (car: Car) => {
    if (car.isFeatured) return <Badge variant="default" className="bg-yellow-500">Featured</Badge>;
    if (car.isNewArrival) return <Badge variant="default" className="bg-blue-500">New Arrival</Badge>;
    if (car.isSpecialOffer) return <Badge variant="default" className="bg-red-500">Special Offer</Badge>;
    return null;
  };

  const getStatusCount = (statusType: string) => {
    switch (statusType) {
      case 'featured':
        return cars.filter(car => car.isFeatured).length;
      case 'newArrival':
        return cars.filter(car => car.isNewArrival).length;
      case 'specialOffer':
        return cars.filter(car => car.isSpecialOffer).length;
      default:
        return 0;
    }
  };

  const isEditFormValid = () => {
    return editFormData.vin && 
           editFormData.price && 
           editFormData.mileage && 
           editSpecs.make && 
           editSpecs.model && 
           editSpecs.year;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading cars...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search cars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cars ({cars.length})</SelectItem>
            <SelectItem value="featured">Featured ({getStatusCount('featured')})</SelectItem>
            <SelectItem value="newArrival">New Arrivals ({getStatusCount('newArrival')})</SelectItem>
            <SelectItem value="specialOffer">Special Offers ({getStatusCount('specialOffer')})</SelectItem>
            <SelectItem value="available">Available ({cars.filter(car => car.status === 'available').length})</SelectItem>
            <SelectItem value="sold">Sold ({cars.filter(car => car.status === 'sold').length})</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={() => {
            fetchCars();
            if (onCarUpdated) {
              onCarUpdated();
            }
          }}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-yellow-600">{getStatusCount('featured')}</div>
          <div className="text-sm text-muted-foreground">Featured Cars</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{getStatusCount('newArrival')}</div>
          <div className="text-sm text-muted-foreground">New Arrivals</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-red-600">{getStatusCount('specialOffer')}</div>
          <div className="text-sm text-muted-foreground">Special Offers</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">{cars.filter(car => car.status === 'available').length}</div>
          <div className="text-sm text-muted-foreground">Available</div>
        </Card>
      </div>

      {/* Car Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCars.map((car) => (
          <Card key={car.id} className="relative group hover:shadow-lg transition-shadow">
            {/* Status Emoji */}
            <div className="absolute top-2 right-2 text-2xl z-10">
              {getStatusEmoji(car)}
            </div>

            {/* Car Image */}
            <div 
              className="relative h-48 overflow-hidden rounded-t-lg"
              onTouchStart={(e) => {
                setTouchStart(prev => ({
                  ...prev,
                  [car.id]: e.targetTouches[0].clientX
                }));
              }}
              onTouchMove={(e) => {
                setTouchEnd(prev => ({
                  ...prev,
                  [car.id]: e.targetTouches[0].clientX
                }));
              }}
              onTouchEnd={() => {
                const start = touchStart[car.id];
                const end = touchEnd[car.id];
                
                if (!start || !end || !car.images || car.images.length <= 1) return;
                
                const distance = start - end;
                const isLeftSwipe = distance > 50;
                const isRightSwipe = distance < -50;

                if (isLeftSwipe) {
                  setCarImageIndices(prev => ({
                    ...prev,
                    [car.id]: (prev[car.id] || 0) === car.images.length - 1 ? 0 : (prev[car.id] || 0) + 1
                  }));
                } else if (isRightSwipe) {
                  setCarImageIndices(prev => ({
                    ...prev,
                    [car.id]: (prev[car.id] || 0) === 0 ? car.images.length - 1 : (prev[car.id] || 0) - 1
                  }));
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
              }}
            >
              {car.images && car.images.length > 0 ? (
                <>
                  <img
                    src={car.images[carImageIndices[car.id] || 0]?.imageUrl || car.images[0].imageUrl}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Navigation Arrows for Multiple Images */}
                  {car.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCarImageIndices(prev => ({
                          ...prev,
                          [car.id]: (prev[car.id] || 0) === 0 ? car.images.length - 1 : (prev[car.id] || 0) - 1
                        }))}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                        aria-label="Previous image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCarImageIndices(prev => ({
                          ...prev,
                          [car.id]: (prev[car.id] || 0) === car.images.length - 1 ? 0 : (prev[car.id] || 0) + 1
                        }))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
                        aria-label="Next image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {car.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {(carImageIndices[car.id] || 0) + 1} / {car.images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                {getStatusBadge(car)}
              </div>
            </div>

            {/* Image Navigation Dots */}
            {car.images && car.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {car.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCarImageIndices(prev => ({
                      ...prev,
                      [car.id]: index
                    }))}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      (carImageIndices[car.id] || 0) === index 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {car.year} {car.make} {car.model}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {editingCar === car.id ? (
                // Edit Mode - VIN-based
                <div className="space-y-3">
                  {/* VIN Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">VIN *</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter 17-character VIN"
                        value={editFormData.vin || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, vin: e.target.value }))}
                        maxLength={17}
                        className="text-sm font-mono tracking-wider"
                      />
                      <Button
                        type="button"
                        onClick={() => fetchSpecsForEdit(editFormData.vin || '')}
                        disabled={!editFormData.vin || editFormData.vin.length !== 17 || isFetchingSpecs}
                        size="sm"
                        className="px-2"
                      >
                        {isFetchingSpecs ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Fetch'
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Auto-filled Car Info Display */}
                  {Object.keys(editSpecs).length > 0 && editSpecs.make && (
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {editSpecs.year} {editSpecs.make} {editSpecs.model}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-green-600">
                        <div>{editSpecs.bodyStyle || 'N/A'}</div>
                        <div>{editSpecs.transmission || 'N/A'}</div>
                        <div>{editSpecs.fuelType || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {/* Required Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Price"
                      type="number"
                      value={editFormData.price || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                    <Input
                      placeholder="Mileage"
                      type="number"
                      value={editFormData.mileage || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                      className="text-sm"
                    />
                  </div>

                  {/* Warning if specs not fetched */}
                  {editFormData.vin && editFormData.vin.length === 17 && (!editSpecs.make || !editSpecs.model || !editSpecs.year) && (
                    <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-700">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">
                          Click "Fetch" to get updated specs
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => saveEdit(car.id)} 
                      disabled={!isEditFormValid()}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditing} className="flex-1">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ${car.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {car.mileage.toLocaleString()} mi
                    </span>
                  </div>

                  {/* Car Details */}
                  <div className="text-sm text-muted-foreground space-y-1">
                    {car.bodyStyle && (
                      <div className="flex items-center gap-2">
                        <Car className="h-3 w-3" />
                        <span>{car.bodyStyle}</span>
                      </div>
                    )}
                    {car.transmission && (
                      <div className="flex items-center gap-2">
                        <Settings className="h-3 w-3" />
                        <span>{car.transmission}</span>
                      </div>
                    )}
                    {car.fuelType && (
                      <div className="flex items-center gap-2">
                        <Fuel className="h-3 w-3" />
                        <span>{car.fuelType}</span>
                      </div>
                    )}
                    {car.vin && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{car.vin}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant={car.isFeatured ? "default" : "outline"}
                      onClick={() => updateCarStatus(car.id, 'featured', !car.isFeatured)}
                      disabled={updatingCar === car.id}
                      className="text-xs px-2 h-8"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {car.isFeatured ? '✓' : '☆'}
                    </Button>
                    <Button
                      size="sm"
                      variant={car.isNewArrival ? "default" : "outline"}
                      onClick={() => updateCarStatus(car.id, 'newArrival', !car.isNewArrival)}
                      disabled={updatingCar === car.id}
                      className="text-xs px-2 h-8"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {car.isNewArrival ? '✓' : '✨'}
                    </Button>
                    <Button
                      size="sm"
                      variant={car.isSpecialOffer ? "default" : "outline"}
                      onClick={() => updateCarStatus(car.id, 'specialOffer', !car.isSpecialOffer)}
                      disabled={updatingCar === car.id}
                      className="text-xs px-2 h-8"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {car.isSpecialOffer ? '✓' : '🏷️'}
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-0"
                      onClick={() => startEditing(car)}
                    >
                      <Edit className="w-4 h-4 mr-1 shrink-0" />
                      <span className="truncate">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 min-w-0"
                      onClick={() => deleteCar(car.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1 shrink-0" />
                      <span className="truncate">Delete</span>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No cars found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
