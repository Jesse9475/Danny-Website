import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Car, Search } from 'lucide-react';

interface CarSpecs {
  source: string;
  lastUpdated: string;
  make: string;
  model: string;
  year: string | number;
  bodyStyle?: string;
  engineDisplacement?: string;
  engine?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  vehicleType?: string;
  gvwr?: string;
  wheelbase?: string;
  length?: string;
  width?: string;
  height?: string;
  engineCylinders?: number;
  horsepower?: number;
  engineKW?: number;
}

export function CarSpecsLookup() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [specs, setSpecs] = useState<CarSpecs | null>(null);
  const [vin, setVin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vin || vin.length !== 17) {
      toast({
        title: t('car.specsLookup.invalidVin'),
        description: t('car.specsLookup.invalidVinDescription'),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setSpecs(null);

    try {
      const response = await fetch(`/api/cars/specifications?vin=${encodeURIComponent(vin)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.specs) {
        setSpecs(data.specs);
        toast({
          title: t('car.specsLookup.specsFound'),
          description: `${t('car.specsLookup.specsFoundFor')} ${data.specs.make} ${data.specs.model} ${data.specs.year}`,
        });
      } else {
        throw new Error(t('car.specsLookup.noSpecsFound'));
      }
    } catch (error) {
      console.error('Error fetching specs:', error);
      toast({
        title: t('car.specsLookup.lookupFailed'),
        description: error instanceof Error ? error.message : t('car.specsLookup.unknownError'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setVin('');
    setSpecs(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Car className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">{t('car.specsLookup.title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="vin">{t('car.specsLookup.vinLabel')} *</Label>
          <div className="flex gap-4">
            <Input
              id="vin"
              placeholder={t('car.specsLookup.vinPlaceholder')}
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              maxLength={17}
              className="text-sm font-mono tracking-wider flex-1"
              required
            />
            <Button
              type="submit"
              disabled={isLoading || vin.length !== 17}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              {isLoading ? (
                <>
                  <Search className="h-4 w-4 animate-spin mr-2" />
                  {t('car.specsLookup.searching')}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  {t('car.specsLookup.lookup')}
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {t('car.specsLookup.description')}
          </p>
        </div>
      </form>

      {specs && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Vehicle Specifications
            </h3>
            <Button
              onClick={async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                resetForm();
              }}
              variant="outline"
              size="sm"
            >
              New Lookup
            </Button>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-blue-700 font-medium">Make</Label>
              <div className="text-lg font-semibold text-blue-900 mt-1">{specs.make}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-blue-700 font-medium">Model</Label>
              <div className="text-lg font-semibold text-blue-900 mt-1">{specs.model}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-blue-700 font-medium">Year</Label>
              <div className="text-lg font-semibold text-blue-900 mt-1">{specs.year}</div>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-gray-700 font-medium">Body Style</Label>
              <div className="text-gray-900 mt-1">{specs.bodyStyle || 'N/A'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-gray-700 font-medium">Vehicle Type</Label>
              <div className="text-gray-900 mt-1">{specs.vehicleType || 'N/A'}</div>
            </div>
          </div>

          {/* Engine & Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-green-700 font-medium">Engine</Label>
              <div className="text-green-900 mt-1">{specs.engine || 'N/A'}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-green-700 font-medium">Transmission</Label>
              <div className="text-green-900 mt-1">{specs.transmission || 'N/A'}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-green-700 font-medium">Drive Type</Label>
              <div className="text-green-900 mt-1">{specs.driveType || 'N/A'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-green-700 font-medium">Fuel Type</Label>
              <div className="text-green-900 mt-1">{specs.fuelType || 'N/A'}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-green-700 font-medium">Engine Displacement</Label>
              <div className="text-green-900 mt-1">{specs.engineDisplacement || 'N/A'}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <Label className="text-green-700 font-medium">Engine Cylinders</Label>
              <div className="text-green-900 mt-1">{specs.engineCylinders || 'N/A'}</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Label className="text-purple-700 font-medium">Horsepower</Label>
              <div className="text-purple-900 mt-1">{specs.horsepower || 'N/A'}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Label className="text-purple-700 font-medium">Engine Power (kW)</Label>
              <div className="text-purple-900 mt-1">{specs.engineKW || 'N/A'}</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Label className="text-purple-700 font-medium">GVWR</Label>
              <div className="text-purple-900 mt-1">{specs.gvwr || 'N/A'}</div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Label className="text-orange-700 font-medium">Length</Label>
              <div className="text-orange-900 mt-1">{specs.length || 'N/A'}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Label className="text-orange-700 font-medium">Width</Label>
              <div className="text-orange-900 mt-1">{specs.width || 'N/A'}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Label className="text-orange-700 font-medium">Height</Label>
              <div className="text-orange-900 mt-1">{specs.height || 'N/A'}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Label className="text-orange-700 font-medium">Wheelbase</Label>
              <div className="text-orange-900 mt-1">{specs.wheelbase || 'N/A'}</div>
            </div>
          </div>

          {/* Source Information */}
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Source:</span> {specs.source}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Last Updated:</span> {new Date(specs.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
